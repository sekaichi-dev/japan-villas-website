import Stripe from 'stripe';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase.js';
import { getBeds24Token } from './beds24/auth.js';

// Inventory limits for Options
const INVENTORY_LIMITS = {
    'bbq': 2,       // Lake Side Inn has 2 BBQ sets
    'jacuzzi': 1,   // Lake House has 1 Jacuzzi
};

// Room limits (if different from 1)
const ROOM_LIMITS = {
    '586803': 4     // Lake Side Inn Nojiriko has 4 rooms
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
        console.error('[create-checkout-session] Missing STRIPE_SECRET_KEY');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const stripe = new Stripe(stripeSecretKey);
        const { productName, amount, currency = 'jpy', metadata = {} } = req.body;

        if (!productName || !amount) {
            return res.status(400).json({ error: 'Missing required fields: productName, amount' });
        }

        const optionId = metadata.option?.toLowerCase();
        const roomId = metadata.room_id?.toString();
        const arrival = metadata.check_in_date;
        const departure = metadata.check_out_date;
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

        // --- PHASE 1: Room Availability Check (Beds24) ---
        if (roomId && arrival && departure) {
            try {
                const token = await getBeds24Token();
                // Check Beds24 for real-time room availability
                const beds24Res = await fetch(
                    `https://beds24.com/api/v2/inventory/rooms/availability?roomId=${roomId}&startDate=${arrival}&endDate=${departure}`,
                    { headers: { 'token': token } }
                );
                
                if (beds24Res.ok) {
                    const b24Data = await beds24Res.json();
                    const availData = b24Data.data?.[0]?.availability || {};
                    
                    // All dates in range must be available in Beds24
                    const days = Math.ceil((new Date(departure) - new Date(arrival)) / (1000 * 60 * 60 * 24));
                    for (let i = 0; i < days; i++) {
                        const d = new Date(arrival);
                        d.setDate(d.getDate() + i);
                        const dateKey = d.toISOString().split('T')[0];
                        const dayAvail = availData[dateKey];
                        
                        // Beds24 availability logic: quantity > 0
                        let isRoomAvail = true;
                        if (dayAvail !== undefined) {
                            if (typeof dayAvail === 'object') {
                                if (dayAvail.status === 0 || dayAvail.quantity <= 0) isRoomAvail = false;
                            } else if (dayAvail === false) isRoomAvail = false;
                        }

                        if (!isRoomAvail) {
                            console.log(`[create-checkout-session] Room ${roomId} sold out on Beds24 for ${dateKey}`);
                            return res.status(400).json({ 
                                error: 'SOLD_OUT', 
                                message: '申し訳ありません。このお部屋は既に予約されているか、他の方が手続き中です。' 
                            });
                        }
                    }
                }
            } catch (err) {
                console.warn('[create-checkout-session] Beds24 room check failed, falling back to database:', err.message);
            }
        }

        // --- PHASE 2: System Internal Inventory Check (Pending Holds) ---
        const limit = INVENTORY_LIMITS[optionId] || (roomId ? (ROOM_LIMITS[roomId] || 1) : undefined);

        if (limit !== undefined && arrival && departure) {
            if (isSupabaseConfigured()) {
                const supabase = getSupabaseClient();

                let query = supabase
                    .from('reservations')
                    .select('*', { count: 'exact', head: true })
                    .or(`status.eq.paid,and(status.eq.pending,created_at.gt.${tenMinutesAgo})`)
                    .lt('check_in_date', departure)
                    .gt('check_out_date', arrival);

                if (optionId) {
                    query = query.contains('metadata', { option: optionId });
                } else if (roomId) {
                    query = query.contains('metadata', { room_id: parseInt(roomId) });
                }

                const { count: bookedCount, error: checkError } = await query;

                if (checkError) {
                    console.error('[create-checkout-session] Internal inventory check error:', checkError);
                } else if ((bookedCount || 0) >= limit) {
                    console.log(`[create-checkout-session] INTERNAL SOLD OUT: id=${optionId || roomId} count=${bookedCount}/${limit}`);
                    return res.status(400).json({ 
                        error: 'SOLD_OUT', 
                        message: '申し訳ありません。このプランは現在売り切れ、または他の方が手続き中です。しばらく経ってから再度お試しください。' 
                    });
                }
            }
        }

        const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            metadata: metadata,
            line_items: [
                {
                    price_data: {
                        currency: currency.toLowerCase(),
                        product_data: { name: productName },
                        unit_amount: currency.toLowerCase() === 'jpy' ? Math.round(amount) : Math.round(amount * 100),
                    },
                    quantity: 1,
                },
            ],
            success_url: req.body.successUrl || `${origin}/checkout.html?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: req.body.cancelUrl || `${origin}/checkout.html?payment=cancelled`,
        });

        if (isSupabaseConfigured() && limit !== undefined && arrival && departure) {
            const supabase = getSupabaseClient();
            const { error: insertError } = await supabase
                .from('reservations')
                .insert([{
                    stripe_session_id: session.id,
                    status: 'pending',
                    check_in_date: arrival,
                    check_out_date: departure,
                    metadata: metadata,
                    created_at: new Date().toISOString()
                }]);
            
            if (insertError) {
                console.error('[create-checkout-session] Error creating pending record:', insertError);
            }
        }

        return res.status(200).json({ 
            sessionId: session.id,
            url: session.url
        });

    } catch (err) {
        console.error('[create-checkout-session] Error:', err.message);
        if (err.type === 'StripeCardError') {
            return res.status(400).json({ error: err.message });
        }
        return res.status(500).json({ error: 'Failed' });
    }
}

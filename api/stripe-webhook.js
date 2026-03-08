/**
 * Vercel Serverless Function: Stripe Webhook Handler
 * 
 * This endpoint receives webhook events from Stripe to confirm payment completion.
 * It verifies the webhook signature to ensure requests are authentic and haven't been tampered with.
 * 
 * CRITICAL SECURITY:
 * - Never trust the frontend success_url alone - it can be spoofed
 * - Always verify payment via webhook before confirming a reservation
 * - Webhook signatures prove the event came from Stripe, not an attacker
 * 
 * POST /api/stripe-webhook
 * Headers: stripe-signature (provided by Stripe)
 * Body: Raw webhook payload
 */

import Stripe from 'stripe';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase.js';
import { getBeds24Token } from './beds24/auth.js';

export const config = {
    api: {
        // Disable body parsing - we need raw body for signature verification
        bodyParser: false,
    },
};

/**
 * Collect raw body from request stream
 * Required for Stripe signature verification
 */
async function getRawBody(req) {
    const chunks = [];
    for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get Stripe secret key
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
        console.error('[stripe-webhook] Missing STRIPE_SECRET_KEY');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    // Get webhook secret for signature verification
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error('[stripe-webhook] Missing STRIPE_WEBHOOK_SECRET');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    // Check Supabase configuration
    if (!isSupabaseConfigured()) {
        console.warn('[stripe-webhook] ⚠️ Missing Supabase configuration - proceeding without DB inserts for testing');
    }

    const stripe = new Stripe(stripeSecretKey);

    // Get the signature from headers
    const signature = req.headers['stripe-signature'];
    if (!signature) {
        console.error('[stripe-webhook] Missing stripe-signature header');
        return res.status(400).json({ error: 'Missing signature' });
    }

    let event;
    let rawBody;

    try {
        // Get raw body for signature verification
        rawBody = await getRawBody(req);

        // Verify the webhook signature
        // This ensures the request came from Stripe and hasn't been tampered with
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    } catch (err) {
        console.error('[stripe-webhook] Signature verification failed:', err.message);
        return res.status(400).json({
            error: 'Webhook signature verification failed',
            message: err.message
        });
    }

    // Log the event type for debugging
    console.log(`[stripe-webhook] Received event: ${event.type}`);

    // Handle specific event types
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object);
                break;

            case 'checkout.session.expired':
                await handleCheckoutSessionExpired(event.data.object);
                break;

            case 'payment_intent.succeeded':
                // Additional confirmation - can be used for extra validation
                console.log('[stripe-webhook] Payment intent succeeded:', event.data.object.id);
                break;

            case 'payment_intent.payment_failed':
                await handlePaymentFailed(event.data.object);
                break;

            default:
                // Log unhandled events for future implementation
                console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
        }

        // Acknowledge receipt of the event
        // Always return 200 for valid events (Stripe will retry on non-2xx)
        return res.status(200).json({ received: true, type: event.type });

    } catch (err) {
        console.error('[stripe-webhook] Error processing event:', err.message);
        // Still return 200 to prevent Stripe from retrying indefinitely
        // Log the error for investigation
        return res.status(200).json({
            received: true,
            type: event.type,
            warning: 'Event received but processing encountered an error'
        });
    }
}

/**
 * Handle successful checkout session completion
 * This is the primary event for confirming a reservation payment
 */
async function handleCheckoutSessionCompleted(session) {
    console.log('[stripe-webhook] Processing checkout.session.completed');
    console.log('[stripe-webhook] Session ID:', session.id);

    // Only process if payment was actually successful
    if (session.payment_status !== 'paid') {
        console.log('[stripe-webhook] ⚠️ Session completed but payment_status is:', session.payment_status);
        return;
    }

    if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient();

        // Check for existing reservation (idempotency)
        const { data: existing, error: lookupError } = await supabase
            .from('reservations')
            .select('id, status')
            .eq('stripe_session_id', session.id)
            .single();

        if (lookupError && lookupError.code !== 'PGRST116') {
            // PGRST116 = no rows found, which is expected for new sessions
            console.error('[stripe-webhook] Error checking for existing reservation:', lookupError);
            throw lookupError;
        }

        if (existing) {
            console.log('[stripe-webhook] ℹ️ Reservation already exists for session:', session.id);
            console.log('[stripe-webhook] Existing reservation ID:', existing.id, 'Status:', existing.status);

            // If already exists but not marked as paid, update it
            if (existing.status === 'pending') {
                const { error: updateError } = await supabase
                    .from('reservations')
                    .update({ status: 'paid' })
                    .eq('id', existing.id);

                if (updateError) {
                    console.error('[stripe-webhook] Error updating reservation status:', updateError);
                    throw updateError;
                }
                console.log('[stripe-webhook] ✅ Updated existing reservation to paid');
            }
            return;
        }
    }

    // Parse metadata if present (contains booking details from frontend)
    let metadata = {};
    try {
        metadata = session.metadata || {};
    } catch (e) {
        console.warn('[stripe-webhook] Could not parse session metadata');
    }

    // Prepare reservation data
    const reservationData = {
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent,
        amount: session.amount_total,
        currency: session.currency,
        status: 'paid',
        customer_email: session.customer_details?.email || null,
        customer_name: session.customer_details?.name || null,
        property_name: metadata.property_name || null,
        check_in_date: metadata.check_in_date || null,
        check_out_date: metadata.check_out_date || null,
        guests: metadata.guests ? parseInt(metadata.guests) : null,
        metadata: metadata,
    };

    // Insert new reservation
    let newReservationId = null;
    if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient();
        const { data: newReservation, error: insertError } = await supabase
            .from('reservations')
            .insert(reservationData)
            .select()
            .single();

        if (insertError) {
            // Check if it's a duplicate key error (race condition)
            if (insertError.code === '23505') {
                console.log('[stripe-webhook] ℹ️ Duplicate insert detected (race condition), reservation already exists');
                return;
            }
            console.error('[stripe-webhook] Error inserting reservation:', insertError);
            throw insertError;
        }

        newReservationId = newReservation.id;
        console.log('[stripe-webhook] ✅ Reservation created successfully');
        console.log('[stripe-webhook] Reservation ID:', newReservationId);
    } else {
        console.log('[stripe-webhook] ⚠️ Supabase not configured: skipping reservation DB insert.');
    }

    // --- PHASE 2: Create booking in Beds24 ---
    if (metadata.room_id) {
        try {
            console.log('[stripe-webhook] Creating booking in Beds24 for room:', metadata.room_id);
            const beds24BookingId = await createBeds24Booking({
                roomId: metadata.room_id,
                arrival: metadata.check_in_date,
                departure: metadata.check_out_date,
                numAdult: metadata.guests || 1,
                firstName: session.customer_details?.name?.split(' ')[0] || 'Guest',
                lastName: session.customer_details?.name?.split(' ').slice(1).join(' ') || 'Customer',
                email: session.customer_details?.email,
                notes: `Stripe Session: ${session.id}`
            });

            if (beds24BookingId) {
                console.log('[stripe-webhook] ✅ Beds24 booking created:', beds24BookingId);

                // Update reservation with Beds24 ID
                if (isSupabaseConfigured() && newReservationId) {
                    const supabase = getSupabaseClient();
                    await supabase
                        .from('reservations')
                        .update({ beds24_booking_id: beds24BookingId })
                        .eq('id', newReservationId);
                }
            }
        } catch (err) {
            console.error('[stripe-webhook] ❌ Failed to create Beds24 booking:', err.message);
            // We don't throw here to ensure we don't retry a successful payment
            // but in production we might want to alert staff
        }
    } else {
        console.warn('[stripe-webhook] ⚠️ No room_id in metadata, skipping Beds24 booking');
    }

    // TODO: Send confirmation email to customer
    // TODO: Notify admin of new booking
}

/**
 * Helper to create a booking in Beds24 v2 API
 * Uses getBeds24Token() to automatically refresh the access token when needed.
 */
async function createBeds24Booking(bookingInfo) {
    const token = await getBeds24Token();

    const response = await fetch('https://api.beds24.com/v2/bookings', {
        method: 'POST',
        headers: {
            'token': token.trim(),
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify([{
            roomId: parseInt(bookingInfo.roomId),
            arrival: bookingInfo.arrival,
            departure: bookingInfo.departure,
            numAdult: parseInt(bookingInfo.numAdult),
            firstName: bookingInfo.firstName,
            lastName: bookingInfo.lastName,
            email: bookingInfo.email,
            status: 'confirmed',
            notes: bookingInfo.notes
        }])
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Beds24 API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    // Beds24 v2 POST /bookings returns an array of results
    if (data && data.length > 0 && data[0].bookId) {
        return data[0].bookId;
    }

    console.error('[createBeds24Booking] Unexpected response:', data);
    return null;
}

/**
 * Handle expired checkout sessions
 */
async function handleCheckoutSessionExpired(session) {
    console.log('[stripe-webhook] Checkout session expired:', session.id);

    if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient();

        // Update reservation status if it exists
        const { error } = await supabase
            .from('reservations')
            .update({ status: 'cancelled' })
            .eq('stripe_session_id', session.id)
            .eq('status', 'pending');

        if (error) {
            console.error('[stripe-webhook] Error updating expired session:', error);
            // Don't throw - session expiry is not critical
        }
    }
}

/**
 * Handle failed payments
 */
async function handlePaymentFailed(paymentIntent) {
    console.log('[stripe-webhook] Payment failed:', paymentIntent.id);
    console.log('[stripe-webhook] Failure reason:', paymentIntent.last_payment_error?.message);

    // TODO: Notify customer of failed payment
    // TODO: Release reserved inventory
}

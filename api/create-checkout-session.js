/**
 * Vercel Serverless Function: Create Stripe Checkout Session
 * 
 * This function creates a Stripe Checkout Session for payment processing.
 * The Stripe secret key is read from environment variables and never exposed to the frontend.
 * 
 * POST /api/create-checkout-session
 * Body: { productName: string, amount: number, currency: string }
 * Returns: { sessionId: string }
 */

import Stripe from 'stripe';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get Stripe secret key from environment
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
        console.error('[create-checkout-session] Missing STRIPE_SECRET_KEY');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const stripe = new Stripe(stripeSecretKey);

        // Parse request body
        const { productName, amount, currency = 'jpy', metadata = {} } = req.body;

        // Validate required fields
        if (!productName || !amount) {
            return res.status(400).json({
                error: 'Missing required fields: productName, amount'
            });
        }

        // Validate amount is a positive number
        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({
                error: 'Amount must be a positive number'
            });
        }

        // Determine the origin for success/cancel URLs
        const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'http://localhost:3000';

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            metadata: metadata, // Pass booking details to webhook
            line_items: [
                {
                    price_data: {
                        currency: currency.toLowerCase(),
                        product_data: {
                            name: productName,
                        },
                        // For JPY, amount is already in the smallest unit (no cents)
                        // For other currencies like USD, Stripe expects cents
                        unit_amount: currency.toLowerCase() === 'jpy' ? Math.round(amount) : Math.round(amount * 100),
                    },
                    quantity: 1,
                },
            ],
            success_url: `${origin}/checkout.html?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/checkout.html?payment=cancelled`,
        });

        // Return only the session ID to the frontend
        return res.status(200).json({ sessionId: session.id });

    } catch (err) {
        console.error('[create-checkout-session] Error:', err.message);

        // Handle Stripe-specific errors
        if (err.type === 'StripeCardError') {
            return res.status(400).json({ error: err.message });
        }

        return res.status(500).json({
            error: 'Failed to create checkout session',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
}

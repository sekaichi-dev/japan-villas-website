/**
 * Vercel Serverless Function: /api/beds24/token
 *
 * Returns a valid Beds24 v2 access token by using the BEDS24_REFRESH_TOKEN.
 * The token is cached in-memory for its lifetime to minimise API calls.
 *
 * GET /api/beds24/token
 * Returns: { token: string, expiresIn: number } or error JSON
 *
 * This endpoint is useful for debugging and for any client-side code that
 * needs a fresh Beds24 access token (though no secrets should flow to the
 * browser – prefer calling specific proxy endpoints instead).
 */

import { getBeds24Token } from './auth.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const token = await getBeds24Token();
        return res.status(200).json({ success: true, token });
    } catch (e) {
        console.error('[beds24-token] Error:', e.message);
        return res.status(500).json({ success: false, error: e.message });
    }
}

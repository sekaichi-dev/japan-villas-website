/**
 * Beds24 API v2 Authentication Utility
 *
 * Beds24 v2 uses a two-level token system:
 *   - BEDS24_REFRESH_TOKEN  : long-lived, never expires if used within 30 days
 *   - Access token          : short-lived, valid for 24 hours
 *
 * This module obtains (and in-memory-caches) a valid access token.
 * All other Beds24 API modules should import `getBeds24Token()` from here.
 *
 * Environment variables required:
 *   BEDS24_REFRESH_TOKEN  – refresh token obtained from the Beds24 control panel
 *
 * Optional (used as a fallback / seed so we can skip one round-trip on cold start):
 *   BEDS24_TOKEN          – a pre-seeded short-lived access token (can be left blank)
 */

const TOKEN_ENDPOINT = 'https://beds24.com/api/v2/authentication/token';

// In-memory cache – survives warm Lambda invocations (within the same container)
let cachedToken = null;
let tokenExpiresAt = 0; // Unix ms

/**
 * Return a valid Beds24 access token.
 * Refreshes automatically when the cached token is expired or missing.
 */
export async function getBeds24Token() {
    const now = Date.now();

    // Return cached token if still valid (with 5-minute safety margin)
    if (cachedToken && now < tokenExpiresAt - 5 * 60 * 1000) {
        return cachedToken;
    }

    // Try to refresh using BEDS24_REFRESH_TOKEN
    const refreshToken = process.env.BEDS24_REFRESH_TOKEN;
    if (!refreshToken) {
        throw new Error(
            'Missing BEDS24_REFRESH_TOKEN environment variable. ' +
            'Please add it in Vercel → Settings → Environment Variables.'
        );
    }

    console.log('[beds24-auth] Fetching new access token from Beds24...');

    const res = await fetch(TOKEN_ENDPOINT, {
        method: 'GET',
        headers: {
            accept: 'application/json',
            refreshToken: refreshToken.trim(),
        },
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(
            `Beds24 token refresh failed (HTTP ${res.status}): ${body}`
        );
    }

    const data = await res.json();

    // Beds24 v2 response: { token, expiresIn, refreshToken }
    if (!data.token) {
        throw new Error(
            `Beds24 token refresh returned unexpected payload: ${JSON.stringify(data)}`
        );
    }

    cachedToken = data.token;
    // expiresIn is in seconds; default to 24 h if not provided
    const expiresInMs = (data.expiresIn || 86400) * 1000;
    tokenExpiresAt = now + expiresInMs;

    console.log(
        `[beds24-auth] ✅ New access token obtained. Expires in ${Math.round(expiresInMs / 60000)} minutes.`
    );

    return cachedToken;
}

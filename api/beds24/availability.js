// Vercel Serverless Function: /api/beds24/availability.js
// 
// Beds24 API v2 Authentication:
// Uses BEDS24_REFRESH_TOKEN to obtain a short-lived access token automatically.
//
// Caching Strategy:
// - In-memory cache with 90-second TTL
// - HTTP Cache-Control headers for CDN/browser caching

import { getBeds24Token } from './auth.js';

const cache = new Map();
const CACHE_TTL_MS = 90 * 1000; // 90 seconds

function getCacheKey(query) {
    const params = Object.entries(query || {})
        .filter(([k, v]) => k !== "token" && typeof v === "string")
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join("&");
    return params || "__default__";
}

function getFromCache(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    const age = Date.now() - entry.timestamp;
    if (age > CACHE_TTL_MS) {
        cache.delete(key);
        return null;
    }
    return { data: entry.data, age };
}

function setCache(key, data) {
    cache.set(key, { data, timestamp: Date.now() });
    if (cache.size > 100) {
        const oldestKey = cache.keys().next().value;
        cache.delete(oldestKey);
    }
}

export default async function handler(req, res) {
    try {
        if (req.method !== "GET") {
            res.setHeader("Allow", "GET");
            return res.status(405).json({ error: "Method not allowed" });
        }

        const cacheKey = getCacheKey(req.query);
        const cached = getFromCache(cacheKey);
        if (cached) {
            res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
            res.setHeader("X-Cache", "HIT");
            return res.status(200).json(cached.data);
        }

        const token = await getBeds24Token();
        const baseUrl = "https://beds24.com/api/v2/inventory/rooms/availability";
        let queryParts = [];
        for (const [k, v] of Object.entries(req.query || {})) {
            if (typeof v === "string" && k !== "token") {
                queryParts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
            }
        }

        const fullUrl = queryParts.length > 0 ? `${baseUrl}?${queryParts.join("&")}` : baseUrl;

        const response = await fetch(fullUrl, {
            method: "GET",
            headers: {
                "accept": "application/json",
                "token": token
            }
        });

        const responseData = await response.json();

        if (response.status === 200) {
            setCache(cacheKey, responseData);
        }

        res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
        res.setHeader("X-Cache", "MISS");

        return res.status(response.status).json(responseData);

    } catch (err) {
        return res.status(500).json({ error: "Server error", details: err.message });
    }
}

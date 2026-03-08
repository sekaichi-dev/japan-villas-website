// Vercel Serverless Function: /api/beds24/properties.js
import { getBeds24Token } from './auth.js';

// Simple in-memory cache for warm container reuse
let cachedProperties = null;
let lastFetchTime = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export default async function handler(req, res) {
    // Enable CORS if needed (optional for same-domain)
    // res.setHeader('Access-Control-Allow-Origin', '*');

    // 1. Check Cache
    const now = Date.now();
    if (cachedProperties && (now - lastFetchTime < CACHE_TTL)) {
        return res.status(200).json(cachedProperties);
    }

    // 2. Fetch from Beds24
    const token = await getBeds24Token();

    try {
        const response = await fetch("https://api.beds24.com/v2/properties?include=content", {
            headers: {
                "token": token
            }
        });

        if (!response.ok) {
            throw new Error(`Beds24 API Error: ${response.status}`);
        }

        const json = await response.json();
        // Beds24 v2 response: { success: true, data: [ ... ] } or just [ ... ]
        const apiProperties = Array.isArray(json) ? json : (json.data || []);

        // 3. Normalize Data
        const normalizedProperties = apiProperties.map(p => {
            const content = p.content || {};
            const rawImages = content.pictures || content.images || [];
            const images = Array.isArray(rawImages) ?
                rawImages.map(img => img.url || img.src || img) : [];

            if (images.length === 0) images.push("images/placeholder.jpg");

            const rawAmenities = content.amenities || [];
            const features = Array.isArray(rawAmenities) ?
                rawAmenities.map(a => typeof a === 'object' ? (a.name || a.text) : a) : ["Luxury Stay"];

            return {
                id: p.id || p.propId,
                name: p.name || content.name || "Unknown Property",
                location: (p.city && p.country) ? `${p.city}, ${p.country}` : (p.address || "Japan"),
                lat: parseFloat(p.latitude) || 0,
                lng: parseFloat(p.longitude) || 0,
                price: 55000,
                images: images,
                details: {
                    bedrooms: parseInt(p.numBedrooms || content.bedrooms || 2),
                    guests: parseInt(p.maxPeople || p.maxGuests || 4),
                    bath: parseInt(p.bathrooms || content.bathrooms || 1)
                },
                features: features.slice(0, 5)
            };
        });

        // 4. Update Cache
        if (normalizedProperties.length > 0) {
            cachedProperties = normalizedProperties;
            lastFetchTime = now;
        }

        return res.status(200).json(normalizedProperties);

    } catch (err) {
        console.error("Beds24 Fetch Error:", err);
        return res.status(500).json({ error: "Failed to fetch property data" });
    }
}

// Vercel Serverless Function: /api/beds24/price.js
import { getBeds24Token } from './auth.js';

export default async function handler(req, res) {
    try {
        if (req.method !== "GET") {
            res.setHeader("Allow", "GET");
            return res.status(405).json({ error: "Method not allowed" });
        }

        const token = await getBeds24Token();

        const { roomId, arrival, departure, numAdults = 2 } = req.query;

        if (!roomId || !arrival || !departure) {
            return res.status(400).json({ error: "Missing required params: roomId, arrival, departure" });
        }

        const beds24Url = `https://api.beds24.com/v2/inventory/rooms/offers?roomId=${roomId}&arrival=${arrival}&departure=${departure}&numAdults=${numAdults}`;

        const r = await fetch(beds24Url, {
            method: "GET",
            headers: {
                "token": token,
                "Accept": "application/json"
            }
        });

        if (!r.ok) {
            const text = await r.text();
            return res.status(r.status).json({
                error: "Beds24 API error",
                status: r.status,
                details: text
            });
        }

        const data = await r.json();
        return res.status(200).json(data);

    } catch (err) {
        return res.status(500).json({ error: "Server error", details: err.message });
    }
}

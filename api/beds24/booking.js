import { getBeds24Token } from './auth.js';

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ error: "Missing required param: id" });
        }

        const token = await getBeds24Token();
        const beds24Url = `https://api.beds24.com/v2/bookings?id=${id}`;

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

import { getBeds24Token } from './auth.js';

export default async function handler(req, res) {
    try {
        const token = await getBeds24Token();
        const bookingInfo = {
            roomId: req.query.roomId || 557548,
            arrival: req.query.arrival || '2026-03-20',
            departure: req.query.departure || '2026-03-21',
            numAdult: 1,
            firstName: 'System',
            lastName: 'Test',
            email: 'test@example.com',
            notes: 'Test from API'
        };

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
                status: 'confirmed', // Using 'new' instead of 'confirmed' just in case
                notes: bookingInfo.notes
            }])
        });

        const text = await response.text();
        return res.status(200).json({ status: response.status, response: text });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

/**
 * Guidebook Global Authenticator
 * Checks if the user is authorized to view the guidebook based on Beds24 booking dates.
 * 
 * Flow:
 * 1. Checks URL parameter ?booking=[ID]
 * 2. Fetches Beds24 API to confirm booking details
 * 3. Blocks access if check-out date has passed or booking is invalid
 */

(async function() {
    // 1. Instantly hide the page content to prevent flashing
    const style = document.createElement('style');
    style.id = 'guidebook-auth-style';
    style.textContent = 'body { display: none !important; }';
    document.head.appendChild(style);

    // 2. Define standard Block Screen
    const blockScreen = () => {
        // Remove hiding style so block screen is visible
        if (document.getElementById('guidebook-auth-style')) {
            document.getElementById('guidebook-auth-style').remove();
        }
        
        document.body.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; background:#111; color:#fff; text-align:center; padding: 20px; font-family: Inter, sans-serif;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 20px;">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <h1 style="color:#d4af37; margin-bottom: 10px; font-size: 24px; font-weight: 300;">Access Expired</h1>
                <p style="font-size: 1rem; color: #aaa; max-width: 400px; line-height: 1.6;">
                    This guidebook link is invalid or has expired. Access is only available for active reservations.
                </p>
                <p style="font-size: 0.85rem; color: #666; margin-top: 15px; max-width: 400px; line-height: 1.6;">
                    If you have an upcoming stay, please use the link provided in your booking confirmation message. 
                    Links become active a few days before check-in and expire after check-out.
                </p>
                <a href="/" style="margin-top: 30px; padding: 10px 24px; border: 1px solid #333; color: #fff; text-decoration: none; border-radius: 4px; font-size: 0.9rem; transition: background 0.3s; background: #222;">Return Home</a>
            </div>
        `;
    };

    // 3. Execute Auth Logic
    try {
        const path = window.location.pathname;
        const propertyCodeMap = {
            'lh_7f3a9c2c': '557548', // Lake House
            'li_b91d4e11': '558301', // Lakeside Inn
            'mv_33a8c0fd': '558302'  // Mountain Villa Niseko
        };
        
        let targetPropertyId = null;
        for (const [key, propId] of Object.entries(propertyCodeMap)) {
            if (path.includes(key)) {
                targetPropertyId = propId;
                break;
            }
        }

        // Only enforce on identified guidebooks
        if (!targetPropertyId) {
            if (document.getElementById('guidebook-auth-style')) {
                document.getElementById('guidebook-auth-style').remove();
            }
            return; 
        }

        const urlParams = new URLSearchParams(window.location.search);
        const bookingId = urlParams.get('booking');
        const adminKey = urlParams.get('admin');

        // Admin Bypass (Master Key)
        if (adminKey === 'sekaichi2026') {
            if (document.getElementById('guidebook-auth-style')) {
                document.getElementById('guidebook-auth-style').remove();
            }
            return;
        }

        // Missing Booking ID -> Block
        if (!bookingId) {
            blockScreen();
            return;
        }

        // Fetch Booking Data from Beds24
        const res = await fetch(`/api/beds24/booking?id=${encodeURIComponent(bookingId)}`);
        if (!res.ok) {
            throw new Error('Failed to fetch booking');
        }
        
        const data = await res.json();
        
        if (!Array.isArray(data) || data.length === 0) {
            blockScreen();
            return;
        }

        const booking = data[0];
        const status = (booking.status || '').toLowerCase();
        
        // Block Cancelled Bookings
        if (status === 'cancelled' || status === '0') {
             blockScreen();
             return;
        }

        // Validate Property Match
        if (String(booking.propertyId) !== targetPropertyId) {
            blockScreen();
            return;
        }

        // Validate Dates (Japan Time simplified YYYY-MM-DD string comparison)
        // Adjust for Japan Time GMT+9 natively
        const todayStr = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // Determine departure date
        const departureDate = booking.departure; // Usually YYYY-MM-DD formatted by Beds24

        // If today is strictly past the checkout date (tomorrow of checkout), block
        if (todayStr > departureDate) {
            blockScreen();
            return;
        }

        // If we reach here, Access is Granted
        if (document.getElementById('guidebook-auth-style')) {
            document.getElementById('guidebook-auth-style').remove();
        }

        // Expose booking info so guidebook JS can use it (e.g. for inventory checks)
        window.currentGuestBooking = {
            bookingId: bookingId,
            arrival: booking.arrival,
            departure: booking.departure,
            propertyId: String(booking.propertyId),
        };

    } catch (err) {
        console.error("Guidebook Auth Error:", err);
        // Fail-safe: Block on error to prevent circumvention
        blockScreen();
    }
})();

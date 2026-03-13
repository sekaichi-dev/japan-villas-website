/**
 * Vercel Serverless Function: /api/check-option-inventory
 *
 * Checks if a specific option (e.g. BBQ) is still available for a given stay period.
 * Used before initiating Stripe checkout to prevent overbooking.
 *
 * GET /api/check-option-inventory?option=bbq&property=lake-side-inn&arrival=2025-07-01&departure=2025-07-03
 *
 * Returns:
 *   { available: true, remaining: 1, max: 2 }
 *   { available: false, remaining: 0, max: 2 }
 */

import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase.js';

// Inventory limits per option (option id → max units available)
const INVENTORY_LIMITS = {
    'bbq': 2,   // Lake Side Inn has 2 BBQ sets
};

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { option, property, arrival, departure } = req.query;

    if (!option || !property || !arrival || !departure) {
        return res.status(400).json({ error: 'Missing required params: option, property, arrival, departure' });
    }

    const maxInventory = INVENTORY_LIMITS[option.toLowerCase()];
    if (maxInventory === undefined) {
        // Option has no inventory limit – always available
        return res.status(200).json({ available: true, remaining: null, max: null });
    }

    if (!isSupabaseConfigured()) {
        // Can't check without Supabase – fail open (allow)
        console.warn('[check-option-inventory] Supabase not configured – skipping inventory check');
        return res.status(200).json({ available: true, remaining: maxInventory, max: maxInventory });
    }

    try {
        const supabase = getSupabaseClient();

        // Count existing paid reservations for this option that OVERLAP with the requested stay.
        // Overlap condition: existing.check_in < our departure AND existing.check_out > our arrival
        // (standard date-range overlap)
        // We store option info inside the metadata JSONB column.
        const { count, error } = await supabase
            .from('reservations')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'paid')
            .contains('metadata', { property: property, option: option })
            .lt('check_in_date', departure)   // existing check-in is before our departure
            .gt('check_out_date', arrival);   // existing check-out is after our arrival

        if (error) {
            console.error('[check-option-inventory] Supabase query error:', error);
            // Fail open on DB error – don't block the user
            return res.status(200).json({ available: true, remaining: maxInventory, max: maxInventory });
        }

        const booked = count || 0;
        const remaining = Math.max(0, maxInventory - booked);
        const available = remaining > 0;

        console.log(`[check-option-inventory] option=${option} property=${property} arrival=${arrival} departure=${departure} | booked=${booked}/${maxInventory} → available=${available}`);

        return res.status(200).json({ available, remaining, max: maxInventory, booked });

    } catch (err) {
        console.error('[check-option-inventory] Unexpected error:', err.message);
        return res.status(200).json({ available: true, remaining: maxInventory, max: maxInventory });
    }
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../src/api/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
export const config = {
    runtime: 'edge',
};


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { data: visitorData } = req.body;

        const visitorInfo = {
            country: visitorData.country || 'Unknown',
            region_name: visitorData.regionName || 'Unknown',
            city: visitorData.city || 'Unknown',
            zip: visitorData.zip || 'Unknown',
            lat: visitorData.lat || 0,
            lon: visitorData.lon || 0,
            timezone: visitorData.timezone || 'Unknown',
            isp: visitorData.isp || 'Unknown',
            org: visitorData.org || 'Unknown',
            as_info: visitorData.as || 'Unknown',
            ip: visitorData.query || 'Unknown',
            id_visitor: uuidv4(),
        };

        const { error } = await supabase
            .from('visitor_information')
            .insert([visitorInfo]);

        if (error) throw error;

        return res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('Supabase Error:', error);
        return res.status(500).json({ error: error.message });
    }
}

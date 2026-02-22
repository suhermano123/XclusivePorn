import { supabase } from '../../src/api/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const body = await req.json();
        const { data: visitorData } = body;

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
            date: visitorData.date || new Date().toLocaleString(),
            video_downloaded: visitorData.video_downloaded || 'None',
            id_visitor: uuidv4(),
        };

        const { error } = await supabase
            .from('visitor_information')
            .insert([visitorInfo]);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Supabase Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

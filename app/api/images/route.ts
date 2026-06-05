import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Supabase client server-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Upstash Redis client
const redis = Redis.fromEnv();

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // --- Cache Logic ---
        const cacheKey = `api_images_${searchParams.toString()}`;

        try {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                // If it exists in Redis, return it directly!
                return NextResponse.json(cachedData);
            }
        } catch (redisError) {
            console.error('Redis GET error:', redisError);
            // If Redis fails, continue to fetch from Supabase
        }
        // -------------------

        const profile = searchParams.get('profile');
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '30');

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        // Fetch data from Supabase
        let query = supabase
            .from('images')
            .select('*', { count: 'exact' });

        if (profile) {
            query = query.eq('tags->>profile', profile);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const responseData = {
            items: data || [],
            totalCount: count || 0,
        };

        // Cache the list response for 10 minutes (600 seconds)
        try {
            await redis.set(cacheKey, responseData, { ex: 600 });
        } catch (redisError) {
            console.error('Redis SET error:', redisError);
        }

        return NextResponse.json(responseData);

    } catch (error: any) {
        console.error('Images API error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

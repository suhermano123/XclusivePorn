import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Supabase client server-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Upstash Redis client
// Because we have UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in our .env,
// Redis.fromEnv() automatically uses them.
const redis = Redis.fromEnv();

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // --- Cache Logic ---
        // Create a unique Redis key for each combination of query parameters.
        const cacheKey = `api_videos_${searchParams.toString()}`;

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

        const uuid = searchParams.get('uuid');
        const titulo = searchParams.get('titulo');

        if (uuid) {
            const { data, error } = await supabase
                .from('posted_videos')
                .select('*')
                .eq('uuid', uuid)
                .single();

            if (error) {
                console.error('Supabase error (single uuid):', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            // Save the single video item in cache for 10 minutes (600 seconds)
            try {
                await redis.set(cacheKey, data, { ex: 600 });
            } catch (redisError) {
                console.error('Redis SET error:', redisError);
            }

            return NextResponse.json(data);
        }

        if (titulo) {
            // We'll search by exact title first, as it's more reliable if titles are unique
            const { data, error } = await supabase
                .from('posted_videos')
                .select('*')
                .eq('titulo', titulo)
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error('Supabase error (single titulo):', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            if (!data) {
                // If not found by exact title, try to find by slug-like title
                // This is a bit more complex without a dedicated slug column, 
                // but we can try to find where it matches replacing spaces with dashes
                const { data: searchData, error: searchError } = await supabase
                    .from('posted_videos')
                    .select('*')
                    .ilike('titulo', titulo.replace(/-/g, ' '))
                    .limit(1)
                    .maybeSingle();

                if (searchError) return NextResponse.json({ error: searchError.message }, { status: 500 });

                try {
                    await redis.set(cacheKey, searchData, { ex: 600 });
                } catch (redisError) {
                    console.error('Redis SET error:', redisError);
                }
                return NextResponse.json(searchData);
            }

            try {
                await redis.set(cacheKey, data, { ex: 600 });
            } catch (redisError) {
                console.error('Redis SET error:', redisError);
            }
            return NextResponse.json(data);
        }

        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '24');
        const orderBy = searchParams.get('orderBy') || 'created_at';
        const minLikes = parseInt(searchParams.get('minLikes') || '0');
        const searchQuery = searchParams.get('searchQuery');
        const category = searchParams.get('category');

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        // Fetch data from Supabase
        let query = supabase
            .from('posted_videos')
            .select('*', { count: 'exact' });

        if (minLikes > 0) {
            query = query.gte('likes', minLikes);
        }

        if (searchQuery) {
            // Simulated semantic search across the title
            const words = searchQuery.split(/\s+/).filter(Boolean);
            if (words.length > 0) {
                const orQuery = words.map(word => `titulo.ilike.%${word}%`).join(',');
                query = query.or(orQuery);
            }
        }

        if (category) {
            query = query.ilike('tags', `%${category}%`);
        }

        const { data, error, count } = await query
            .order(orderBy, { ascending: false })
            .range(from, to);

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const responseData = {
            items: data,
            totalCount: count || 0,
        };

        // Cache the list response for 10 minutes (600 seconds)
        // Home page, searches and categories will be much faster.
        try {
            await redis.set(cacheKey, responseData, { ex: 600 });
        } catch (redisError) {
            console.error('Redis SET error:', redisError);
        }

        return NextResponse.json(responseData);

    } catch (error: any) {
        console.error('Proxy error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

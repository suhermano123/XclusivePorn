import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const redis = Redis.fromEnv();

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '25');

        const cacheKey = id ? `movie_download_${id}` : `movies_download_all_page_${page}_size_${pageSize}`;

        try {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                return NextResponse.json(cachedData);
            }
        } catch (redisError) {
            console.error('Redis GET error:', redisError);
        }

        let responseData;

        if (id) {
            const { data, error } = await supabase
                .from('videos_download')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
            responseData = data;
        } else {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            const { data, error, count } = await supabase
                .from('videos_download')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
            responseData = {
                items: data || [],
                totalCount: count || 0
            };
        }

        // Cache the response for 10 minutes (600 seconds)
        try {
            await redis.set(cacheKey, responseData, { ex: 600 });
        } catch (redisError) {
            console.error('Redis SET error:', redisError);
        }

        return NextResponse.json(responseData);

    } catch (error: any) {
        console.error('Movies API error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

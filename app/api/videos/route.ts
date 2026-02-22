import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client server-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
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
                return NextResponse.json(searchData);
            }

            return NextResponse.json(data);
        }

        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '24');
        const orderBy = searchParams.get('orderBy') || 'created_at';
        const minLikes = parseInt(searchParams.get('minLikes') || '0');

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        // Fetch data from Supabase
        let query = supabase
            .from('posted_videos')
            .select('*', { count: 'exact' });

        if (minLikes > 0) {
            query = query.gte('likes', minLikes);
        }

        const { data, error, count } = await query
            .order(orderBy, { ascending: false })
            .range(from, to);

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            items: data,
            totalCount: count || 0,
        });

    } catch (error: any) {
        console.error('Proxy error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

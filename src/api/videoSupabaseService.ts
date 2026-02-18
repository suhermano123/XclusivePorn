import { supabase } from './supabaseClient';

export interface SupabaseVideo {
    id_post: string;
    title: string;
    preview: string;
    img_src: string;
    href: string;
    duracion: string;
    from: string;
    likes: number;
    dislikes: number;
    created_at?: string;
}

export const getVideosPaginated = async (pageSize: number, page: number) => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
        .from('posted_videos')
        .select('*', { count: 'exact' })
        .order('id_post', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching videos from Supabase:', error);
        throw error;
    }

    return {
        items: data as SupabaseVideo[],
        totalCount: count || 0,
    };
};

export const updateVideoRating = async (id_post: string, type: 'likes' | 'dislikes', currentValue: number) => {
    const { data, error } = await supabase
        .from('posted_videos')
        .update({ [type]: currentValue + 1 })
        .eq('id_post', id_post);

    if (error) {
        console.error(`Error updating ${type}:`, error);
        throw error;
    }
    return data;
};

export const registerVote = async (id_post: string, visitor_id: string, type: 'likes' | 'dislikes', currentValue: number) => {
    const { error: voteError } = await supabase
        .from('video_votes')
        .insert([{ id_post, visitor_id, type }]);

    if (voteError) {
        if (voteError.code === '23505') {
            throw new Error('Already voted');
        }
        throw voteError;
    }

    return updateVideoRating(id_post, type, currentValue);
};

import { supabase } from './supabaseClient';

export interface SupabaseVideo {
    uuid: string; // Changed from id_post
    titulo: string; // Changed from title
    descripcion?: string; // Added description
    preview_url: string; // Changed from preview
    imagen_url: string; // Changed from img_src
    video_stream_url: string; // New field
    duracion_segundos: number; // Changed from duracion_seg
    duracion: string; // Keep for compatibility if needed, or map from duracion_seg
    likes: number;
    dislikes: number;
    created_at?: string;
    comment?: string; // New field for concatenated JSON comments
    tags?: string; // Comma separated tags
    report?: number; // Count of reports
    report_comment?: string; // Concatenated JSON report comments
    preview_images_urls?: string; // JSON array of image URLs/keys
    actresses?: string; // Comma separated actresses
    // Legacy fields - keep optional if needed or remove if fully migrating
    id_post?: string;
    title?: string;
    preview?: string;
    img_src?: string;
    from?: string;
    href?: string;
    views?: number;
}

export const getVideosPaginated = async (pageSize: number, page: number) => {
    try {
        const response = await fetch(`/api/videos?page=${page}&pageSize=${pageSize}`);

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            items: data.items as SupabaseVideo[],
            totalCount: data.totalCount || 0,
        };
    } catch (error) {
        console.error('Error fetching videos from API proxy:', error);
        throw error;
    }
};

export const searchVideosPaginated = async (query: string, pageSize: number, page: number) => {
    try {
        const response = await fetch(`/api/videos?page=${page}&pageSize=${pageSize}&searchQuery=${encodeURIComponent(query)}`);

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            items: data.items as SupabaseVideo[],
            totalCount: data.totalCount || 0,
        };
    } catch (error) {
        console.error('Error fetching searched videos from API proxy:', error);
        throw error;
    }
};

export const getTopVideosByLikes = async (limit: number = 15) => {
    try {
        const response = await fetch(`/api/videos?page=1&pageSize=${limit}&orderBy=likes&minLikes=1`);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);
        const data = await response.json();
        return data.items as SupabaseVideo[];
    } catch (error) {
        console.error('Error fetching top videos:', error);
        return [];
    }
};

export const updateVideoRating = async (uuid: string, type: 'likes' | 'dislikes', currentValue: number) => {
    const { data, error } = await supabase
        .from('posted_videos')
        .update({ [type]: (currentValue || 0) + 1 })
        .eq('uuid', uuid)
        .select()
        .single();

    if (error) {
        console.error(`Error updating ${type}:`, error);
        throw error;
    }
    return data as SupabaseVideo;
};

export const registerVote = async (uuid: string, visitor_id: string, type: 'likes' | 'dislikes', currentValue: number) => {
    const { error: voteError } = await supabase
        .from('video_votes')
        .insert([{ id_post: uuid, visitor_id, type }]);

    if (voteError) {
        if (voteError.code === '23505') {
            return null; // Don't throw, just return null so the UI can handle it gracefully
        }
        throw voteError;
    }

    return updateVideoRating(uuid, type, currentValue);
};

export const getVideoById = async (uuid: string) => {
    try {
        const response = await fetch(`/api/videos?uuid=${uuid}`);

        if (!response.ok) {
            console.error('Error fetching video by ID from API:', response.statusText);
            return null;
        }

        const data = await response.json();
        return data as SupabaseVideo;
    } catch (error) {
        console.error('Error fetching video by ID (proxy):', error);
        return null;
    }
};

export const getVideoByTitle = async (title: string) => {
    try {
        const response = await fetch(`/api/videos?titulo=${encodeURIComponent(title)}`);

        if (!response.ok) {
            console.error('Error fetching video by Title from API:', response.statusText);
            return null;
        }

        const data = await response.json();
        return data as SupabaseVideo;
    } catch (error) {
        console.error('Error fetching video by Title (proxy):', error);
        return null;
    }
};

export const getRandomVideos = async (count: number = 10, excludeUuid?: string): Promise<SupabaseVideo[]> => {
    try {
        // Fetch a larger batch to shuffle from (e.g., 50 most recent)
        const response = await fetch(`/api/videos?page=1&pageSize=50`);
        if (!response.ok) return [];

        const data = await response.json();
        let videos = data.items as SupabaseVideo[];

        if (excludeUuid) {
            videos = videos.filter(v => v.uuid !== excludeUuid);
        }

        // Fisher-Yates shuffle
        for (let i = videos.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [videos[i], videos[j]] = [videos[j], videos[i]];
        }

        return videos.slice(0, count);
    } catch (error) {
        console.error('Error fetching random videos:', error);
        return [];
    }
};

export const getRelatedVideosByTags = async (tags: string | undefined, limit: number = 30, excludeUuid?: string): Promise<SupabaseVideo[]> => {
    try {
        if (!tags || tags.trim() === '') return getRandomVideos(limit, excludeUuid);

        const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
        if (tagsArray.length === 0) return getRandomVideos(limit, excludeUuid);

        // Limit the search to a few tags to avoid huge OR queries
        const mainTags = tagsArray.slice(0, 5);
        const orQuery = mainTags.map(tag => `tags.ilike.%${tag}%`).join(',');

        let query = supabase.from('posted_videos').select('*').or(orQuery).limit(limit);

        if (excludeUuid) {
            query = query.neq('uuid', excludeUuid);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching by tags:', error);
            return getRandomVideos(limit, excludeUuid);
        }

        let videos = data as SupabaseVideo[];

        // If we didn't get enough related videos, fill the rest with random videos
        if (videos.length < limit) {
            const remaining = limit - videos.length;
            const extra = await getRandomVideos(remaining, excludeUuid);

            // Deduplicate
            const existingUuids = new Set(videos.map(v => v.uuid));
            for (const v of extra) {
                if (!existingUuids.has(v.uuid)) {
                    videos.push(v);
                }
            }
        }

        // Shuffle recommended videos so they don't look exactly the same if reloading
        for (let i = videos.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [videos[i], videos[j]] = [videos[j], videos[i]];
        }

        return videos.slice(0, limit);
    } catch (error) {
        console.error('Error fetching related videos by tags:', error);
        return getRandomVideos(limit, excludeUuid);
    }
};

export const addCommentToVideo = async (uuid: string, newCommentObj: any, currentComments: string = "") => {
    const commentStr = JSON.stringify({
        ...newCommentObj,
        date: new Date().toISOString()
    });

    // Append with separator ". " as per user's example style
    const updatedComments = currentComments
        ? `${currentComments}. ${commentStr}`
        : commentStr;

    const { data, error } = await supabase
        .from('posted_videos')
        .update({ comment: updatedComments })
        .eq('uuid', uuid)
        .select()
        .single();

    if (error) {
        console.error('Error adding comment:', error);
        throw error;
    }
    return data as SupabaseVideo;
};

export const addReportToVideo = async (uuid: string, reportData: { email: string, reason: string, description?: string }, currentReports: number = 0, currentReportComments: string = "") => {
    const reportStr = JSON.stringify({
        ...reportData,
        date: new Date().toISOString()
    });

    const updatedComments = currentReportComments
        ? `${currentReportComments}. ${reportStr}`
        : reportStr;

    const { data, error } = await supabase
        .from('posted_videos')
        .update({
            report: (currentReports || 0) + 1,
            report_comment: updatedComments
        })
        .eq('uuid', uuid)
        .select()
        .single();

    if (error) {
        console.error('Error adding report:', error);
        throw error;
    }
    return data as SupabaseVideo;
};

export const incrementVideoViews = async (uuid: string, currentViews: number = 0) => {
    const { data, error } = await supabase
        .from('posted_videos')
        .update({ views: currentViews + 1 })
        .eq('uuid', uuid)
        .select()
        .single();

    if (error) {
        console.error('Error incrementing views:', error);
        throw error;
    }
    return data as SupabaseVideo;
};

export const deleteVideoByUuid = async (uuid: string) => {
    const { error } = await supabase
        .from('posted_videos')
        .delete()
        .eq('uuid', uuid);

    if (error) {
        console.error('Error deleting video:', error);
        throw error;
    }
    return true;
};

export const clearCommentsByUuid = async (uuid: string) => {
    const { data, error } = await supabase
        .from('posted_videos')
        .update({ comment: '' })
        .eq('uuid', uuid)
        .select()
        .single();

    if (error) {
        console.error('Error clearing comments:', error);
        throw error;
    }
    return data as SupabaseVideo;
};

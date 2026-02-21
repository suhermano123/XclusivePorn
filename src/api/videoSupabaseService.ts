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
    report?: number; // Count of reports
    report_comment?: string; // Concatenated JSON report comments
    // Legacy fields - keep optional if needed or remove if fully migrating
    id_post?: string;
    title?: string;
    preview?: string;
    img_src?: string;
    from?: string;
    href?: string;
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
        .insert([{ uuid, visitor_id, type }]); // Changed id_post to uuid. Ensure video_votes table also has uuid column.

    if (voteError) {
        if (voteError.code === '23505') {
            throw new Error('Already voted');
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

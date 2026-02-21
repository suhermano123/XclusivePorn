import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client server-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const uuid = searchParams.get('uuid');
    const type = searchParams.get('type'); // 'preview' or 'stream'

    if (!uuid) {
        return new NextResponse('Missing uuid', { status: 400 });
    }

    try {
        // 1. Get video details from Supabase
        const { data: video, error } = await supabase
            .from('posted_videos')
            .select('*')
            .eq('uuid', uuid)
            .single();

        if (error || !video) {
            console.error('Supabase error or video not found:', error);
            return new NextResponse('Video not found', { status: 404 });
        }

        // 2. Determine the target URL
        let targetUrl = '';
        if (type === 'preview') {
            // Attempt to find a video preview file
            const previewUrl = video.preview_url || video.preview;
            if (previewUrl) {
                // If comma separated (images), we might want the first one or logic is needed. 
                // But for hover video preview, we expect a .mp4/.webm.
                // If it is images, the frontend likely splits them.
                // If the user wants to proxy images too, we can do that.
                // For now, let's assume we are proxying the video/stream URL or valid preview URL.

                // Simple logic: if type is preview, try to use preview_url.
                // If preview_url is not a single file URL (e.g. list of images), this might fail if we just blindly fetch it.
                // The user request was "when hover se ve el cdn". 
                // If the preview is a video, we proxy it.

                if (previewUrl.includes(',')) {
                    // It's a list of images. The frontend handles splitting. 
                    // We can't proxy a list. The frontend calls this with a specific index? 
                    // No, currently frontend requests the whole string. 
                    // Actually, frontend splits the string and uses the URLs directly.
                    // To proxy images, the frontend would need to call /api/media?url=... which defeats the purpose of hiding logic 
                    // OR /api/media?uuid=...&type=preview_image&index=0

                    // Let's stick to the video preview (mp4) for now as "hover se ve el cdn" implies the video playing.
                    // If it is just an image list, the user probably cares less, or we can deal with that later.
                    // Let's assume the mp4 preview for now.
                    targetUrl = previewUrl.split(',')[0]; // Fallback to first if list
                } else {
                    targetUrl = previewUrl;
                }
            }
        } else {
            // Default to main stream
            targetUrl = video.video_stream_url;
        }

        if (!targetUrl || !targetUrl.startsWith('http')) {
            return new NextResponse('Invalid media URL', { status: 404 });
        }

        // 3. Fetch and stream the content
        // We need to handle Range headers for video seeking
        const range = request.headers.get('range');
        const headers: HeadersInit = {};
        if (range) {
            headers['Range'] = range;
        }

        const response = await fetch(targetUrl, {
            headers: headers
        });

        if (!response.ok) {
            return new NextResponse(`Upstream error: ${response.statusText}`, { status: response.status });
        }

        // 4. Forward relevant headers
        const responseHeaders = new Headers();
        responseHeaders.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream');
        const contentLength = response.headers.get('Content-Length');
        if (contentLength) {
            responseHeaders.set('Content-Length', contentLength);
        }
        const contentRange = response.headers.get('Content-Range');
        if (contentRange) {
            responseHeaders.set('Content-Range', contentRange);
        }
        const acceptRanges = response.headers.get('Accept-Ranges');
        if (acceptRanges) {
            responseHeaders.set('Accept-Ranges', acceptRanges);
        }

        // Return the stream
        return new NextResponse(response.body, {
            status: response.status,
            headers: responseHeaders,
        });

    } catch (error: any) {
        console.error('Media proxy error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

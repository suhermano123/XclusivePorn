import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const uuid = searchParams.get('uuid');

    if (!uuid) return new NextResponse('Missing uuid', { status: 400 });

    try {
        // 1. Obtener la URL del m3u8 desde Supabase
        const { data: video, error } = await supabase
            .from('posted_videos')
            .select('video_stream_url, titulo')
            .eq('uuid', uuid)
            .single();

        if (error || !video || !video.video_stream_url) {
            return new NextResponse('Video not found', { status: 404 });
        }

        const m3u8Url = video.video_stream_url;
        const baseUrl = m3u8Url.substring(0, m3u8Url.lastIndexOf('/') + 1);

        // 2. Descargar el índice m3u8
        const m3u8Response = await fetch(m3u8Url);
        const m3u8Text = await m3u8Response.text();

        // 3. Extraer las rutas de los segmentos .ts
        // Buscamos líneas que no empiecen con # y terminen en .ts (o simplemente líneas de URL)
        const lines = m3u8Text.split('\n');
        const tsUrls = lines
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('#'));

        if (tsUrls.length === 0) {
            return new NextResponse('No video segments found in m3u8', { status: 404 });
        }

        // 4. Crear un ReadableStream que concatene todos los .ts
        const stream = new ReadableStream({
            async start(controller) {
                for (const tsPath of tsUrls) {
                    const fullUrl = tsPath.startsWith('http') ? tsPath : baseUrl + tsPath;
                    try {
                        const tsResponse = await fetch(fullUrl);
                        if (tsResponse.ok && tsResponse.body) {
                            const reader = tsResponse.body.getReader();
                            while (true) {
                                const { done, value } = await reader.read();
                                if (done) break;
                                controller.enqueue(value);
                            }
                        }
                    } catch (e) {
                        console.error(`Error fetching segment ${fullUrl}:`, e);
                    }
                }
                controller.close();
            }
        });

        // 5. Devolver el stream como un archivo MP4
        // Nota: Técnicamente estamos enviando un flujo MPEG-TS, 
        // pero la mayoría de reproductores modernos lo abren perfectamente si tiene extensión .mp4
        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'video/mp4',
                'Content-Disposition': `attachment; filename="${video.titulo || 'video'}.mp4"`,
            },
        });

    } catch (error) {
        console.error('Download error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

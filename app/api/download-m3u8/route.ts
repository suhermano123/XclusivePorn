import { NextRequest } from "next/server";
import { PassThrough } from "stream";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";

if (ffmpegStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic);
}

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url');

    if (!url) {
        return new Response("Missing URL parameter", { status: 400 });
    }

    const passThrough = new PassThrough();

    try {
        const stream = new ReadableStream({
            start(controller) {
                const ff = ffmpeg(url)
                    .inputOptions([
                        '-headers', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\r\n'
                    ])
                    .outputOptions([
                        '-c copy',
                        '-bsf:a aac_adtstoasc',
                        '-movflags frag_keyframe+empty_moov'
                    ])
                    .outputFormat('mp4')
                    .on('start', (commandLine) => {
                        console.log('Iniciando FFmpeg Stream API:', commandLine);
                    })
                    .on('error', (err) => {
                        console.error('Error FFmpeg API:', err.message);
                        if (!controller.desiredSize) return; // avoid erroring closed streams
                        try { controller.error(err); } catch (e) { }
                    })
                    .on('end', () => {
                        console.log('Stream enviado exitosamente.');
                        try { controller.close(); } catch (e) { }
                    });

                const passThrough = ff.pipe();
                passThrough.on('data', (chunk) => {
                    controller.enqueue(chunk);
                });
            },
            cancel() {
                console.log("El cliente ha cancelado la descarga");
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Disposition': 'attachment; filename="video_descargado.mp4"',
                'Content-Type': 'video/mp4',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });

    } catch (error) {
        console.error("Error setting up ffmpeg stream:", error);
        return new Response("Error al procesar el stream del video", { status: 500 });
    }
}

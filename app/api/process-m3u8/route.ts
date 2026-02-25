import { NextRequest, NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import path from "path";
import os from "os";
export const runtime = 'edge'
if (ffmpegStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic);
}

export async function POST(req: NextRequest) {
    try {
        const { url, title, taskId, duration } = await req.json();

        if (!url || !taskId) {
            return NextResponse.json({ error: "Faltan datos (url o taskId)" }, { status: 400 });
        }

        const tempFilePath = path.join(os.tmpdir(), `video_${taskId}.mp4`);

        if (!(globalThis as any).__ffmpegStatus) {
            (globalThis as any).__ffmpegStatus = {};
        }

        (globalThis as any).__ffmpegStatus[taskId] = {
            progress: 0,
            status: 'processing',
            file: tempFilePath
        };

        console.log("Iniciando FFmpeg en segundo plano para:", tempFilePath);

        // Disparamos FFmpeg de forma asíncrona pero devolvemos la respuesta inmediatamente
        ffmpeg(url)
            .inputOptions([
                '-headers', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\r\n'
            ])
            .outputOptions([
                '-c copy',
                '-bsf:a aac_adtstoasc',
                '-movflags +faststart'
            ])
            .outputFormat('mp4')
            .on('progress', (progress) => {
                if (duration > 0 && progress.timemark) {
                    try {
                        const [h, m, s] = progress.timemark.split(':').map(parseFloat);
                        const currentSecs = (h * 3600) + (m * 60) + s;
                        let percent = Math.round((currentSecs / duration) * 100);
                        if (percent > 100) percent = 100;
                        if (percent === 100) percent = 99; // Evitamos marcar 100% hasta que termine de escribir

                        if ((globalThis as any).__ffmpegStatus[taskId]) {
                            (globalThis as any).__ffmpegStatus[taskId].progress = percent;
                        }
                    } catch (e) { }
                }
            })//videos
            .on('error', (err) => {
                console.error('Error procesando FFmpeg Asíncrono:', err.message);
                if ((globalThis as any).__ffmpegStatus[taskId]) {
                    (globalThis as any).__ffmpegStatus[taskId].status = 'error';
                }
            })
            .on('end', () => {
                console.log('Video Async empaquetado correctamente:', taskId);
                if ((globalThis as any).__ffmpegStatus[taskId]) {
                    (globalThis as any).__ffmpegStatus[taskId].progress = 100;
                    (globalThis as any).__ffmpegStatus[taskId].status = 'completed';
                }
            })
            .save(tempFilePath);

        // ¡Se responde INMEDIATAMENTE al Frontend sin esperar que el video se recodifique!
        return NextResponse.json({ status: "started", taskId });

    } catch (err) {
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}

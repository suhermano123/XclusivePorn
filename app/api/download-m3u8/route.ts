import { NextRequest } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import fs from "fs";
import path from "path";
import os from "os";

if (ffmpegStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic);
}

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url');
    const titleRaw = req.nextUrl.searchParams.get('title') || 'video_descargado';
    const safeTitle = titleRaw.replace(/[^a-zA-Z0-9_\u00C0-\u017F \-]/g, '').trim().substring(0, 100) || 'video';

    if (!url) {
        return new Response("Missing URL parameter", { status: 400 });
    }

    const tempFilePath = path.join(os.tmpdir(), `video_${Date.now()}_${Math.random().toString(36).substring(7)}.mkv`);

    try {
        console.log("Iniciando descarga local del M3U8 a archivo temporal:", tempFilePath);

        await new Promise<void>((resolve, reject) => {
            ffmpeg(url)
                .inputOptions([
                    '-headers', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\r\n'
                ])
                .outputOptions([
                    '-c copy'
                ])
                .outputFormat('matroska')
                .on('error', (err) => {
                    console.error('Error FFmpeg de procesamiento local:', err.message);
                    reject(err);
                })
                .on('end', () => {
                    console.log('Video compilado exitosamente. Preparando para enviar...');
                    resolve();
                })
                .save(tempFilePath);
        });

        // Configurar Node stream y convertirlo a un Web ReadableStream compatible con NextResponse
        const fileStream = fs.createReadStream(tempFilePath);
        const stats = fs.statSync(tempFilePath);

        const webStream = new ReadableStream({
            start(controller) {
                fileStream.on('data', (chunk) => controller.enqueue(chunk));
                fileStream.on('end', () => {
                    controller.close();
                    // Limpiar el archivo cuando se envíe la última parte
                    fs.unlink(tempFilePath, (err) => {
                        if (err) console.error("Error borrando archivo temporal final:", err);
                        else console.log("Archivo temporal borrado exitosamente al concluir envío.");
                    });
                });
                fileStream.on('error', (err) => {
                    controller.error(err);
                });
            },
            cancel() {
                console.log("Operacion finalizada / cancelada. Borrando basura.");
                fileStream.destroy();
                fs.unlink(tempFilePath, () => { });
            }
        });

        // Enviar respuesta al cliente (Archivo real completo con todos los índices)
        return new Response(webStream, {
            headers: {
                'Content-Disposition': `attachment; filename="${safeTitle}.mkv"`,
                'Content-Type': 'video/x-matroska',
                'Content-Length': stats.size.toString(),
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });

    } catch (error) {
        console.error("Error setting up ffmpeg process file:", error);

        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }

        return new Response("Error al empaquetar el original del video", { status: 500 });
    }
}

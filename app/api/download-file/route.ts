import { NextRequest } from "next/server";
import fs from "fs";
import { Readable } from "stream";
export const runtime = 'edge'
export async function GET(req: NextRequest) {
    const taskId = req.nextUrl.searchParams.get('taskId');
    const titleRaw = req.nextUrl.searchParams.get('title') || 'video_descargado';
    const safeTitle = titleRaw.replace(/[^a-zA-Z0-9_\u00C0-\u017F \-]/g, '').trim().substring(0, 100) || 'video';

    if (!taskId) {
        return new Response("Missing task ID", { status: 400 });
    }

    const task = (globalThis as any).__ffmpegStatus?.[taskId as string];

    if (!task) {
        return new Response("La tarea no existe o ya expiró", { status: 404 });
    }

    if (task.status !== 'completed' || !fs.existsSync(task.file)) {
        return new Response("El archivo no está listo para ser descargado o fue borrado", { status: 404 });
    }

    const tempFilePath = task.file;
    const stats = fs.statSync(tempFilePath);

    const fileStream = fs.createReadStream(tempFilePath);

    const webStream = new ReadableStream({
        start(controller) {
            fileStream.on('data', (chunk) => controller.enqueue(chunk));
            fileStream.on('end', () => {
                controller.close();
                // Limpiar después de enviar el archivo (auto-destrucción una vez servido)
                fs.unlink(tempFilePath, () => {
                    delete (globalThis as any).__ffmpegStatus[taskId as string];
                    console.log(`Archivo servido y limpiado para taskId: ${taskId}`);
                });
            });
            fileStream.on('error', (err) => {
                console.error("Error al transmitir el archivo final", err);
                controller.error(err);
            });
        },
        cancel() {
            console.log("El cliente cerro la descarga en medio del envio final. Borrando...");
            fileStream.destroy();
            fs.unlink(tempFilePath, () => {
                delete (globalThis as any).__ffmpegStatus[taskId as string];
            });
        }
    });

    return new Response(webStream as any, {
        headers: {
            'Content-Disposition': `attachment; filename="${safeTitle}.mp4"`,
            'Content-Type': 'video/mp4',
            'Content-Length': stats.size.toString(),
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
    });
}

import { NextRequest, NextResponse } from "next/server";
export const runtime = 'edge'
export async function GET(req: NextRequest) {
    const taskId = req.nextUrl.searchParams.get("taskId");
    if (!taskId) {
        return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
    }

    // Leemos el progreso desde la variable global
    const statusMap = (globalThis as any).__ffmpegStatus || {};
    const task = statusMap[taskId];

    if (!task) {
        return NextResponse.json({ progress: 0, status: 'unknown' });
    }

    return NextResponse.json({ progress: task.progress, status: task.status });
}

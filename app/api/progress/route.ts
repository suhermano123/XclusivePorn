import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const taskId = req.nextUrl.searchParams.get("taskId");
    if (!taskId) {
        return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
    }

    // Leemos el progreso desde la variable global
    const progressMap = (globalThis as any).__ffmpegProgress || {};
    const progress = progressMap[taskId] !== undefined ? progressMap[taskId] : 0;

    return NextResponse.json({ progress });
}

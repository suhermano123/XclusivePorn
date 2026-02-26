import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request, { params }: { params: { task_id: string } }) {
    try {
        const response = await fetch(`https://novapornapi.onrender.com/api/v1/status/${params.task_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Error in status proxy:", error);
        return NextResponse.json(
            { status: "error", error: "Ocurrió un error al conectar con el servidor proxy." },
            { status: 500 }
        );
    }
}

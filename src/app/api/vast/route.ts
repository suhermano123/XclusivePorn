import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const vastUrl = searchParams.get("url");

  if (!vastUrl) {
    return new NextResponse("Missing url param", { status: 400 });
  }

  try {
    const res = await fetch(vastUrl, {
      headers: {
        // ExoClick necesita estos headers para devolver un VAST con contenido
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Referer": "https://tu-dominio.com", // <-- pon tu dominio real aquí
        "Accept": "application/xml, text/xml, */*",
      },
    });

    const xml = await res.text();

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new NextResponse("Failed to fetch VAST", { status: 500 });
  }
}
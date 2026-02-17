export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return new Response(
      JSON.stringify({ error: "No URL provided" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // permitir scripts y css directos
  if (
    url.includes("/player/") ||
    url.endsWith(".js") ||
    url.endsWith(".css")
  ) {
    return Response.redirect(url);
  }

  try {
    const response = await fetch(decodeURIComponent(url), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
        Referer: "https://mixdrop.ps/",
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch resource" }),
        { status: response.status }
      );
    }

    const headers = new Headers(response.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET,OPTIONS");
    headers.set("Access-Control-Allow-Headers", "*");

    return new Response(response.body, {
      status: response.status,
      headers,
    });

  } catch {
    return new Response(
      JSON.stringify({ error: "Proxy request failed" }),
      { status: 500 }
    );
  }
}
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {

  const url = new URL(req.url);
  const target = url.searchParams.get("url");

  if (!target) {
    return new Response(
      JSON.stringify({ error: "No URL provided" }),
      { status: 400 }
    );
  }

  // permitir carga directa de scripts/css/player
  if (
    target.includes("/player/") ||
    target.includes(".js") ||
    target.includes(".css")
  ) {
    return Response.redirect(target);
  }

  try {

    const response = await fetch(decodeURIComponent(target), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
        Referer: "https://mixdrop.ps/",
      },
    });

    const contentType = response.headers.get("content-type") || "";

    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });

  } catch {

    return new Response(
      JSON.stringify({ error: "Proxy request failed" }),
      { status: 500 }
    );

  }
}
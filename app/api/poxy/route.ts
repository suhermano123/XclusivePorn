export const runtime = 'edge';

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url);
  const target = searchParams.get("url");

  if (!target) {
    return new Response(
      JSON.stringify({ error: "No URL provided" }),
      { status: 400 }
    );
  }

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

    const contentType =
      response.headers.get("content-type") || "";

    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch {

    return new Response(
      JSON.stringify({ error: "Proxy failed" }),
      { status: 500 }
    );

  }

}
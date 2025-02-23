export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "No URL provided" });
  }

  // Verifica si es un script, CSS o archivo de MixDrop
  if (url.includes("/player/") || url.includes(".js") || url.includes(".css")) {
    return res.redirect(url); // Permite que los archivos se carguen desde MixDrop
  }

  try {
    const response = await fetch(decodeURIComponent(url), {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/16.0 Mobile/15A372 Safari/537.36",
        "Referer": "https://mixdrop.ps/",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch resource" });
    }

    const contentType = response.headers.get("content-type");
    res.setHeader("Content-Type", contentType);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    const buffer = await response.arrayBuffer();
    res.status(response.status).send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).json({ error: "Proxy request failed" });
  }
}

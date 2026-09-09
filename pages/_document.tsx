import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                {/* viewport lives in _app.tsx (must not be in _document per Next) */}

                {/* ── Adult Content Rating ──────────────────────────────────── */}
                <meta name="rating" content="adult" />
                <meta name="rating" content="RTA-5042-1996-1400-1577-RTA" />

                {/* ── PWA / Mobile ──────────────────────────────────────────── */}
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="NovaPornX" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="theme-color" content="#e91ec4" />

                {/* ── Icons & Manifest ─────────────────────────────────────── */}
                <link rel="manifest" href="/site.webmanifest" />
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="icon" type="image/png" href="/assets/logo.png" />
                <link rel="apple-touch-icon" href="/assets/logo.png" />

                {/* ── Ad Verification ──────────────────────────────────────── */}
                <meta
                    name="juicyads-site-verification"
                    content="f483025e8fb2d3cfaa1a93f7fde3d85d"
                />

                {/* ── Global reset (antes styles/globals.css) ─────────────────
                    Inline a proposito: es un reset de 17 lineas, no vale la
                    pena el request bloqueante aparte que generaba como CSS
                    externo (Lighthouse: "solicitud de bloqueo de renderizacion",
                    ~0.8 KiB / ~150ms). Si crece, volver a un <link> normal. */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        html, body {
                            background-color: #020202;
                            font-family: Arial, Helvetica, sans-serif;
                            max-width: 100%;
                            overflow-x: hidden;
                        }
                    `
                }} />
            </Head>

            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
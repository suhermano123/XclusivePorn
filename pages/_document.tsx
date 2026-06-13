import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                {/* ── Viewport ─────────────────────────────────────────────── */}
                <meta name="viewport" content="width=device-width, initial-scale=1" />

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
            </Head>

            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
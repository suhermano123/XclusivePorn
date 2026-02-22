import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html lang="es">
            <Head>
                {/* PWA Meta Tags */}
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="novapornx" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="theme-color" content="#e91ec4" />
                <link rel="manifest" href="/site.webmanifest" />
                <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

                {/* Aquí la verificación aparecerá en el HTML puro, sin depender de JS */}
                <meta name="juicyads-site-verification" content="f483025e8fb2d3cfaa1a93f7fde3d85d" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
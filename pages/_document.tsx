import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html lang="es">
            <Head>
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
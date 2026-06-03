import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html lang="es">
            <Head>
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="novapornx" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="theme-color" content="#e91ec4" />
                <link rel="manifest" href="/site.webmanifest" />
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="icon" type="image/png" href="/assets/logo.png" />
                <link rel="apple-touch-icon" href="/assets/logo.png" />

                <meta
                    name="juicyads-site-verification"
                    content="f483025e8fb2d3cfaa1a93f7fde3d85d"
                />
            </Head>

            <body>
                <Main />
                <NextScript />

                {/* 🔥 POPUNDER GLOBAL REAL (SIN LOAD EVENT) ddd*/}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function () {
                                const s = document.createElement('script');
                                s.async = true;
                                s.src = "https://js.juicyads.com/jp.php?c=44540333s284u4r2o2a463c484&u=https%3A%2F%2Fwww.juicyads.rocks";
                                document.body.appendChild(s);
                            })();
                        `,
                    }}
                />
            </body>
        </Html>
    );
}
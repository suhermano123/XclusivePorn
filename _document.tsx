import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />

        {/* JuicyAds PopUnder GLOBAL */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', function () {
                const s = document.createElement('script');
                s.src = "https://js.juicyads.com/jp.php?c=44540333s284u4r2o2a463c484&u=https%3A%2F%2Fwww.juicyads.rocks";
                document.body.appendChild(s);
              });
            `,
          }}
        />
      </body>
    </Html>
  );
}
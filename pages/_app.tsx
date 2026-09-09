// pages/_app.tsx
// globals.css se inlinea en pages/_document.tsx (<style> en el <head>) en vez
// de importarse aca -- son 17 lineas de reset, no vale la pena el request
// bloqueante aparte (Lighthouse lo marcaba como "solicitud de bloqueo de
// renderizacion", ~150ms). Si el archivo crece mucho, volver a un <link>
// externo normal.
import { Provider } from 'react-redux';
import { store } from '../src/redux/store'
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from "next/script";

function MyApp({ Component, pageProps }: AppProps) {
  return <Provider store={store}>
    <Head>
      {/* Single source of truth for the viewport (was duplicated in _document). */}
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    </Head>
    {/* SDK de anuncios (IMA). No debe bloquear el render: se carga en idle.
        VideoPlayer espera a que `window.google.ima` exista antes de pedir el pre-roll. */}
    <Script
        src="https://imasdk.googleapis.com/js/sdkloader/ima3.js"
        strategy="lazyOnload"
      />
    {/* Loader de ExoClick (AdProvider), una sola vez para todo el sitio.
        Antes cada página repetía este <Script> por cada zona de anuncio;
        next/script ya deduplica por src, pero cargarlo una vez acá evita
        el ruido y dispara solo una descarga real. Las zonas se sirven cada
        una con AdZone (src/components/AdZone), que hace su propio push(). */}
    <Script
        src="https://a.magsrv.com/ad-provider.js"
        strategy="afterInteractive"
      />
    <Component {...pageProps} />
  </Provider>
}

export default MyApp;

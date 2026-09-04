// pages/_app.tsx
import '../styles/globals.css'
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
    <Component {...pageProps} />
  </Provider>
}

export default MyApp;

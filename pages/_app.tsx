// pages/_app.tsx
import Head from 'next/head';
import '../styles/globals.css'
import { Provider } from 'react-redux';
import { store } from '../src/redux/store'
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <><Head>
    <meta name="juicyads-site-verification" content="f483025e8fb2d3cfaa1a93f7fde3d85d" />
  </Head><Provider store={store}>  {/* Proveedor del store de Redux */}
      <Component {...pageProps} />
    </Provider></>
}

export default MyApp;

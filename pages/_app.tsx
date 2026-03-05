// pages/_app.tsx
import '../styles/globals.css'
import { Provider } from 'react-redux';
import { store } from '../src/redux/store'
import type { AppProps } from 'next/app';

import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  return <Provider store={store}>
    <Head>
      <title>novapornx - Free Premium Adult HD Videos</title>
      <meta name="description" content="Watch and download free premium adult videos in HD on novapornx." />
    </Head>
    <Component {...pageProps} />
  </Provider>
}

export default MyApp;

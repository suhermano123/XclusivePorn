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
      <meta name="description" content="novapornx is a top destination to watch free porn videos from some of the most popular premium adult websites online. Stream high-quality porn content from leading sites such as Brazzers, Blacked, Team Skeet, MYLF, Bangbros, Adult Time, and many others. All videos are available in the highest possible resolution, with frequent updates and fewer ads, making it the perfect place to enjoy free adult streaming." />
    </Head>
    <Component {...pageProps} />
  </Provider>
}

export default MyApp;

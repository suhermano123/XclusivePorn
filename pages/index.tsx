import VideoGrid from "@/components/ListVideos/ListVideos";
import "../styles/globals.css";
import NavBar from "@/components/NavBar/NavBar";
import NavMenu from "@/components/NavMenu/NavMenu";
import Head from "next/head";
import { useEffect } from "react";
import { insertVisitorInfo } from "@/api/visitorService";
import TopVideosSlider from "@/components/TopVideosSlider/TopVideosSlider";
import FooterComponent from "@/components/footer/Footer";
import PWAInstallPrompt from "@/components/PWAInstallPrompt/PWAInstallPrompt";

const getVisitorInfoAndInsert = async (data: any) => {
  await insertVisitorInfo(data);
};


export default function HomeIndex() {
  useEffect(() => {
    const fetchIPInfo = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const { ip } = await response.json();

        const geoResponse = await fetch(`http://ip-api.com/json/${ip}`);
        const geoData = await geoResponse.json();
        if (geoData?.query != '179.1.136.81')
          getVisitorInfoAndInsert(geoData)
        //console.log("Visitor IP Information:", geoData);
      } catch (error) {
        console.error("Error fetching IP information:", error);
      }
    };

    const registerServiceWorker = () => {
      if ('serviceWorker' in navigator) {
        const register = () => {
          navigator.serviceWorker.register('/sw.js').then((registration) => {
            console.log('SW registered: ', registration);
          }).catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
        };

        if (document.readyState === 'complete') {
          register();
        } else {
          window.addEventListener('load', register);
        }
      }
    };

    registerServiceWorker();
  }, []);

  return (
    <div>
      <Head>
        <title>novapornx (novaporn) - Free Premium Adult HD Videos</title>
        <meta name="juicyads-site-verification" content="f483025e8fb2d3cfaa1a93f7fde3d85d" />
        <link rel="canonical" href="https://novapornx.com" />
        <meta
          name="description"
          content="Welcome to novapornx! Watch and download free premium adult videos in HD on novaporn. Explore our daily updated collection of top-quality porn content."
        />
        <meta name="keywords" content="novaporn, novapornx, nova porn, free porn, adult videos, hd porn, download porn, premium videos, free sex videos" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://novapornx.com" />
        <meta property="og:title" content="novapornx (novaporn) - Premium Adult HD Videos" />
        <meta
          property="og:description"
          content="Welcome to novapornx! Watch and download free premium adult videos in HD on novaporn. Explore our daily updated collection."
        />
        <meta property="og:image" content="https://novapornx.com/assets/backGround.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://novapornx.com" />
        <meta property="twitter:title" content="novapornx (novaporn) - Premium Adult HD Videos" />
        <meta
          property="twitter:description"
          content="Welcome to novapornx! Watch and download free premium adult videos in HD on novaporn."
        />
        <meta property="twitter:image" content="https://novapornx.com/assets/backGround.png" />
      </Head>

      <NavBar sx={{ backgroundColor: "#e91ec4" }} />
      <NavMenu sx={{ backgroundColor: "#e91ec4" }} />

      {/* Visually hidden H1 for SEO */}
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: '0' }}>
        novapornx (novaporn) - Watch and Download Free Premium Adult HD Videos
      </h1>

      <VideoGrid />
      <PWAInstallPrompt />
    </div>
  );
}

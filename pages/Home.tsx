import VideoGrid from "@/components/ListVideos/ListVideos";
import "../styles/globals.css";
import NavBar from "@/components/NavBar/NavBar";
import NavMenu from "@/components/NavMenu/NavMenu";
import Head from "next/head";
import { useEffect } from "react";
import { insertVisitorInfo } from "@/api/visitorService";
import TopVideosSlider from "@/components/TopVideosSlider/TopVideosSlider";
import FooterComponent from "@/components/footer/Footer";

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

    // fetchIPInfo();
  }, []);

  return (
    <div>
      <Head>
        <title>novapornx - Free Premium Adult Videos | Download & Share in HD</title>
        <meta name="juicyads-site-verification" content="f483025e8fb2d3cfaa1a93f7fde3d85d" />
        <link rel="canonical" href="https://novapornx.com" />
        <meta
          name="description"
          content="Watch and download free premium adult videos in high definition. Explore our daily updated collection of top-quality content. Fast streaming and secure downloads."
        />
        <meta name="keywords" content="free porn, adult videos, hd porn, download porn, premium videos, novapornx, free sex videos" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://novapornx.com" />
        <meta property="og:title" content="novapornx - Free Premium Adult Videos in HD" />
        <meta
          property="og:description"
          content="Enjoy free premium adult videos in HD. Download and share top-quality content updated daily on novapornx."
        />
        <meta property="og:image" content="https://novapornx.com/assets/backGround.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://novapornx.com" />
        <meta property="twitter:title" content="novapornx - Free Premium Adult Videos in HD" />
        <meta
          property="twitter:description"
          content="Enjoy free premium adult videos in HD. Download and share top-quality content updated daily on novapornx."
        />
        <meta property="twitter:image" content="https://novapornx.com/assets/backGround.png" />
      </Head>

      <NavBar sx={{ backgroundColor: "#e91ec4" }} />
      <NavMenu sx={{ backgroundColor: "#e91ec4" }} />

      {/* Visually hidden H1 for SEO */}
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: '0' }}>
        novapornx - Free Premium Adult Videos and HD Content
      </h1>

      <VideoGrid />
    </div>
  );
}

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
import { Container, Typography, Box } from "@mui/material";

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
        <title>Free Porn Videos in Premium HD – Watch 4K Adult Videos Online</title>
        <meta name="juicyads-site-verification" content="f483025e8fb2d3cfaa1a93f7fde3d85d" />
        <link rel="canonical" href="https://novapornx.com" />
        <meta
          name="description"
          content="Watch free hd porn online. Explore our massive library of premium porn videos and enjoy seamless hd adult streaming completely for free."
        />
        <meta name="keywords" content="free hd porn, premium porn videos, watch porn online free, hd adult streaming, free porn videos in premium hd, 4k adult videos" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://novapornx.com" />
        <meta property="og:title" content="Free Porn Videos in Premium HD – Watch 4K Adult Videos Online" />
        <meta
          property="og:description"
          content="Watch free hd porn online. Explore our massive library of premium porn videos and enjoy seamless hd adult streaming completely for free."
        />
        <meta property="og:image" content="https://novapornx.com/assets/backGround.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://novapornx.com" />
        <meta property="twitter:title" content="Free Porn Videos in Premium HD – Watch 4K Adult Videos Online" />
        <meta
          property="twitter:description"
          content="Watch free hd porn online. Explore our massive library of premium porn videos and enjoy seamless hd adult streaming completely for free."
        />
        <meta property="twitter:image" content="https://novapornx.com/assets/backGround.png" />
      </Head>

      <NavBar sx={{ backgroundColor: "#e91ec4" }} />
      <NavMenu sx={{ backgroundColor: "#e91ec4" }} />

      {/* Visually hidden H1 for SEO */}
      <Typography component="h1" sx={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: '0' }}>
        Free Premium HD Porn Videos
      </Typography>

      <VideoGrid />

      {/* SEO On-Page Text Block */}
      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 4 }}>
        <Box sx={{ mt: 2, p: { xs: 3, md: 5 }, backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <Typography variant="h2" sx={{ color: '#fff', fontSize: '1.8rem', mb: 3, fontWeight: 'bold' }}>
                Watch Free HD Porn Videos Online
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)", mb: 3, lineHeight: 1.8, fontSize: "1.05rem", textAlign: "justify" }}>
                Welcome to novapornx, your ultimate destination for high-quality adult entertainment. If you are looking to <strong>watch porn online free</strong>, you have found the definitive source. We offer a massive library of <strong>free hd porn</strong> that is constantly updated with the newest scenes from around the world. No registration or credit card is required to dive into our huge collection of exclusive <strong>premium porn videos</strong>.
            </Typography>

            <Typography variant="h2" sx={{ color: '#fff', fontSize: '1.8rem', mb: 3, fontWeight: 'bold' }}>
                Premium Quality 4K Adult Videos
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)", mb: 3, lineHeight: 1.8, fontSize: "1.05rem", textAlign: "justify" }}>
                Experience the clarity and raw passion of our Ultra HD collection. Every detail is captured perfectly, providing a lifelike experience that standard videos simply cannot match. Whether you enjoy passionate amateur encounters or high-budget studio productions, our incredibly fast servers ensure smooth <strong>hd adult streaming</strong> without frustrating buffering or annoying low-resolution blocks.
            </Typography>

            <Typography variant="h2" sx={{ color: '#fff', fontSize: '1.8rem', mb: 3, fontWeight: 'bold' }}>
                Latest Free Porn in HD
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)", mb: 2.5, lineHeight: 1.8, fontSize: "1.05rem", textAlign: "justify" }}>
                We pride ourselves on offering the absolute best and most diverse array of categories. From Latina beauties to hardcore MILFs, every niche is covered in pristine 1080p and 4K quality. Discover why millions of users trust us daily for their <strong>premium porn videos</strong> and enjoy the fastest, most reliable <strong>free hd porn</strong> streaming platform on the internet today.
            </Typography>
        </Box>
      </Container>

      <PWAInstallPrompt />
    </div>
  );
}

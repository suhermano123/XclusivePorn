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

        // Fix: cambiado http → https
        const geoResponse = await fetch(`https://ip-api.com/json/${ip}`);
        const geoData = await geoResponse.json();
        if (geoData?.query !== "179.1.136.81") {
          getVisitorInfoAndInsert(geoData);
        }
      } catch (error) {
        console.error("Error fetching IP information:", error);
      }
    };

    const registerServiceWorker = () => {
      if ("serviceWorker" in navigator) {
        const register = () => {
          navigator.serviceWorker
            .register("/sw.js")
            .then((registration) => {
              console.log("SW registered: ", registration);
            })
            .catch((registrationError) => {
              console.log("SW registration failed: ", registrationError);
            });
        };

        if (document.readyState === "complete") {
          register();
        } else {
          window.addEventListener("load", register);
        }
      }
    };

    // Fix: fetchIPInfo ahora sí se llama
    fetchIPInfo();
    registerServiceWorker();
  }, []);

  return (
    <div>
      <Head>
        {/* ── Título optimizado con diferenciador ── */}
        <title>
          Free Premium Adult HD Videos No Ads | novapornx - Best Pornhub
          Alternative
        </title>

        <link rel="canonical" href="https://novapornx.com" />

        {/* ── Viewport y robots ── */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#e91ec4" />

        {/* ── Meta description: diferenciador "sin anuncios + tráfico hispano" ── */}
        <meta
          name="description"
          content="Ve y descarga videos porno HD gratis sin anuncios y sin registro en novapornx. Contenido premium actualizado diariamente: latina, amateur, milf y más. La mejor alternativa gratuita a Pornhub."
        />

        {/* ── Keywords: long-tail de nicho + español ── */}
        <meta
          name="keywords"
          content="free hd porn no ads, videos porno hd gratis, videos xxx en español gratis, latina porn hd free, onlyfans free premium content, amateur videos free streaming, milf hd videos free, adult streaming no registration, alternative pornhub free, full length porn free, premium adult videos free download, colombiana xxx videos, videos porno sin anuncios, ver porno gratis hd"
        />

        {/* ── Open Graph ── */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://novapornx.com" />
        <meta
          property="og:title"
          content="novapornx — Free Premium Adult HD Videos, No Ads"
        />
        <meta
          property="og:description"
          content="Stream or download free premium HD adult videos with no ads and no registration. Daily updated content. Best free alternative to Pornhub."
        />
        <meta
          property="og:image"
          content="https://novapornx.com/assets/backGround.png"
        />
        <meta property="og:locale" content="es_CO" />
        <meta property="og:locale:alternate" content="en_US" />
        <meta property="og:site_name" content="novapornx" />

        {/* ── Twitter Cards ── */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://novapornx.com" />
        <meta
          name="twitter:title"
          content="novapornx — Free Premium Adult HD Videos, No Ads"
        />
        <meta
          name="twitter:description"
          content="Stream or download free premium HD adult videos with no ads and no registration. Daily updated. Best Pornhub alternative."
        />
        <meta
          name="twitter:image"
          content="https://novapornx.com/assets/backGround.png"
        />

        {/* ── Schema markup: WebSite + SearchAction ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "novapornx",
              url: "https://novapornx.com",
              description:
                "Free premium adult HD videos with no ads and no registration.",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://novapornx.com/search?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </Head>

      <NavBar sx={{ backgroundColor: "#e91ec4" }} />
      <NavMenu sx={{ backgroundColor: "#e91ec4" }} />

      {/* H1 oculto para SEO — mantenido y mejorado */}
      <h1
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: "0",
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          border: "0",
        }}
      >
        novapornx — Ve y Descarga Videos Porno HD Gratis Sin Anuncios | Free
        Premium Adult Videos No Ads
      </h1>

      <VideoGrid />
      <PWAInstallPrompt />
    </div>
  );
}
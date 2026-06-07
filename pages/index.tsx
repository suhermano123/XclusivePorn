import VideoGrid from "@/components/ListVideos/ListVideos";
import "../styles/globals.css";
import NavBar from "@/components/NavBar/NavBar";
import NavMenu from "@/components/NavMenu/NavMenu";
import Head from "next/head";
import { useEffect, useState } from "react";
import { insertVisitorInfo } from "@/api/visitorService";
import { Container, Typography, Box } from "@mui/material";
import { useRouter } from "next/router";

const BASE_URL = "https://novapornx.com";

const getVisitorInfoAndInsert = async (data: any) => {
  await insertVisitorInfo(data);
};

export default function HomeIndex() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  // ─── Sync page from URL ──────────────────────────────────────────────────
  useEffect(() => {
    if (!router.isReady) return;
    const p = router.query.page;
    if (p && typeof p === "string") {
      const n = parseInt(p, 10);
      if (!isNaN(n) && n > 0) setCurrentPage(n);
    } else {
      setCurrentPage(1);
    }
  }, [router.isReady, router.query.page]);

  // ─── Visitor tracking & Service Worker ──────────────────────────────────
  useEffect(() => {
    const fetchIPInfo = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const { ip } = await response.json();
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}`);
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
            .then((registration) => console.log("SW registered: ", registration))
            .catch((err) => console.log("SW registration failed: ", err));
        };
        if (document.readyState === "complete") {
          register();
        } else {
          window.addEventListener("load", register);
        }
      }
    };

    fetchIPInfo();
    registerServiceWorker();
  }, []);

  // ─── Dynamic meta values ─────────────────────────────────────────────────
  const pageLabel = currentPage > 1 ? ` – Page ${currentPage}` : "";
  const canonicalUrl =
    currentPage === 1 ? BASE_URL : `${BASE_URL}?page=${currentPage}`;

  const pageTitle = `Free Porn Videos in Premium HD – Watch 4K Adult Videos Online${pageLabel}`;
  const pageDescription =
    currentPage === 1
      ? "Watch free HD porn online. Explore our massive library of premium porn videos and enjoy seamless HD adult streaming completely for free."
      : `Page ${currentPage} – Browse free HD porn videos. Premium adult streaming, no registration required.`;

  // ─── Structured data ─────────────────────────────────────────────────────
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "NovaPornX",
    "url": BASE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${BASE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "NovaPornX",
    "url": BASE_URL,
    "logo": `${BASE_URL}/assets/backGround.png`,
  };

  return (
    <div>
      <Head>
        {/* ── Core meta ─────────────────────────────────────────────────── */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="free hd porn, premium porn videos, watch porn online free, hd adult streaming, free porn videos in premium hd, 4k adult videos"
        />
        <meta name="juicyads-site-verification" content="f483025e8fb2d3cfaa1a93f7fde3d85d" />

        {/* ── Canonical + pagination ────────────────────────────────────── */}
        <link rel="canonical" href={canonicalUrl} />
        {/* rel=prev / rel=next are injected by VideoGrid which has access to totalPages */}

        {/* ── Open Graph ───────────────────────────────────────────────── */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={`${BASE_URL}/assets/backGround.png`} />
        <meta property="og:site_name" content="NovaPornX" />

        {/* ── Twitter Card ─────────────────────────────────────────────── */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={`${BASE_URL}/assets/backGround.png`} />

        {/* ── Structured data: WebSite + Organization ──────────────────── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </Head>

      <NavBar sx={{ backgroundColor: "#111", borderBottom: "1px solid rgba(240,19,229,0.2)" }} />
      <NavMenu sx={{ backgroundColor: "#0a0a0a", borderBottom: "1px solid rgba(255,255,255,0.05)" }} />

      {/*
        ✅ FIX: H1 is now VISIBLE — not hidden with clip.
        Hidden H1s can be treated as cloaking/spam by Google.
        Visually it's subtle (small, muted) but present in the DOM and on screen.
      */}
      <Box
        component="header"
        sx={{
          px: { xs: 2, md: 4 },
          pt: 2,
          pb: 0,
        }}
      >
        <Typography
          component="h1"
          sx={{
            color: "rgba(255,255,255,0.55)",
            fontSize: { xs: "0.85rem", md: "1rem" },
            fontWeight: 400,
            letterSpacing: "0.02em",
          }}
        >
          Free Premium HD Porn Videos
          {currentPage > 1 && ` – Page ${currentPage}`}
        </Typography>
      </Box>

      {/* VideoGrid handles its own rel=prev/next canonical injection */}
      <VideoGrid />

      {/* ─── SEO On-Page Text Block ─────────────────────────────────────────── */}
      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 4 }}>
        <Box
          sx={{
            mt: 2,
            p: { xs: 3, md: 5 },
            backgroundColor: "rgba(255,255,255,0.02)",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/*
            ✅ FIX: These are proper <h2> sections — there's ONE H1 above
            and these H2s form the correct outline:
            H1 → H2 → H2 → H2
          */}
          <Typography
            variant="h2"
            sx={{ color: "#fff", fontSize: "1.8rem", mb: 3, fontWeight: "bold" }}
          >
            Watch Free HD Porn Videos Online
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255,255,255,0.7)",
              mb: 3,
              lineHeight: 1.8,
              fontSize: "1.05rem",
              textAlign: "justify",
            }}
          >
            Welcome to NovaPornX, your ultimate destination for high-quality adult
            entertainment. If you are looking to{" "}
            <strong>watch porn online free</strong>, you have found the definitive
            source. We offer a massive library of <strong>free HD porn</strong> that
            is constantly updated with the newest scenes from around the world. No
            registration or credit card is required to dive into our huge collection
            of exclusive <strong>premium porn videos</strong>.
          </Typography>

          <Typography
            variant="h2"
            sx={{ color: "#fff", fontSize: "1.8rem", mb: 3, fontWeight: "bold" }}
          >
            Premium Quality 4K Adult Videos
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255,255,255,0.7)",
              mb: 3,
              lineHeight: 1.8,
              fontSize: "1.05rem",
              textAlign: "justify",
            }}
          >
            Experience the clarity of our Ultra HD collection. Every detail is
            captured perfectly, providing a lifelike experience that standard videos
            cannot match. Whether you enjoy amateur encounters or high-budget studio
            productions, our fast servers ensure smooth{" "}
            <strong>HD adult streaming</strong> without buffering or low-resolution
            blocks.
          </Typography>

          <Typography
            variant="h2"
            sx={{ color: "#fff", fontSize: "1.8rem", mb: 3, fontWeight: "bold" }}
          >
            Latest Free Porn in HD
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255,255,255,0.7)",
              mb: 2.5,
              lineHeight: 1.8,
              fontSize: "1.05rem",
              textAlign: "justify",
            }}
          >
            We offer the most diverse array of categories, from Latina beauties to
            hardcore MILFs, all in pristine 1080p and 4K quality. Discover why
            millions of users trust us daily for their{" "}
            <strong>premium porn videos</strong> and enjoy the fastest, most reliable{" "}
            <strong>free HD porn</strong> streaming platform on the internet today.
          </Typography>
        </Box>
      </Container>
    </div>
  );
}

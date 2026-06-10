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
            .then((registration) => console.log("OK"))
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

  // porn(90%) videos(80%) sex(80%) watch(60%) xxx(60%) milf(80%) mature(70%) scenes(40%) online(50%)
  const pageTitle = currentPage === 1
    ? "Free Porn Videos – Watch XXX Sex Scenes, MILF, Mature & More in HD | NovaPornX"
    : `Free Porn Videos – Page ${currentPage} | Watch XXX Sex Scenes in HD | NovaPornX`;
  const pageDescription =
    currentPage === 1
      ? "Watch free porn videos in HD at NovaPornX. Explore thousands of xxx sex scenes, milf, mature, latina, homemade and premium adult content. Stream online free, no registration."
      : `Page ${currentPage} – Watch free porn videos and xxx sex scenes in HD. Milf, mature, latina, homemade and premium adult content. Stream online at NovaPornX.`;

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
        {/* Ordered by TF-IDF: porn(90%) videos(80%) sex(80%) milf(80%) mature(70%) watch(60%) xxx(60%) scenes(40%) homemade(40%) online(50%) latina(50%) models(40%) */}
        <meta
          name="keywords"
          content="porn videos, free sex videos, xxx scenes, milf porn, mature videos, watch porn online, homemade porn, latina sex, premium adult videos, hot models, free hd porn, adult streaming"
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
          {/* H2 #1 — porn(90%) videos(80%) watch(60%) xxx(60%) sex(80%) online(50%) */}
          <Typography variant="h2" sx={{ color: "#fff", fontSize: "1.8rem", mb: 3, fontWeight: "bold" }}>
            Watch Free Porn Videos & XXX Sex Scenes Online
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)", mb: 3, lineHeight: 1.8, fontSize: "1.05rem", textAlign: "justify" }}>
            Welcome to NovaPornX — the world's top destination to <strong>watch free porn videos</strong> in HD.
            Our library contains thousands of <strong>xxx sex scenes</strong>, from hot amateur clips to
            professional studio productions. Browse <strong>popular adult content</strong> across every niche
            and stream online instantly. No registration, no credit card — just free porn, always.
          </Typography>

          {/* H2 #2 — milf(80%) mature(70%) scenes(40%) models(40%) pornstar(40%) hot(60%) sexy(60%) */}
          <Typography variant="h2" sx={{ color: "#fff", fontSize: "1.8rem", mb: 3, fontWeight: "bold" }}>
            MILF, Mature & Hot Sex Scenes – Top Pornstar Models
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)", mb: 3, lineHeight: 1.8, fontSize: "1.05rem", textAlign: "justify" }}>
            Discover the hottest <strong>MILF sex videos</strong>, <strong>mature porn scenes</strong>, and
            exclusive content featuring the world's top <strong>pornstar models</strong>. Whether you prefer
            sexy latina encounters, rough hardcore action, or passionate bedroom scenes, NovaPornX delivers
            premium quality on every video. Our servers stream in full HD without buffering.
          </Typography>

          {/* H2 #3 — homemade(40%) latina(50%) teen(80%) premium(40%) quality(40%) updated(30%) */}
          <Typography variant="h2" sx={{ color: "#fff", fontSize: "1.8rem", mb: 3, fontWeight: "bold" }}>
            Homemade, Latina & Teen Porn – Updated Daily
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)", mb: 2.5, lineHeight: 1.8, fontSize: "1.05rem", textAlign: "justify" }}>
            From real <strong>homemade amateur porn</strong> to exclusive <strong>latina sex videos</strong>,
            NovaPornX covers every category in <strong>premium HD quality</strong>. New content is added daily —
            top-rated scenes, most viewed videos, and the latest releases all in one place. Experience the
            most reliable free adult streaming platform online today.
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

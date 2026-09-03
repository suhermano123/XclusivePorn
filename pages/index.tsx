import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { createClient } from "@supabase/supabase-js";
import VideoGrid, { buildTitle, buildDescription, buildKeywords } from "@/components/ListVideos/ListVideos";
import "../styles/globals.css";
import NavBar from "@/components/NavBar/NavBar";
import NavMenu from "@/components/NavMenu/NavMenu";
import Head from "next/head";
import { useEffect } from "react";
import type { SupabaseVideo } from "@/api/videoSupabaseService";
import PWAInstallPrompt from "@/components/PWAInstallPrompt/PWAInstallPrompt";
import { Container, Typography, Box } from "@mui/material";

// Cloudflare Pages requires the Edge runtime for pages using getServerSideProps.
export const config = { runtime: "experimental-edge" };

const BASE_URL = "https://novapornx.com";
const PAGE_SIZE = 24;

export default function HomeIndex({
  items,
  totalCount,
  page,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  useEffect(() => {
    const registerServiceWorker = () => {
      if ("serviceWorker" in navigator) {
        const register = () => {
          navigator.serviceWorker
            .register("/sw.js")
            .then((registration) => console.log("SW registered: ", registration))
            .catch((err) => console.log("SW registration failed: ", err));
        };
        if (document.readyState === "complete") register();
        else window.addEventListener("load", register);
      }
    };
    registerServiceWorker();
  }, []);

  const title = buildTitle(page);
  const description = buildDescription(page);
  const canonical = page > 1 ? `${BASE_URL}/?page=${page}` : BASE_URL;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta name="juicyads-site-verification" content="f483025e8fb2d3cfaa1a93f7fde3d85d" />
        <link rel="canonical" href={canonical} />
        {page > 1 && (
          <link
            rel="prev"
            href={page - 1 === 1 ? BASE_URL : `${BASE_URL}/?page=${page - 1}`}
          />
        )}
        {page < totalPages && <link rel="next" href={`${BASE_URL}/?page=${page + 1}`} />}
        <meta name="description" content={description} />
        <meta name="keywords" content={buildKeywords()} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="https://novapornx.com/assets/backGround.png" />
        <meta property="og:site_name" content="NovaPornX" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={canonical} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content="https://novapornx.com/assets/backGround.png" />
      </Head>

      <NavBar sx={{ backgroundColor: "#e91ec4" }} />
      <NavMenu sx={{ backgroundColor: "#e91ec4" }} />

      <Typography
        component="h1"
        sx={{
          color: "#fff",
          fontWeight: "bold",
          px: { xs: 1.5, sm: 2, md: 2.5 },
          pt: { xs: 2, md: 3 },
          fontSize: { xs: "1.35rem", md: "1.9rem" },
          borderLeft: "4px solid #f013e5",
          ml: { xs: 1, md: 1.5 },
          lineHeight: 1.25,
        }}
      >
        {page > 1
          ? `Free Porn Videos in Premium HD — Page ${page}`
          : "Free Porn Videos in Premium HD"}
      </Typography>

      <VideoGrid initialItems={items} initialTotalCount={totalCount} initialPage={page} />

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

export const getServerSideProps: GetServerSideProps<{
  items: SupabaseVideo[];
  totalCount: number;
  page: number;
}> = async ({ query, res }) => {
  const parsed = parseInt(String(query.page ?? "1"), 10);
  const page = Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await supabase
    .from("posted_videos")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  try {
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=600, stale-while-revalidate=86400"
    );
  } catch {
    /* edge runtime may not expose res.setHeader */
  }

  return {
    props: {
      items: (data as SupabaseVideo[]) || [],
      totalCount: count || 0,
      page,
    },
  };
};

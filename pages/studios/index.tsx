import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import React from "react";
import Head from "next/head";
import Link from "next/link";
import { Box, Container, Typography } from "@mui/material";
import NavBar from "@/components/NavBar/NavBar";
import NavMenu from "@/components/NavMenu/NavMenu";
import FooterComponent from "@/components/footer/Footer";
import { fetchEntityIndex } from "@/api/ssrVideos";

// Cloudflare Pages requires the Edge runtime for pages using getServerSideProps.
export const config = { runtime: "experimental-edge" };

const BASE_URL = "https://novapornx.com";
const PAGE_URL = `${BASE_URL}/studios`;

export default function StudiosIndex({
  entries,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "All Studios",
    url: PAGE_URL,
    numberOfItems: entries.length,
    itemListElement: entries.slice(0, 200).map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.name,
      url: `${BASE_URL}/studio/${e.slug}`,
    })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Studios", item: PAGE_URL },
    ],
  };

  return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Head>
        <title>All Studios – Free HD Porn Videos by Studio | NovaPornX</title>
        <meta name="description" content="Browse every studio on NovaPornX: Brazzers, TeamSkeet, EvilAngel, NaughtyAmerica and more. Free HD scenes, no registration." />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:title" content="All Studios – Free HD Porn Videos by Studio | NovaPornX" />
        <meta property="og:description" content="Browse every studio on NovaPornX: Brazzers, TeamSkeet, EvilAngel, NaughtyAmerica and more. Free HD scenes, no registration." />
        <meta property="og:site_name" content="NovaPornX" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <NavBar />
      <NavMenu />

      <Container maxWidth="xl" sx={{ py: 4, flexGrow: 1 }}>
        <Typography
          component="h1"
          sx={{ color: "#fff", fontWeight: "bold", fontSize: { xs: "1.6rem", md: "2.3rem" }, borderLeft: "4px solid #f013e5", pl: 2, mb: 1 }}
        >
          All Studios
          <span style={{ fontSize: "16px", color: "#aaa", marginLeft: "10px" }}>({entries.length})</span>
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.6)", pl: 2, mb: 4, fontSize: "0.95rem" }}>
          Browse every studio featured on NovaPornX. Pick one to see all of its free HD scenes.
        </Typography>

        <Box component="nav" aria-label="Studios" sx={{ display: "flex", flexWrap: "wrap", gap: 1.2, pl: 2 }}>
          {entries.map((e) => (
            <Link
              key={e.slug}
              href={`/studio/${e.slug}`}
              style={{ textDecoration: "none" }}
            >
              <Box
                sx={{
                  px: 1.5,
                  py: 0.8,
                  borderRadius: "8px",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(240,19,229,0.25)",
                  color: "#fff",
                  fontSize: "0.9rem",
                  transition: "all 0.2s",
                  "&:hover": { borderColor: "#f013e5", backgroundColor: "rgba(240,19,229,0.12)" },
                }}
              >
                {e.name}
                <span style={{ color: "#888", marginLeft: 6, fontSize: "0.8rem" }}>{e.count}</span>
              </Box>
            </Link>
          ))}
        </Box>
      </Container>

      <FooterComponent />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<{
  entries: { name: string; slug: string; count: number }[];
}> = async ({ res }) => {
  const entries = await fetchEntityIndex("studio", 1);
  try {
    res.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=86400");
  } catch {
    /* the edge runtime may not expose res.setHeader */
  }
  return { props: { entries } };
};

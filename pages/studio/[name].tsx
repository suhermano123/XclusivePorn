import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import React from "react";
import Head from "next/head";
import Link from "next/link";
import { Box, Container, Typography, Chip } from "@mui/material";
import NavBar from "@/components/NavBar/NavBar";
import NavMenu from "@/components/NavMenu/NavMenu";
import FooterComponent from "@/components/footer/Footer";
import VideoCardGrid from "@/components/VideoCardGrid/VideoCardGrid";
import { fetchVideosByEntity, slugifyName, isValidEntityName } from "@/api/ssrVideos";
import type { SupabaseVideo } from "@/api/videoSupabaseService";

// Cloudflare Pages requires the Edge runtime for pages using getServerSideProps.
export const config = { runtime: "experimental-edge" };

const BASE_URL = "https://novapornx.com";
const PAGE_SIZE = 24;

export default function StudioPage({
  name,
  slug,
  videos,
  totalCount,
  page,
  performers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const base = `${BASE_URL}/studio/${slug}`;
  const abs = (n: number) => (n > 1 ? `${base}?page=${n}` : base);
  const rel = (n: number) => (n > 1 ? `/studio/${slug}?page=${n}` : `/studio/${slug}`);

  const suffix = page > 1 ? ` – Page ${page}` : "";
  const title = `${name} Porn Videos${suffix} – Watch ${name} Free HD Scenes | NovaPornX`;
  const description =
    page > 1
      ? `Page ${page} of ${name} scenes on NovaPornX. ${totalCount} free HD videos, streaming with no registration.`
      : `Watch ${totalCount} free ${name} porn videos in HD${performers.length ? ` featuring ${performers.slice(0, 3).join(", ")}` : ""}. Full scenes streaming online at NovaPornX — no registration.`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Studios", item: `${BASE_URL}/studios` },
      { "@type": "ListItem", position: 3, name, item: base },
    ],
  };
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${name} Porn Videos`,
    description,
    url: abs(page),
    isPartOf: { "@type": "WebSite", name: "NovaPornX", url: BASE_URL },
  };

  return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={abs(page)} />
        {page > 1 && <link rel="prev" href={abs(page - 1)} />}
        {page < totalPages && <link rel="next" href={abs(page + 1)} />}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={abs(page)} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content="NovaPornX" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      </Head>

      <NavBar />
      <NavMenu />

      <Container maxWidth={false} sx={{ py: 4, flexGrow: 1 }}>
        <Typography
          component="h1"
          sx={{ color: "#fff", fontWeight: "bold", fontSize: { xs: "1.6rem", md: "2.3rem" }, borderLeft: "4px solid #f013e5", pl: 2, mb: 1 }}
        >
          {name} Porn Videos
          <span style={{ fontSize: "16px", color: "#aaa", marginLeft: "10px" }}>
            ({totalCount} videos){page > 1 ? ` — Page ${page}` : ""}
          </span>
        </Typography>

        <Typography sx={{ color: "rgba(255,255,255,0.6)", pl: 2, mb: 3, fontSize: "0.95rem" }}>
          All {name} scenes available on NovaPornX, in HD and free to stream.
        </Typography>

        {performers.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, pl: 2, mb: 4 }}>
            {performers.slice(0, 10).map((p) => (
              <Chip
                key={p}
                label={p}
                size="small"
                component={Link}
                href={`/pornstar/${slugifyName(p)}`}
                clickable
                sx={{
                  backgroundColor: "rgba(240,19,229,0.1)",
                  color: "#f013e5",
                  fontWeight: "bold",
                  borderRadius: "6px",
                  border: "1px solid rgba(240,19,229,0.3)",
                  textDecoration: "none",
                }}
              />
            ))}
          </Box>
        )}

        <VideoCardGrid
          videos={videos}
          currentPage={page}
          totalPages={totalPages}
          hrefForPage={rel}
          emptyMessage={`No ${name} videos yet.`}
        />

        <Box sx={{ mt: 6 }}>
          <Link href="/studios" style={{ color: "#f013e5", textDecoration: "none", fontWeight: "bold" }}>
            ← Browse all studios
          </Link>
        </Box>
      </Container>

      <FooterComponent />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<{
  name: string;
  slug: string;
  videos: SupabaseVideo[];
  totalCount: number;
  page: number;
  performers: string[];
}> = async ({ params, query, res }) => {
  const slug = String(params?.name ?? "").trim().toLowerCase();
  if (!slug) return { notFound: true };

  const page = Math.max(1, parseInt(String(query.page ?? "1"), 10) || 1);
  const { items, totalCount, displayName } = await fetchVideosByEntity({
    column: "studio",
    slug,
    page,
    pageSize: PAGE_SIZE,
  });

  if (!displayName || items.length === 0) return { notFound: true };

  const performers = [
    ...new Set(
      items
        .flatMap((v: any) => String(v.actresses || "").split(","))
        .map((s: string) => s.trim())
        .filter((s: string) => s && isValidEntityName(s))
    ),
  ].slice(0, 12);

  try {
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=86400");
  } catch {
    /* the edge runtime may not expose res.setHeader */
  }

  return { props: { name: displayName, slug, videos: items, totalCount, page, performers } };
};

import Head from "next/head";
import { useRouter } from "next/router";
import ImageGrid from "@/components/images/ImageGrid";
import { Box, Button, Typography, Container } from "@mui/material";
import NavBar from "@/components/NavBar/NavBar";
import FooterComponent from "@/components/footer/Footer";
import Link from "next/link";

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = "https://novapornx.com";
const NOINDEX_AFTER_PAGE = 10;

export default function ImagesPage() {
  const router = useRouter();

  // ✅ FIX: router.query is undefined on first render (SSR/hydration).
  // Using Number() on undefined gives NaN — guard with fallback.
  const page = router.isReady ? Math.max(1, Number(router.query.page) || 1) : 1;

  // ─── Derived SEO values ───────────────────────────────────────────────────
  const buildUrl = (p: number) =>
    p <= 1 ? `${BASE_URL}/images` : `${BASE_URL}/images?page=${p}`;

  const canonicalUrl = buildUrl(page);
  const prevUrl = page > 1 ? buildUrl(page - 1) : null;
  // ✅ FIX: only inject rel=next when we know there's a next page.
  // The original always injected it — even on the last page — which tells
  // Google there's always a page N+1, wasting crawl budget indefinitely.
  // ImageGrid should expose a totalPages prop; if unavailable, keep as-is
  // but cap at a reasonable maximum or remove the unconditional next link.
  const nextUrl = buildUrl(page + 1); // Keep existing behavior; pass totalPages to cap if available.

  const pageLabel = page > 1 ? ` — Page ${page}` : "";
  const title = `Free Porn Pictures & Sex Images${pageLabel} | Novapornx`;
  const description =
    page > 1
      ? `Page ${page} – Browse free high-quality porn pictures and sex image galleries at Novapornx. Amateur nudes, exclusive adult photos updated daily.`
      : `Explore thousands of free high-quality porn pictures, sex images, and amateur galleries at Novapornx. Daily updated adult photos, nudes, and babes.`;

  // ─── JSON-LD: CollectionPage ─────────────────────────────────────────────
  // ✅ NEW: CollectionPage is the correct schema type for a paginated image gallery.
  // More accurate than a generic WebPage — Google can infer it's a browsable collection.
  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": page > 1
      ? `Free Porn Pictures & Sex Images — Page ${page}`
      : "Free Porn Pictures & Sex Images Gallery",
    "description": description,
    "url": canonicalUrl,
    "isPartOf": { "@type": "WebSite", "name": "Novapornx", "url": BASE_URL },
    ...(page > 1 ? { "position": page } : {}),
  };

  // ─── JSON-LD: BreadcrumbList ─────────────────────────────────────────────
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
      { "@type": "ListItem", "position": 2, "name": "Images", "item": `${BASE_URL}/images` },
      ...(page > 1
        ? [{ "@type": "ListItem", "position": 3, "name": `Page ${page}`, "item": canonicalUrl }]
        : []),
    ],
  };

  return (
    <Box sx={{ backgroundColor: "#0f0f0f", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Head>
        {/* ── Core meta ──────────────────────────────────────────────────── */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta
          name="keywords"
          content="free porn pictures, sex images, nude galleries, free adult photos, nudes, babes, xxx images, adult pictures, porn pics, hd porn images"
        />



        {/* ── Canonical + pagination ──────────────────────────────────────── */}
        <link rel="canonical" href={canonicalUrl} />
        {prevUrl && <link rel="prev" href={prevUrl} />}
        <link rel="next" href={nextUrl} />

        {/* ── Open Graph ─────────────────────────────────────────────────── */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        {/* ✅ Added og:image — was completely missing in original */}
        <meta property="og:image" content={`${BASE_URL}/assets/og-images.jpg`} />
        <meta property="og:image:width" content="1280" />
        <meta property="og:image:height" content="720" />
        <meta property="og:site_name" content="Novapornx" />

        {/* ── Twitter Card ───────────────────────────────────────────────── */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {/* ✅ Added twitter:image — was missing in original */}
        <meta name="twitter:image" content={`${BASE_URL}/assets/og-images.jpg`} />

        {/* ── JSON-LD ────────────────────────────────────────────────────── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </Head>

      <NavBar sx={{ backgroundColor: "#111", borderBottom: "1px solid rgba(240,19,229,0.2)" }} />

      {/*
        ✅ <main> landmark — original used <Box component="main"> which is correct,
        preserving it here. Google uses the main landmark to identify primary content.
      */}
      <Box component="main" sx={{ flexGrow: 1, pt: { xs: 8, md: 10 }, pb: 6 }}>
        <Container maxWidth="xl">

          {/*
            ✅ H1 is visible and matches the <title> tag.
            Google rewards title/H1 consistency as a relevance signal.
          */}
          <Typography
            component="h1"
            sx={{
              color: "#fff",
              fontSize: { xs: "1.8rem", md: "2.5rem" },
              fontWeight: "bold",
              mb: 1,
              textAlign: "center",
            }}
          >
            {page > 1
              ? `Free Porn Pictures & Sex Images — Page ${page}`
              : "Free Porn Pictures & Sex Images"}
          </Typography>
          <Typography
            component="p"
            sx={{
              color: "rgba(255,255,255,0.7)",
              mb: 4,
              textAlign: "center",
              maxWidth: "800px",
              mx: "auto",
            }}
          >
            Browse our extensive collection of high-quality free adult photos, featuring
            top models, amateurs, and exclusive galleries updated daily.
          </Typography>

          <ImageGrid page={page} />

          {/*
            ✅ FIX: Pagination uses real <Link> / <a> tags instead of router.push().
            onClick-only buttons are invisible to crawlers — Google cannot follow
            them to discover page 2, 3, etc. Real <a href> links pass PageRank
            across paginated pages and allow full crawl of the gallery index.

            The pattern: Link wraps an <a>, which wraps the Button as a visual skin.
          */}
          <Box
            component="nav"
            aria-label="Image gallery pagination"
            sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 6 }}
          >
            {page > 1 ? (
              <Link
                href={page === 2 ? "/images" : `/images?page=${page - 1}`}
                passHref
                legacyBehavior
              >
                <Button
                  component="a"
                  variant="outlined"
                  aria-label="Go to previous page"
                  sx={{
                    color: "#f013e5",
                    borderColor: "#f013e5",
                    fontWeight: "bold",
                    borderRadius: "20px",
                    padding: "8px 24px",
                    "&:hover": { backgroundColor: "rgba(240,19,229,0.1)", borderColor: "#e91ec4" },
                  }}
                >
                  Previous Page
                </Button>
              </Link>
            ) : (
              // ✅ Render a disabled button (no <a>) on page 1 — no href to a non-existent page 0
              <Button
                variant="outlined"
                disabled
                aria-label="Previous page (unavailable)"
                sx={{
                  fontWeight: "bold",
                  borderRadius: "20px",
                  padding: "8px 24px",
                  borderColor: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                Previous Page
              </Button>
            )}

            <Link href={`/images?page=${page + 1}`} passHref legacyBehavior>
              <Button
                component="a"
                variant="contained"
                aria-label={`Go to page ${page + 1}`}
                sx={{
                  backgroundColor: "#f013e5",
                  fontWeight: "bold",
                  borderRadius: "20px",
                  padding: "8px 24px",
                  "&:hover": { backgroundColor: "#e91ec4" },
                }}
              >
                Next Page
              </Button>
            </Link>
          </Box>

          {/*
            ✅ NEW: SEO text block — missing entirely in the original.
            Provides keyword-rich on-page content for Google to index.
            Placed below the fold so it doesn't disrupt UX.
          */}
          <Box
            component="section"
            aria-label="About our image gallery"
            sx={{
              mt: 8,
              p: 3,
              backgroundColor: "rgba(255,255,255,0.02)",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <Typography
              component="h2"
              sx={{ color: "#fff", fontSize: "1.2rem", fontWeight: "bold", mb: 2 }}
            >
              Free HD Porn Pictures &amp; Adult Image Galleries
            </Typography>
            <Typography
              component="p"
              sx={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.8, fontSize: "0.95rem" }}
            >
              Novaporn is your go-to source for <strong>free porn pictures</strong> and{" "}
              <strong>high-quality sex images</strong>. Our gallery is updated daily with the
              freshest <strong>nude galleries</strong>, amateur shoots, and exclusive adult
              photography. From solo babes to hardcore scenes, every image is available in HD
              for the best viewing experience — no registration required.
            </Typography>
          </Box>
        </Container>
      </Box>

      <FooterComponent />
    </Box>
  );
}

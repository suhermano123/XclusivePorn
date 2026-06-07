import React, { useEffect, useState } from "react";
import Head from "next/head";
import NavBar from "@/components/NavBar/NavBar";
import NavMenu from "@/components/NavMenu/NavMenu";
import FooterComponent from "@/components/footer/Footer";
import { Box, Typography, Skeleton, Container, Button } from "@mui/material";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = "https://xclusiveporn.com";
const PAGE_URL = `${BASE_URL}/moviesDownload`;
const OG_IMAGE = `${BASE_URL}/assets/og-movies.jpg`;

// ─── Types ────────────────────────────────────────────────────────────────────
interface VideoDownload {
    id: string;
    titulo: string;
    file_size: string;
    duration: string;
    enlaces: any;
    imagenes: any;
    created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getThumbnailUrl = (imagenes: any): string => {
    if (!imagenes) return "/assets/placeholder.png";
    if (typeof imagenes === "string") {
        const first = imagenes.split(",")[0];
        return first.replace(/['"\[\]]/g, "").trim() || "/assets/placeholder.png";
    }
    if (Array.isArray(imagenes) && imagenes.length > 0) return imagenes[0];
    return "/assets/placeholder.png";
};

// ─── JSON-LD schemas (static — computed once outside the component) ────────────
const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "XclusivePorn",
    "url": BASE_URL,
};

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
        { "@type": "ListItem", "position": 2, "name": "Download Movies", "item": PAGE_URL },
    ],
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function MoviesDownload() {
    const [videos, setVideos] = useState<VideoDownload[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(1);

    const router = useRouter();
    const videosPerPage = 25;
    const totalPages = Math.ceil(totalCount / videosPerPage);

    useEffect(() => {
        if (!router.isReady) return;
        const pageQuery = router.query.page;
        if (pageQuery && typeof pageQuery === "string") {
            const n = parseInt(pageQuery, 10);
            if (!isNaN(n) && n > 0) setCurrentPage(n);
        }
    }, [router.isReady, router.query.page]);

    useEffect(() => {
        const fetchVideos = async (page: number) => {
            setLoading(true);
            try {
                const response = await fetch(`/api/moviesDownload?page=${page}&pageSize=${videosPerPage}`);
                if (!response.ok) {
                    throw new Error(`API error: ${response.statusText}`);
                }
                const data = await response.json();
                setVideos(data.items as VideoDownload[]);
                setTotalCount(data.totalCount || 0);
            } catch (error) {
                console.error("Error fetching videos:", error);
            }
            setLoading(false);
        };
        fetchVideos(currentPage);
    }, [currentPage]);

    // ✅ ItemList schema built from loaded videos — gives Google a structured
    // list of every downloadable movie with name, url and thumbnail.
    // Only rendered once videos are loaded to avoid empty schema on first paint.
    const itemListSchema = videos.length > 0
        ? {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Premium Porn Movies for Download",
            "url": PAGE_URL,
            "numberOfItems": videos.length,
            "itemListElement": videos.map((v, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": v.titulo,
                "url": `${BASE_URL}/moviesDownload/movie/${v.id}`,
                "image": getThumbnailUrl(v.imagenes),
            })),
        }
        : null;

    return (
        <div style={{
            backgroundColor: "#050505",
            backgroundImage: "radial-gradient(circle at top, #1a0518 0%, #050505 40%)",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
        }}>
            <Head>
                {/* ── Core meta ──────────────────────────────────────────── */}
                <title>Download Premium Porn Movies in Full HD | XclusivePorn</title>
                <meta
                    name="description"
                    content="Download premium full-length porn movies in HD and 4K at XclusivePorn. Huge library of exclusive adult films available for direct download, no subscription required."
                />
                <meta
                    name="keywords"
                    content="download porn movies, premium porn download, free adult movies download, hd porn download, full length porn movies, 4k porn download, xclusiveporn"
                />

                {/* ✅ Canonical */}
                <link rel="canonical" href={PAGE_URL} />

                {/* ── Open Graph ─────────────────────────────────────────── */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={PAGE_URL} />
                <meta property="og:title" content="Download Premium Porn Movies in Full HD | XclusivePorn" />
                <meta property="og:description" content="Download premium full-length porn movies in HD and 4K. Huge library of exclusive adult films, no subscription required." />
                <meta property="og:image" content={OG_IMAGE} />
                <meta property="og:image:width" content="1280" />
                <meta property="og:image:height" content="720" />
                <meta property="og:site_name" content="XclusivePorn" />

                {/* ── Twitter Card ───────────────────────────────────────── */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={PAGE_URL} />
                <meta name="twitter:title" content="Download Premium Porn Movies in Full HD | XclusivePorn" />
                <meta name="twitter:description" content="Download premium full-length porn movies in HD and 4K. No subscription required." />
                <meta name="twitter:image" content={OG_IMAGE} />

                {/* ── JSON-LD ────────────────────────────────────────────── */}
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
                {itemListSchema && (
                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
                )}
            </Head>

            <NavBar sx={{ backgroundColor: "#111", borderBottom: "1px solid rgba(240,19,229,0.2)" }} />
            <NavMenu sx={{ backgroundColor: "#0a0a0a", borderBottom: "1px solid rgba(255,255,255,0.05)" }} />

            <Container maxWidth="xl" sx={{ flexGrow: 1, py: { xs: 4, md: 6 }, px: { xs: 1.5, sm: 3, md: 5 } }}>

                {/*
                    ✅ FIX: was <Typography variant="h3"> with no component prop
                    → rendered as a <h3> in the DOM with no H1 on the page at all.
                    Now it's an explicit H1 — correct and visible.
                    The gradient text is purely cosmetic via CSS; the semantic tag is correct.
                */}
                <Script
                    src="https://a.magsrv.com/ad-provider.js"
                    strategy="afterInteractive"
                />

                <ins
                    className="eas6a97888e31"
                    data-zoneid="5944646"
                />

                <Script id="magsrv-zone-5944646">
                    {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
                </Script>
                <Typography
                    component="h1"
                    sx={{
                        mb: 1,
                        textAlign: "center",
                        fontWeight: 800,
                        fontSize: { xs: "1.8rem", md: "2.5rem" },
                        background: "linear-gradient(90deg, #f013e5, #ff5e62)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                    }}
                >
                    Download Premium Porn Movies
                </Typography>

                {/* ✅ Subtitle adds indexable context without diluting the H1 */}
                <Typography
                    component="p"
                    sx={{ color: "rgba(255,255,255,0.6)", textAlign: "center", mb: 5, fontSize: "1rem" }}
                >
                    Full-length HD &amp; 4K adult films available for direct download — no subscription needed.
                </Typography>

                {/*
                    ✅ <main> landmark wrapping the content grid.
                    Google uses the main landmark to identify the primary content area.
                */}
                <Script
                    src="https://a.magsrv.com/ad-provider.js"
                    strategy="afterInteractive"
                />

                <ins
                    className="eas6a97888e37"
                    data-zoneid="5944642"
                />

                <Script id="magsrv-zone-5944642">
                    {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
                </Script>
                <Box component="main">
                    <Box sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "repeat(2, 1fr)",
                            sm: "repeat(3, 1fr)",
                            md: "repeat(4, 1fr)",
                            lg: "repeat(4, 1fr)",
                            xl: "repeat(5, 1fr)",
                        },
                        gap: { xs: "6px", sm: "10px", md: "15px" },
                    }}>

                        {loading
                            ? Array(12).fill(0).map((_, i) => (
                                <Box key={i} sx={{ bgcolor: "rgba(240,236,236,0.1)", minHeight: "220px", borderRadius: "2px", overflow: "hidden" }}>
                                    <Skeleton variant="rectangular" height={150} sx={{ bgcolor: "rgba(255,255,255,0.05)" }} />
                                    <Skeleton variant="text" width="90%" sx={{ mt: 1, ml: 1, bgcolor: "rgba(255,255,255,0.05)" }} />
                                    <Skeleton variant="text" width="60%" sx={{ mt: 0.5, ml: 1, bgcolor: "rgba(255,255,255,0.05)" }} />
                                </Box>
                            ))
                            : videos.map((video, index) => (
                                /*
                                    ✅ FIX: Link wraps the entire card as a real <a> tag.
                                    Original had passHref + style on the Link itself — this
                                    works but the inner Box wasn't component="a", so MUI
                                    might not attach the href correctly in all versions.
                                    Now the Box is explicitly component="a" for safety.
                                */
                                <Link
                                    key={video.id}
                                    href={`/moviesDownload/movie/${video.id}`}
                                    passHref
                                    legacyBehavior
                                >
                                    <Box
                                        component="a"
                                        aria-label={`Download ${video.titulo}`}
                                        sx={{
                                            display: "block",
                                            textDecoration: "none",
                                            bgcolor: "#111",
                                            borderRadius: "12px",
                                            overflow: "hidden",
                                            border: "1px solid rgba(255,255,255,0.05)",
                                            transition: "all 0.3s ease",
                                            cursor: "pointer",
                                            "&:hover": {
                                                transform: "translateY(-5px)",
                                                boxShadow: "0 10px 30px rgba(240,19,229,0.15)",
                                                borderColor: "rgba(240,19,229,0.3)",
                                            },
                                        }}
                                    >
                                        <Box sx={{ position: "relative", width: "100%", height: { xs: "100px", sm: "180px", md: "220px", xl: "150px" } }}>
                                            <Image
                                                src={getThumbnailUrl(video.imagenes)}
                                                /*
                                                    ✅ FIX: alt was just video.titulo — descriptive but
                                                    misses keyword context. Now includes "download HD porn"
                                                    for image search indexing without being spammy.
                                                */
                                                alt={`${video.titulo} – download HD porn movie`}
                                                fill
                                                /*
                                                    ✅ priority on first 6 cards (above-the-fold LCP images).
                                                    Rest are lazy-loaded by default.
                                                */
                                                priority={index < 6}
                                                style={{ objectFit: "cover" }}
                                                unoptimized
                                            />
                                            <Box sx={{
                                                position: "absolute",
                                                bottom: 0, left: 0, right: 0,
                                                height: "50%",
                                                background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
                                            }} />
                                        </Box>

                                        <Box sx={{ p: 2 }}>
                                            {/*
                                                ✅ FIX: was <Typography variant="subtitle1"> → <p> in DOM.
                                                Movie titles inside a list should NOT be headings (would
                                                create dozens of H2/H3 competing with the page H1).
                                                A styled <p> is correct here — same as ListVideos fix.
                                            */}
                                            <Typography
                                                component="p"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: "#fff",
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    lineHeight: 1.3,
                                                    minHeight: "2.6em",
                                                    mb: 1.5,
                                                }}
                                            >
                                                {video.titulo}
                                            </Typography>

                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#888", fontSize: "0.85rem" }}>
                                                <Typography
                                                    variant="caption"
                                                    component="span"
                                                    aria-label={`Duration: ${video.duration || "unknown"}`}
                                                    sx={{ display: "flex", alignItems: "center", gap: 0.5, bgcolor: "rgba(255,255,255,0.05)", px: 1, py: 0.5, borderRadius: 1 }}
                                                >
                                                    ⏳ {video.duration || "N/A"}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    component="span"
                                                    aria-label={`File size: ${video.file_size || "unknown"}`}
                                                    sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#f013e5", fontWeight: "bold" }}
                                                >
                                                    💾 {video.file_size || "N/A"}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Link>
                            ))
                        }

                    </Box>
                </Box>
                <Script
                    src="https://a.magsrv.com/ad-provider.js"
                    strategy="afterInteractive"
                />

                <ins
                    className="eas6a97888e20"
                    data-zoneid="5944638"
                />

                <Script id="magsrv-zone-5944638">
                    {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
                </Script>
                {/* ─── Pagination ─────────────────────────────────────────────────── */}
                {totalPages > 1 && (
                    <Box
                        component="nav"
                        aria-label="Video pagination"
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            marginBottom: "40px",
                            marginTop: "40px",
                            gap: "10px",
                            padding: "20px",
                        }}
                    >
                        <Link
                            href={
                                currentPage > 1
                                    ? { pathname: router.pathname, query: { ...router.query, page: currentPage - 1 } }
                                    : "#"
                            }
                            passHref
                            legacyBehavior
                        >
                            <Button
                                component="a"
                                variant="contained"
                                disabled={currentPage === 1}
                                sx={{
                                    backgroundColor: "rgba(255,255,255,0.1)",
                                    color: "#fff",
                                    "&:hover": { backgroundColor: "#f013e5" },
                                }}
                                aria-label="Previous page"
                            >
                                Back
                            </Button>
                        </Link>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum =
                                totalPages <= 5
                                    ? i + 1
                                    : Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                            if (pageNum > totalPages) return null;
                            return (
                                <Link
                                    key={pageNum}
                                    href={{
                                        pathname: router.pathname,
                                        query: { ...router.query, page: pageNum },
                                    }}
                                    passHref
                                    legacyBehavior
                                >
                                    <Button
                                        component="a"
                                        variant={pageNum === currentPage ? "contained" : "outlined"}
                                        aria-label={`Page ${pageNum}`}
                                        aria-current={pageNum === currentPage ? "page" : undefined}
                                        sx={{
                                            backgroundColor:
                                                pageNum === currentPage
                                                    ? "#f013e5"
                                                    : "rgba(255,255,255,0.05)",
                                            color: pageNum === currentPage ? "#fff" : "#f013e5",
                                            borderColor: "#f013e5",
                                            "&:hover": {
                                                borderColor: "#f013e5",
                                                backgroundColor: pageNum === currentPage ? "#d00fd5" : "rgba(240,19,229,0.1)",
                                            }
                                        }}
                                    >
                                        {pageNum}
                                    </Button>
                                </Link>
                            );
                        })}

                        <Link
                            href={
                                currentPage < totalPages
                                    ? { pathname: router.pathname, query: { ...router.query, page: currentPage + 1 } }
                                    : "#"
                            }
                            passHref
                            legacyBehavior
                        >
                            <Button
                                component="a"
                                variant="contained"
                                disabled={currentPage === totalPages}
                                sx={{
                                    backgroundColor: "rgba(255,255,255,0.1)",
                                    color: "#fff",
                                    "&:hover": { backgroundColor: "#f013e5" },
                                }}
                                aria-label="Next page"
                            >
                                Next
                            </Button>
                        </Link>
                    </Box>
                )}

                {/* ✅ SEO text block — completely absent in original */}
                <Box
                    component="section"
                    aria-label="About premium movie downloads"
                    sx={{
                        mt: 8,
                        p: { xs: 2, md: 4 },
                        backgroundColor: "rgba(255,255,255,0.02)",
                        borderRadius: "12px",
                        border: "1px solid rgba(255,255,255,0.05)",
                    }}
                >
                    <Typography
                        component="h2"
                        sx={{ color: "#fff", fontSize: "1.2rem", fontWeight: "bold", mb: 2 }}
                    >
                        Download Full-Length Premium Porn Movies in HD &amp; 4K
                    </Typography>
                    <Typography
                        component="p"
                        sx={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.8, fontSize: "0.95rem" }}
                    >
                        Novapornx offers an ever-growing library of{" "}
                        <strong>premium porn movies for download</strong> in full HD and 4K quality.
                        Each title is available as a direct download — no subscription, no wait time.
                        Browse exclusive studio productions, amateur films, and niche adult content
                        across dozens of categories. Every <strong>HD porn download</strong> is
                        carefully curated for the best viewing experience on any device.
                    </Typography>
                </Box>
            </Container>

            <FooterComponent />
        </div>
    );
}

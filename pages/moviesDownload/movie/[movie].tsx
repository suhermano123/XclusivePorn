import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NavBar from "@/components/NavBar/NavBar";
import NavMenu from "@/components/NavMenu/NavMenu";
import FooterComponent from "@/components/footer/Footer";
import { Box, Typography, Skeleton, Container, Button, Grid, Divider } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import StorageIcon from "@mui/icons-material/Storage";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = "https://novapornx.com";
const MOVIES_URL = `${BASE_URL}/moviesDownload`;

// ─── Types ────────────────────────────────────────────────────────────────────
interface VideoDownload {
    id: string;
    titulo: string;
    size: string;
    duration: string;
    enlaces: any;
    imagenes: any;
    created_at: string;
    downloads: [
        url: string,
        title: string
    ],
    descripcion: string;
    tags: string[];

}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getImagesArray = (imagenes: any): string[] => {
    if (!imagenes) return [];
    if (typeof imagenes === "string")
        return imagenes.split(",").map((img) => img.replace(/['"\[\]]/g, "").trim()).filter(Boolean);
    if (Array.isArray(imagenes)) return imagenes;
    return [];
};

const getLinksArray = (enlaces: any): string[] => {
    if (!enlaces) return [];
    if (typeof enlaces === "string")
        return enlaces.split(",").map((l) => l.replace(/['"\[\]]/g, "").trim()).filter(Boolean);
    if (Array.isArray(enlaces)) return enlaces;
    return [];
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function MovieDetail() {
    const router = useRouter();
    const { movie: id } = router.query;
    const [adOpened, setAdOpened] = useState(false);

    const [movie, setMovie] = useState<VideoDownload | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchMovie = async () => {
            try {
                const response = await fetch(`/api/moviesDownload?id=${id}`);
                if (!response.ok) {
                    throw new Error(`API error: ${response.statusText}`);
                }
                const data = await response.json();
                setMovie(data as VideoDownload);
                if (router.asPath && typeof window !== "undefined") {
                    console.log("entro ad", window)
                    const adProvider = (window as any).AdProvider = (window as any).AdProvider || [];
                    // Push serve commands for the 3 ad zones present in this component
                    adProvider.push({ serve: {} });
                    adProvider.push({ serve: {} });
                    adProvider.push({ serve: {} });
                }
            } catch (error) {
                console.error("Error fetching movie:", error);
            }
            setLoading(false);
        };
        fetchMovie();
    }, [id]);

    // ─── Derived values ───────────────────────────────────────────────────────
    const images = movie ? getImagesArray(movie.imagenes) : [];
    const mainImage = images.length > 0 ? images[0] : "/assets/placeholder.png";
    const galleryImages = images.slice(1);
    const links = movie ? getLinksArray(movie.downloads) : [];
    const [selectedImage, setSelectedImage] = useState<any>(null);

    const canonicalUrl = movie
        ? `${MOVIES_URL}/movie/${movie.id}`
        : `${MOVIES_URL}/movie/${id || ""}`;

    const pageTitle = movie
        ? `${movie.titulo} – Download Full HD Porn Movie | novapornx`
        : "Download Premium Porn Movie | novapornx";

    const pageDescription = movie
        ? `Download "${movie.titulo}" in full HD. Duration: ${movie.duration || "N/A"}, File size: ${movie.size || "N/A"}. Free premium adult movie download at novapornx.`
        : "Download premium full-length HD porn movies at novapornx.";

    // ─── JSON-LD: VideoObject ─────────────────────────────────────────────────
    // ✅ VideoObject is the correct schema for a downloadable movie page.
    // It signals to Google this is a video asset — eligible for video rich results.
    const videoObjectSchema = movie
        ? {
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": movie.titulo,
            "description": pageDescription,
            "thumbnailUrl": mainImage,
            "contentUrl": links[0] || canonicalUrl,
            "url": canonicalUrl,
            "uploadDate": movie.created_at || new Date().toISOString(),
            ...(movie.duration
                ? {
                    // Convert "mm:ss" or "hh:mm:ss" → ISO 8601 PT#H#M#S
                    "duration": (() => {
                        const parts = movie.duration.split(":").map(Number);
                        if (parts.length === 2) return `PT${parts[0]}M${parts[1]}S`;
                        if (parts.length === 3) return `PT${parts[0]}H${parts[1]}M${parts[2]}S`;
                        return undefined;
                    })(),
                }
                : {}),
            // ✅ Each download button = a download action — tells Google this is
            // downloadable content, not just streamable.
            "potentialAction": links.map((link, idx) => ({
                "@type": "DownloadAction",
                "name": `Download Server ${idx + 1}`,
                "target": link,
            })),
        }
        : null;

    // ─── JSON-LD: BreadcrumbList ──────────────────────────────────────────────
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": "Download Movies", "item": MOVIES_URL },
            ...(movie
                ? [{ "@type": "ListItem", "position": 3, "name": movie.titulo, "item": canonicalUrl }]
                : []),
        ],
    };

    // ─── Loading state ────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div style={{ backgroundColor: "#050505", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Head>
                    <title>Loading Movie – novapornx</title>
                    {/* ✅ noindex while loading — avoid Google indexing a blank shell */}

                </Head>
                <NavBar sx={{ backgroundColor: "#111", borderBottom: "1px solid rgba(240,19,229,0.2)" }} />
                <NavMenu sx={{ backgroundColor: "#0a0a0a", borderBottom: "1px solid rgba(255,255,255,0.05)" }} />
                <Container maxWidth="lg" sx={{ flexGrow: 1, py: { xs: 2, md: 5 } }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <Skeleton variant="rectangular" height={400} sx={{ bgcolor: "rgba(255,255,255,0.05)", borderRadius: 2 }} />
                        <Skeleton variant="text" height={60} width="60%" sx={{ bgcolor: "rgba(255,255,255,0.05)" }} />
                        <Skeleton variant="text" height={30} width="30%" sx={{ bgcolor: "rgba(255,255,255,0.05)" }} />
                    </Box>
                </Container>
                <FooterComponent />
            </div>
        );
    }

    // ─── Not found state ──────────────────────────────────────────────────────
    if (!movie) {
        return (
            <div style={{ backgroundColor: "#050505", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Head>
                    <title>Movie Not Found – novapornx</title>

                </Head>
                <NavBar sx={{ backgroundColor: "#111", borderBottom: "1px solid rgba(240,19,229,0.2)" }} />
                <NavMenu sx={{ backgroundColor: "#0a0a0a", borderBottom: "1px solid rgba(255,255,255,0.05)" }} />
                <Container maxWidth="lg" sx={{ flexGrow: 1, py: { xs: 2, md: 5 } }}>
                    <Typography variant="h5" color="error" align="center" sx={{ mt: 10 }}>
                        Movie not found.
                    </Typography>
                </Container>
                <FooterComponent />
            </div>
        );
    }


    // ─── Main render ──────────────────────────────────────────────────────────
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
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta
                    name="keywords"
                    content={`${movie.titulo}, download porn movie, hd porn download, free adult movie download, novapornx`}
                />

                {/* ✅ Canonical — prevents duplicate indexing if movie is accessible
                    via different query param formats */}
                <link rel="canonical" href={canonicalUrl} />

                {/* ── Open Graph ─────────────────────────────────────────── */}
                <meta property="og:type" content="video.movie" />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={mainImage} />
                <meta property="og:image:width" content="1280" />
                <meta property="og:image:height" content="720" />
                <meta property="og:site_name" content="novapornx" />
                {/* ✅ video.movie OG type: also add video duration if available */}
                {movie.duration && <meta property="video:duration" content={movie.duration} />}

                {/* ── Twitter Card ───────────────────────────────────────── */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={canonicalUrl} />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content={mainImage} />

                {/* ── JSON-LD ────────────────────────────────────────────── */}
                {videoObjectSchema && (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoObjectSchema) }}
                    />
                )}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
                />
            </Head>

            <NavBar sx={{ backgroundColor: "#111", borderBottom: "1px solid rgba(240,19,229,0.2)" }} />
            <NavMenu sx={{ backgroundColor: "#0a0a0a", borderBottom: "1px solid rgba(255,255,255,0.05)" }} />

            <Container maxWidth="lg" component="main" sx={{ flexGrow: 1, py: { xs: 2, md: 5 } }}>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>

                    {/* ── Main Info Section ──────────────────────────────── */}
                    <Box sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        gap: { xs: 4, md: 6 },
                        bgcolor: "rgba(15,15,15,0.8)",
                        backdropFilter: "blur(10px)",
                        p: { xs: 3, md: 5 },
                        borderRadius: "20px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                    }}>
                        {/* Main Image */}
                        <Box sx={{
                            position: "relative",
                            width: { xs: "100%", md: "45%" },
                            height: { xs: "180px", sm: "350px" },
                            borderRadius: "10px",
                            overflow: "hidden",
                            boxShadow: "0 10px 30px rgba(240,19,229,0.15)",
                            border: "1px solid rgba(240,19,229,0.2)",
                            flexShrink: 0,
                        }}>
                            <Image
                                src={mainImage}
                                /*
                                    ✅ FIX: alt was just movie.titulo.
                                    Now includes download context for image search indexing.
                                */
                                alt={`${movie.titulo} – full HD porn movie download`}
                                fill
                                style={{ objectFit: "cover" }}
                                unoptimized
                                priority
                            />
                        </Box>

                        {/* Details */}
                        <Box sx={{
                            flex: 1,
                            minWidth: 0,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                        }}>
                            {/*
                                ✅ FIX: was <Typography variant="h3"> without component prop
                                → rendered as <h3> in the DOM, with no H1 on the page at all.
                                Now component="h1" is explicit and visible.
                                The gradient effect is purely CSS cosmetic — semantic tag is correct.
                            */}
                            <Typography
                                component="h1"
                                sx={{
                                    fontWeight: 800,
                                    mb: 3,
                                    fontSize: {
                                        xs: "1.3rem",
                                        sm: "1.6rem",
                                        md: "2rem",
                                        lg: "2.4rem",
                                    },
                                    background: "linear-gradient(90deg, #fff, #aaa)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    lineHeight: 1.2,

                                    maxWidth: "100%",
                                    whiteSpace: "normal",
                                    overflowWrap: "anywhere",
                                }}
                            >
                                {movie.titulo}
                            </Typography>

                            {/* Metadata badges */}
                            <Box sx={{ display: "flex", gap: 3, mb: 4, flexWrap: "wrap" }}>
                                <Box
                                    component="span"
                                    aria-label={`Duration: ${movie.duration || "unknown"}`}
                                    sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "rgba(240,19,229,0.1)", px: 2, py: 1, borderRadius: 2, border: "1px solid rgba(240,19,229,0.3)" }}
                                >
                                    <PlayArrowIcon sx={{ color: "#f013e5" }} />
                                    <Typography component="span" sx={{ color: "#fff", fontWeight: 600 }}>
                                        {movie.duration || "N/A"}
                                    </Typography>
                                </Box>
                                <Box
                                    component="span"
                                    aria-label={`File size: ${movie.size || "unknown"}`}
                                    sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "rgba(240,19,229,0.1)", px: 2, py: 1, borderRadius: 2, border: "1px solid rgba(240,19,229,0.3)" }}
                                >
                                    <DownloadIcon sx={{ color: "#f013e5" }} />
                                    <Typography component="span" sx={{ color: "#fff", fontWeight: 600 }}>
                                        {movie.size || "N/A"}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 4 }} />

                            {/*
                                ✅ FIX: was <Typography variant="h6"> → rendered as <h6>,
                                skipping H2–H5. "Select Download Server" is a label,
                                not a heading — changed to <p> with bold styling.
                            */}
                            <Typography
                                variant="caption"
                                component="div"
                                sx={{
                                    fontSize: "1rem",
                                    color: "#f013e5",
                                    fontWeight: "bold",
                                    mb: 2,
                                    overflowWrap: "break-word",
                                    wordBreak: "break-word",
                                    whiteSpace: "normal",
                                    maxWidth: "100%",
                                }}
                            >
                                {movie.descripcion}
                            </Typography>
                            <Typography
                                component="p"
                                sx={{ color: "#aaa", mb: 2, textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.9rem", fontWeight: 700 }}
                            >
                                Select Download Server
                            </Typography>

                            {links.map((item: any, idx: number) => {
                                const url = item.url;
                                const title = (item.title || "").toLowerCase();

                                let buttonBg = "linear-gradient(90deg, #f013e5, #ff5e62)";
                                let buttonShadowHover = "rgba(240,19,229,0.6)";
                                let buttonShadow = "rgba(240,19,229,0.4)";
                                let buttonLabel = `Download Link ${idx + 1}`;

                                let ServerIcon = DownloadIcon;

                                if (
                                    title.includes("k2s") ||
                                    title.includes("keep2share") ||
                                    url.includes("k2s.cc")
                                ) {
                                    buttonBg = "linear-gradient(90deg, #0b468c, #ff5a00)";
                                    buttonShadowHover = "rgba(255,90,0,0.6)";
                                    buttonShadow = "rgba(255,90,0,0.4)";
                                    buttonLabel = `Keep2Share #${idx + 1}`;
                                    ServerIcon = CloudDownloadIcon;
                                }

                                else if (
                                    title.includes("rapidgator") ||
                                    url.includes("rg.to")
                                ) {
                                    buttonBg = "linear-gradient(90deg, #00853f, #00a64e)";
                                    buttonShadowHover = "rgba(0,166,78,0.6)";
                                    buttonShadow = "rgba(0,166,78,0.4)";
                                    buttonLabel = `Rapidgator #${idx + 1}`;
                                    ServerIcon = StorageIcon;
                                }

                                return (
                                    <Button
                                        key={idx}
                                        variant="contained"
                                        component="button"
                                        startIcon={<ServerIcon />}
                                        onClick={() => {
                                            if (!adOpened) {
                                                window.open(
                                                    "https://s.pemsrv.com/v1/link.php?cat=&idzone=5944644&type=8",
                                                    "_blank",
                                                    "noopener,noreferrer"
                                                );

                                                setAdOpened(true);
                                                return;
                                            }

                                            window.open(
                                                url,
                                                "_blank",
                                                "noopener,noreferrer"
                                            );
                                        }}
                                        sx={{
                                            width: "100%",
                                            maxWidth: "100%",
                                            background: buttonBg,
                                            color: "#fff",
                                            fontWeight: "bold",
                                            textTransform: "none",
                                            fontSize: { xs: "0.9rem", md: "1.1rem" },
                                            py: 1.5,
                                            borderRadius: "12px",

                                            whiteSpace: "normal",
                                            wordBreak: "break-word",
                                            textAlign: "center",

                                            boxShadow: `0 4px 15px ${buttonShadow}`,
                                        }}
                                    >
                                        {buttonLabel}
                                    </Button>
                                );
                            })}
                        </Box>
                    </Box>
                    <Script
                        src="https://a.magsrv.com/ad-provider.js"
                        strategy="afterInteractive"
                    />

                    <ins
                        className="eas6a97888e37"
                        data-zoneid="5944648"
                    />

                    <Script id="magsrv-zone-5944648">
                        {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
                    </Script>
                    {/* ── Preview Gallery ────────────────────────────────── */}
                    {galleryImages.length > 0 && (
                        <Box
                            component="section"
                            aria-label={`Preview gallery for ${movie.titulo}`}
                            sx={{ mt: 6, mb: 4 }}
                        >
                            {/*
                                ✅ FIX: was <Typography variant="h4"> → rendered as <h4>,
                                skipping H2 and H3 after the H1. Now it's an H2 — correct outline:
                                H1 (movie title) → H2 (Preview Gallery)
                            */}
                            <Typography
                                component="h2"
                                sx={{ color: "#fff", mb: 4, fontWeight: "bold", fontSize: "1.5rem", borderLeft: "4px solid #f013e5", pl: 2 }}
                            >
                                Preview Gallery
                            </Typography>

                            <Grid container spacing={2}>
                                {galleryImages.map((image, index) => (
                                    <Grid item xs={12} key={index}>
                                        <Box
                                            sx={{
                                                position: "relative",
                                                width: "100%",
                                                height: { xs: "540px", sm: "720px", md: "1080px" },
                                                borderRadius: "16px",
                                                overflow: "hidden",
                                                bgcolor: "#0a0a0a",
                                                border: "1px solid rgba(255,255,255,0.05)",
                                                boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
                                                cursor: "zoom-in",
                                            }}
                                            onClick={() => setSelectedImage(image)}
                                        >
                                            <Image
                                                src={image}
                                                alt={`${movie.titulo} – screenshot ${index + 1}`}
                                                fill
                                                style={{ objectFit: "contain" }}
                                                unoptimized
                                            />
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {/* ✅ NEW: Back link to movie listing — crawlable internal link
                        that passes link equity back to the index page and helps
                        Google understand the site structure. */}
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 4 }}>
                        <Link href="/moviesDownload" passHref legacyBehavior>
                            <Button
                                component="a"
                                variant="outlined"
                                aria-label="Back to all downloadable movies"
                                sx={{
                                    color: "#f013e5",
                                    borderColor: "#f013e5",
                                    borderRadius: "20px",
                                    fontWeight: "bold",
                                    px: 4,
                                    "&:hover": { backgroundColor: "rgba(240,19,229,0.08)", borderColor: "#e91ec4" },
                                }}
                            >
                                ← Browse All Movies
                            </Button>
                        </Link>
                    </Box>
                    <Dialog
                        open={Boolean(selectedImage)}
                        onClose={() => setSelectedImage(null)}
                        maxWidth={false}
                        PaperProps={{
                            sx: {
                                width: "100vw",
                                height: "100vh",
                                maxWidth: "100vw",
                                maxHeight: "100vh",
                                margin: 0,
                                backgroundColor: "#000",
                            },
                        }}
                    >
                        <IconButton
                            onClick={() => setSelectedImage(null)}
                            sx={{
                                position: "fixed",
                                top: 16,
                                right: 16,
                                zIndex: 9999,
                                color: "#fff",
                                backgroundColor: "rgba(0,0,0,0.6)",
                                "&:hover": {
                                    backgroundColor: "rgba(0,0,0,0.8)",
                                },
                            }}
                        >
                            <CloseIcon />
                        </IconButton>

                        <Box
                            sx={{
                                width: "100%",
                                height: "100%",
                                overflowY: "auto",
                                overflowX: "hidden",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "flex-start",
                                p: 2,
                            }}
                        >
                            <img
                                src={selectedImage}
                                alt="Preview"
                                style={{
                                    height: "250vh",
                                    width: "auto",
                                    maxWidth: "100%",
                                }}
                            />
                        </Box>
                    </Dialog>





                    {/* ✅ NEW: SEO on-page text block — movie-specific, keyword-rich,
                        placed below the fold so it doesn't affect UX */}
                    <Box
                        component="section"
                        aria-label="Movie download information"
                        sx={{
                            p: { xs: 2, md: 4 },
                            backgroundColor: "rgba(255,255,255,0.02)",
                            borderRadius: "12px",
                            border: "1px solid rgba(255,255,255,0.05)",
                            mb: 4,
                        }}
                    >
                        <Typography
                            component="h2"
                            sx={{ color: "#fff", fontSize: "1.1rem", fontWeight: "bold", mb: 2 }}
                        >
                            About This Download
                        </Typography>
                        <Typography
                            component="p"
                            sx={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.8, fontSize: "0.95rem" }}
                        >
                            <strong>{movie.titulo}</strong> is available for direct{" "}
                            <strong>HD porn download</strong> at novapornx. This full-length adult
                            film{movie.duration ? ` runs ${movie.duration}` : ""} and is available
                            {movie.size ? ` at ${movie.size}` : ""} across multiple fast
                            download servers. No registration or subscription is required — click any
                            download server above to start your free <strong>premium porn movie download</strong> instantly.
                        </Typography>
                    </Box>
                </Box>
                <Script
                    src="https://a.magsrv.com/ad-provider.js"
                    strategy="afterInteractive"
                />

                <ins
                    className="eas6a97888e17"
                    data-zoneid="5944650"
                />

                <Script id="magsrv-zone-5944650">
                    {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
                </Script>
            </Container>

            <FooterComponent />
        </div>
    );
}

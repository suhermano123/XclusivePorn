import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { getVideosByCategoryPaginated, SupabaseVideo } from "@/api/videoSupabaseService";
import { Box, Button, Typography, Container, Skeleton } from "@mui/material";
import FooterComponent from "@/components/footer/Footer";
import NavBar from "@/components/NavBar/NavBar";
import NavMenu from "@/components/NavMenu/NavMenu";
import Head from "next/head";
import Script from "next/script";

const BASE_URL = "https://novapornx.com";

/** Normalize title into a URL-friendly slug */
const buildSlug = (title: string): string =>
    title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-");

/** Get rich category-specific descriptive paragraphs */
const getCategorySeoText = (category: string) => {
    const formatted = category.charAt(0).toUpperCase() + category.slice(1);
    switch (category.toLowerCase()) {
        case "latina":
            return [
                "Welcome to the ultimate hub for Latina Porn Videos. Our specialized section is dedicated entirely to the fiery passion, stunning curves, and authentic beauty of Hispanic and Latina performers. Here, you will find premium HD Latina clips, amateur Colombian videos, and free homemade Latina scenes in beautiful high definition.",
                "Latina adult content continues to be one of the most popular genres online. The performers bring unmatched energy, intense passion, and natural beauty to every scene. Browse through Mexican, Brazilian, Colombian, and other South American clips to find the perfect video that matches your desires."
            ];
        case "milf":
            return [
                "Welcome to our dedicated MILF Porn Videos section, featuring hot, experienced older women who know exactly what they want. Watch beautiful mothers, mature wives, and sophisticated ladies in passionate and intense scenes with younger partners or fellow mature performers.",
                "The allure of mature and MILF adult entertainment lies in the confidence, experience, and raw sensuality that these older women bring to the screen. From passionate romantic encounters to wild homemade scenes, enjoy high-quality MILF videos on NovaPornX."
            ];
        case "amateur":
            return [
                "Explore the raw, authentic world of Amateur Porn Videos on NovaPornX. This section highlights real couples, homemade recordings, and indie content creators sharing their genuine intimate moments with the world in crystal clear high definition.",
                "Unlike polished studio productions, amateur adult videos focus on natural interactions, real passion, and unscripted pleasure. Watch home sex videos and real-world encounters without any subscription or signup fees."
            ];
        case "anal":
            return [
                "Dive into our collection of free Anal Porn Videos, featuring top performers and daring amateurs exploring deep intimacy. Our catalog is curated with high-definition hardcore scenes, premium studio clips, and raw homemade videos.",
                "Anal sex scenes demand high-quality production and clear camera angles to showcase the passion. NovaPornX provides top-tier anal adult entertainment with lightning-fast streaming speeds and zero registration requirements."
            ];
        default:
            return [
                `Welcome to the ${formatted} Porn Videos section of NovaPornX. Explore a wide variety of high-quality sex clips and adult scenes featuring your favorite performers in the ${formatted} category. We bring you premium content updated daily.`,
                `Stream the best ${formatted} adult movies online in high-definition (1080p and 4K) for free. Browse through our extensive library of ${formatted} scenes, including studio releases and raw amateur recordings, completely free of charge.`
            ];
    }
};

const CategoryPage: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const categoryQuery = typeof id === 'string' ? id : '';

    const [videoL, setVideoL] = useState<SupabaseVideo[]>([]);
    const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
    const [currentPreview, setCurrentPreview] = useState<{ [key: string]: number }>({});

    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [votedVideos, setVotedVideos] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const videosPerPage = 30;

    const loadVideos = async (page: number, category: string) => {
        setIsLoading(true);
        try {
            const { items, totalCount: count } = await getVideosByCategoryPaginated(category, videosPerPage, page);
            setVideoL(items);
            setTotalCount(count);
        } catch (error) {
            console.error("Error loading category videos:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Sync current page with URL query parameter
    useEffect(() => {
        if (router.isReady) {
            const pageQuery = router.query.page;
            if (pageQuery && typeof pageQuery === 'string') {
                const pageNum = parseInt(pageQuery, 10);
                if (!isNaN(pageNum) && pageNum > 0) {
                    setCurrentPage(pageNum);
                }
            }
        }
    }, [router.isReady, router.query.page]);

    const handlePageChange = (pageNum: number) => {
        setCurrentPage(pageNum);
        router.push({
            pathname: router.pathname,
            query: { ...router.query, page: pageNum }
        }, undefined, { shallow: true });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        if (!router.isReady) return;

        if (categoryQuery) {
            loadVideos(currentPage, categoryQuery);
        } else {
            setVideoL([]);
            setTotalCount(0);
            setIsLoading(false);
        }
    }, [categoryQuery, currentPage, router.isReady]);

    useEffect(() => {
        if (videoL.length > 0) {
            const newVoted = new Set<string>();
            videoL.forEach(v => {
                const voted = localStorage.getItem(`voted_${v.uuid}`);
                if (voted) newVoted.add(v.uuid);
            });
            setVotedVideos(newVoted);
        }
    }, [videoL]);

    useEffect(() => {
        if (hoveredVideo) {
            const video = videoL.find((v) => v.uuid === hoveredVideo);
            const previewSource = video?.preview_url || video?.preview;

            if (previewSource && !previewSource.endsWith('.mp4') && !previewSource.endsWith('.webm')) {
                const previewImages = previewSource.split(",").map(u => u.trim()).filter(Boolean);
                if (previewImages.length > 1) {
                    const interval = setInterval(() => {
                        setCurrentPreview((prev) => ({
                            ...prev,
                            [hoveredVideo]: ((prev[hoveredVideo] || 0) + 1) % previewImages.length,
                        }));
                    }, 1000);
                    return () => clearInterval(interval);
                }
            }
        }
    }, [hoveredVideo, videoL]);

    const totalPages = Math.ceil(totalCount / videosPerPage);

    // ─── Ads Refresh ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (typeof window !== "undefined") {
            console.log("entro ad", window)
            const adProvider = (window as any).AdProvider = (window as any).AdProvider || [];
            // Push serve commands for the 3 ad zones present in this component
            adProvider.push({ serve: {} });
            adProvider.push({ serve: {} });
            adProvider.push({ serve: {} });
        }
    }, [router.asPath]);

    // Dynamic SEO strings
    const categoryTitle = categoryQuery
        ? `${categoryQuery.charAt(0).toUpperCase() + categoryQuery.slice(1)}`
        : "";
    const pageTitle = categoryQuery
        ? `Free ${categoryTitle} Porn Videos – Watch ${categoryTitle} Sex Movies Online | NovaPornX`
        : "Free Adult Porn Video Categories | NovaPornX";
    const pageDescription = categoryQuery
        ? `Explore the best free ${categoryQuery} porn videos online. Watch high quality ${categoryQuery} sex clips and amateur HD content on NovaPornX with no registration.`
        : "Explore free adult categories on NovaPornX. Watch free premium HD adult videos and amateur porn online.";
    const pageUrl = categoryQuery
        ? `${BASE_URL}/category/${encodeURIComponent(categoryQuery.toLowerCase())}`
        : `${BASE_URL}/categories`;

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": "Categories", "item": `${BASE_URL}/categories` },
            ...(categoryQuery ? [{ "@type": "ListItem", "position": 3, "name": categoryTitle, "item": pageUrl }] : []),
        ],
    };

    const collectionSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": pageTitle,
        "description": pageDescription,
        "url": pageUrl,
        "isPartOf": {
            "@type": "WebSite",
            "name": "NovaPornX",
            "url": BASE_URL,
        },
    };

    const seoParagraphs = categoryQuery ? getCategorySeoText(categoryQuery) : [];

    return (
        <div style={styles.container}>
            <Head>
                {/* ── Core Meta ─────────────────────────────────────────────── */}
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta name="keywords" content={categoryQuery ? `${categoryQuery} porn, ${categoryQuery} sex, free premium hd ${categoryQuery} videos, amateur hd porn ${categoryQuery}, free 4k homemade ${categoryQuery} porn, hd ${categoryQuery} amateur videos free, novapornx` : 'free premium adult videos, amateur hd porn, free 4k homemade porn, novapornx'} />
                <link rel="canonical" href={pageUrl} />

                {/* ── Open Graph ────────────────────────────────────────────── */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={pageUrl} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={`${BASE_URL}/assets/backGround.png`} />
                <meta property="og:image:width" content="1280" />
                <meta property="og:image:height" content="720" />
                <meta property="og:site_name" content="NovaPornX" />

                {/* ── Twitter Card ──────────────────────────────────────────── */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={pageUrl} />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content={`${BASE_URL}/assets/backGround.png`} />

                {/* ── Structured Data ───────────────────────────────────────── */}
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
            </Head>
            <NavBar sx={{ backgroundColor: "#111", borderBottom: "1px solid rgba(240,19,229,0.2)" }} />
            <NavMenu sx={{ backgroundColor: "#0a0a0a", borderBottom: "1px solid rgba(255,255,255,0.05)" }} />

            <Container maxWidth={false} sx={{ py: 4, flexGrow: 1 }}>
                {categoryQuery ? (
                    <Typography component="h1" sx={{ color: '#fff', mb: 4, fontWeight: 'bold', fontSize: '2.5rem', borderLeft: '4px solid #f013e5', pl: 2 }}>
                        {categoryQuery.toUpperCase()} PORN VIDEOS
                        {!isLoading && <span style={{ fontSize: '16px', color: '#aaa', marginLeft: '10px' }}>({totalCount} videos)</span>}
                    </Typography>
                ) : (
                    <Skeleton variant="text" width="30%" height={40} sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 4 }} />
                )}

                <Box sx={styles.gridContainer}>
                    {isLoading
                        ? Array.from(new Array(videosPerPage)).map((_, i) => (
                            <Box key={i} sx={{ ...styles.videoCardSx, height: '100%' }}>
                                <Skeleton variant="rectangular" width="100%" height={0} sx={{ paddingTop: '56.25%', bgcolor: "rgba(255,255,255,0.1)" }} />
                                <Box sx={{ p: 1 }}>
                                    <Skeleton variant="text" width="60%" sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />
                                </Box>
                            </Box>
                        ))
                        : videoL.map((video) => {
                            const isHovered = hoveredVideo === video.uuid;
                            const title = video.titulo || video.title || "Video";
                            const slug = buildSlug(title);

                            let currentImage = video.imagen_url || video.img_src || "/assets/placeholder.png";
                            let mp4Preview = null;
                            const previewSource = video.preview_url || video.preview;

                            if (previewSource) {
                                if (previewSource.endsWith('.mp4') || previewSource.endsWith('.webm')) {
                                    mp4Preview = previewSource;
                                } else {
                                    const previewImages = previewSource.split(",").map(u => u.trim()).filter(Boolean);
                                    if (previewImages.length > 0) {
                                        currentImage = previewImages[currentPreview[video.uuid] || 0];
                                    }
                                }
                            }

                            return (
                                <Link href={`/video/${video.uuid}-${slug}`} key={video.uuid} passHref>
                                    <Box
                                        onMouseEnter={() => setHoveredVideo(video.uuid)}
                                        onMouseLeave={() => setHoveredVideo(null)}
                                        component="a"
                                        style={{ textDecoration: 'none' }}
                                        sx={styles.videoCardSx}
                                    >
                                        <div style={styles.thumbnailContainer}>
                                            {isHovered && mp4Preview ? (
                                                <video
                                                    src={mp4Preview}
                                                    autoPlay
                                                    muted
                                                    loop
                                                    style={styles.thumbnail}
                                                    playsInline
                                                />
                                            ) : (
                                                <img
                                                    src={currentImage}
                                                    alt={`Watch ${title} free porn video hd`}
                                                    style={styles.thumbnail}
                                                />
                                            )}
                                        </div>
                                        <div style={styles.metadataArea}>
                                            <Typography variant="subtitle1" style={styles.videoTitle} title={title}>
                                                {title}
                                            </Typography>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                                <span style={styles.statsText}>
                                                    👍 {video.likes || 0}
                                                </span>
                                                <span style={styles.durationLabel}>
                                                    ⏳ {(video.duracion_segundos && video.duracion_segundos > 0)
                                                        ? `${Math.floor(video.duracion_segundos / 60)}:${(video.duracion_segundos % 60).toString().padStart(2, '0')}`
                                                        : (video.duracion || "0:00")}
                                                </span>
                                            </Box>
                                        </div>
                                    </Box>
                                </Link>
                            );
                        })}
                </Box>

                {!isLoading && videoL.length === 0 && (
                    <Typography variant="h6" sx={{ color: '#aaa', textAlign: 'center', mt: 8 }}>
                        No videos found in this category.
                    </Typography>
                )}

                {/* Pagination */}
                {!isLoading && totalPages > 1 && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 6, mb: 4, gap: '10px' }}>
                        <Button
                            variant="contained"
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            sx={styles.paginationBtnSx}
                        >
                            Back
                        </Button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                            if (pageNum > totalPages) return null;
                            return (
                                <Button
                                    key={pageNum}
                                    variant={pageNum === currentPage ? "contained" : "outlined"}
                                    onClick={() => handlePageChange(pageNum)}
                                    sx={{
                                        ...styles.pageNumberBtnSx,
                                        backgroundColor: pageNum === currentPage ? "#f013e5" : "rgba(255,255,255,0.05)",
                                        color: pageNum === currentPage ? "#fff" : "#f013e5",
                                        borderColor: "#f013e5"
                                    }}
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}

                        <Button
                            variant="contained"
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            sx={styles.paginationBtnSx}
                        >
                            Next
                        </Button>
                    </Box>
                )}

                {/* Rich Category Descriptive Paragraphs */}
                {!isLoading && seoParagraphs.length > 0 && (
                    <Box sx={{ mt: 8, p: { xs: 3, md: 5 }, backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <Typography component="h2" sx={{ color: '#fff', fontSize: '1.8rem', mb: 3, fontWeight: 'bold' }}>
                            Watch Free {categoryTitle} Porn Videos Online
                        </Typography>
                        {seoParagraphs.map((par, i) => (
                            <Typography key={i} variant="body1" sx={{ color: "rgba(255,255,255,0.7)", mb: 2.5, lineHeight: 1.8, fontSize: "1.05rem", textAlign: "justify" }}>
                                {par}
                            </Typography>
                        ))}
                    </Box>
                )}

                <>
                    <Script
                        src="https://a.magsrv.com/ad-provider.js"
                        strategy="afterInteractive"
                    />

                    <ins
                        className="eas6a97888e31"
                        data-zoneid="5941732"
                    />

                </>
            </Container>
            <FooterComponent />
        </div>
    );
};

const styles: { [key: string]: any } = {
    container: {
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#000",
    },
    gridContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "15px",
    },
    videoCardSx: {
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: "12px",
        transition: "all 0.25s ease-in-out",
        cursor: "pointer",
        backgroundColor: "#111",
        "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 24px rgba(0, 0, 0, 0.5)",
            zIndex: 10,
            "& img, & video": {
                opacity: 0.9
            }
        }
    },
    thumbnailContainer: {
        position: "relative",
        width: "100%",
        aspectRatio: "16/9",
        backgroundColor: "#000",
        overflow: "hidden",
    },
    thumbnail: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        borderRadius: "8px 8px 0 0",
        display: "block",
        transition: "transform 0.3s ease",
    },
    metadataArea: {
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#111",
    },
    videoTitle: {
        color: "#fff",
        fontSize: "12px",
        fontWeight: "700",
        margin: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        lineHeight: "1.4",
        marginBottom: '5px'
    },
    statsText: {
        fontSize: "11px",
        color: "#ccc",
        fontWeight: "600",
    },
    durationLabel: {
        fontSize: "10px",
        color: "#aaa",
        fontWeight: "bold",
        backgroundColor: "rgba(255,255,255,0.05)",
        padding: "2px 6px",
        borderRadius: "4px",
    },
    paginationBtnSx: {
        backgroundColor: "#f013e5",
        color: "#fff",
        fontWeight: "bold",
        padding: "6px 16px",
        borderRadius: "20px",
        "&:hover": {
            backgroundColor: "#e91ec4",
        },
        "&:disabled": {
            backgroundColor: "rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.3)"
        }
    },
    pageNumberBtnSx: {
        fontWeight: "bold",
        padding: "6px 0",
        minWidth: "40px",
        borderRadius: "50%",
    }
};

export default CategoryPage;

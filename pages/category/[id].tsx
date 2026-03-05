import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { getVideosByCategoryPaginated, SupabaseVideo } from "@/api/videoSupabaseService";
import { Box, Button, Typography, Container, Skeleton } from "@mui/material";
import FooterComponent from "@/components/footer/Footer";
import AgeVerification from "@/components/OlderVerify/OlderVerify";
import { getVisitorId } from "@/api/visitorIdHelper";
import NavBar from "@/components/NavBar/NavBar";
import NavMenu from "@/components/NavMenu/NavMenu";
import Head from "next/head";

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

    return (
        <div style={styles.container}>
            <Head>
                <title>{categoryQuery ? `Watch Free ${categoryQuery.charAt(0).toUpperCase() + categoryQuery.slice(1)} Porn Videos in HD` : 'Category'} - novapornx</title>
                <meta name="description" content={categoryQuery ? `Explore the best ${categoryQuery} porn videos for free. Watch high quality ${categoryQuery} sex videos and exclusive adult content on novapornx.` : `Explore free adult categories on novapornx.`} />
                <meta name="keywords" content={categoryQuery ? `${categoryQuery} porn, ${categoryQuery} sex, free ${categoryQuery} videos, hd porn` : 'porn, sex, free videos'} />
                {categoryQuery ? <link rel="canonical" href={`https://novapornx.com/category/${encodeURIComponent(categoryQuery.toLowerCase())}`} /> : null}
                <meta name="robots" content="index, follow" />
            </Head>
            <NavBar sx={{ backgroundColor: "#e91ec4" }} />
            <NavMenu sx={{ backgroundColor: "#e91ec4" }} />
            <AgeVerification />

            <Container maxWidth={false} sx={{ py: 4, flexGrow: 1 }}>
                {categoryQuery ? (
                    <Typography variant="h4" sx={{ color: '#fff', mb: 4, fontWeight: 'bold', borderLeft: '4px solid #f013e5', pl: 2 }}>
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
                                <Link href={`/video/${video.uuid}`} key={video.uuid} passHref>
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

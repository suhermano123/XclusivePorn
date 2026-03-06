import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { searchVideosPaginated, SupabaseVideo } from "@/api/videoSupabaseService";
import { Skeleton, Box, Button, Typography, Container, Chip } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import HeartBrokenIcon from "@mui/icons-material/HeartBroken";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FooterComponent from "@/components/footer/Footer";
import AgeVerification from "@/components/OlderVerify/OlderVerify";
import Image from "next/image";
import { getVisitorId } from "@/api/visitorIdHelper";
import NavBar from "@/components/NavBar/NavBar";
import NavMenu from "@/components/NavMenu/NavMenu";
import Head from "next/head";

const SearchPage: React.FC = () => {
    const router = useRouter();
    const { q } = router.query;
    const searchQuery = typeof q === 'string' ? q : '';

    const [videoL, setVideoL] = useState<SupabaseVideo[]>([]);
    const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
    const [loadingPreviews, setLoadingPreviews] = useState<{ [key: string]: boolean }>({});
    const [currentPreview, setCurrentPreview] = useState<{ [key: string]: number }>({});

    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [votedVideos, setVotedVideos] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const videosPerPage = 24;

    const loadVideos = async (page: number, query: string) => {
        setIsLoading(true);
        try {
            const { items, totalCount: count } = await searchVideosPaginated(query, videosPerPage, page);
            setVideoL(items);
            setTotalCount(count);
        } catch (error) {
            console.error("Error loading videos:", error);
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
        // Update the URL without a full page reload so back navigation works properly
        router.push({
            pathname: router.pathname,
            query: { ...router.query, page: pageNum }
        }, undefined, { shallow: true });

        // Scroll to the top when page changes 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // When searchQuery changes (i.e. user performed a new search), reset to page 1 unless we literally just restored from URL
    useEffect(() => {
        if (!router.isReady) return;

        // If 'q' changes but we have a 'page' in the URL that matches our state, we are likely just mounting and restoring state
        // To be safe, if we are loading videos, we will use the current restored page or reset it if the query changed significantly.
        // Actually, the simplest approach for search page is to observe `searchQuery` and `currentPage` independently, or together.
        if (searchQuery) {
            loadVideos(currentPage, searchQuery);
        } else {
            setVideoL([]);
            setTotalCount(0);
            setIsLoading(false);
        }
    }, [searchQuery, currentPage, router.isReady]);

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

    const handleRating = async (e: React.MouseEvent, uuid: string, type: 'likes' | 'dislikes', currentValue: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (votedVideos.has(uuid)) {
            alert("You have already voted on this video.");
            return;
        }

        try {
            const visitorId = getVisitorId();

            setVideoL(prev => prev.map(v =>
                v.uuid === uuid ? { ...v, [type]: (v[type] || 0) + 1 } : v
            ));

            const newVoted = new Set(votedVideos);
            newVoted.add(uuid);
            setVotedVideos(newVoted);
            localStorage.setItem(`voted_${uuid}`, type);

            const { registerVote } = await import("@/api/videoSupabaseService");
            await registerVote(uuid, visitorId, type, currentValue);
        } catch (error: any) {
            console.error(`Error updating ${type}:`, error);
            if (error.message === 'Already voted') {
                alert("You have already reacted to this video.");
            }
        }
    };

    const totalPages = Math.ceil(totalCount / videosPerPage);

    const toProxiedUrl = (url?: string | null): string => {
        if (!url) return '/assets/placeholder.png';
        if (url.includes('pub-c9afcfde57fd4b9fbc70f2802ea3ed05.r2.dev')) {
            return url.replace('https://pub-c9afcfde57fd4b9fbc70f2802ea3ed05.r2.dev', '/capturas-proxy');
        }
        if (url.includes('pub-8a7870d75cc841b788eafa8b0f0fbf0c.r2.dev')) {
            return url.replace('https://pub-8a7870d75cc841b788eafa8b0f0fbf0c.r2.dev', '/media-proxy');
        }
        if (url.includes('xmoviescdn.online')) {
            return url.replace('https://xmoviescdn.online', '/image-proxy');
        }
        if (!url.startsWith('http') && !url.startsWith('/')) {
            return `/capturas-proxy/${url}`;
        }
        return url;
    };

    return (
        <div style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Head>
                <title>Search: {searchQuery} - novapornx</title>
            </Head>
            <NavBar sx={{ backgroundColor: "#e91ec4" }} />
            <NavMenu sx={{ backgroundColor: "#e91ec4" }} />

            <Container maxWidth={false} sx={{ flexGrow: 1, py: 4 }}>
                <Typography variant="h4" sx={{ color: '#fff', mb: 1, fontWeight: 'bold' }}>
                    Search Results for "{searchQuery}"
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.5)', mb: 4 }}>
                    Found {totalCount} videos
                </Typography>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "repeat(2, 1fr)",
                            sm: "repeat(3, 1fr)",
                            md: "repeat(4, 1fr)",
                            lg: "repeat(5, 1fr)",
                            xl: "repeat(6, 1fr)"
                        },
                        gap: "15px",
                    }}
                >
                    {isLoading
                        ? Array(12)
                            .fill(0)
                            .map((_, index) => (
                                <div key={index} style={{ ...styles.videoCardSx, backgroundColor: "rgba(240, 236, 236, 0.1)", minHeight: "220px" }}>
                                    <Skeleton variant="rectangular" width="100%" height={150} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                                    <Skeleton variant="text" width="90%" style={{ marginTop: "10px", marginLeft: "10px" }} />
                                    <Skeleton variant="text" width="60%" style={{ marginTop: "5px", marginLeft: "10px" }} />
                                </div>
                            ))
                        : videoL.map((video: SupabaseVideo) => {
                            const previewUrl = video.preview_url || video.preview;
                            const thumbnails = (previewUrl && !previewUrl.endsWith('.mp4') && !previewUrl.endsWith('.webm'))
                                ? previewUrl.split(",").map(u => toProxiedUrl(u.trim())).filter(Boolean)
                                : [];

                            const isHovered = hoveredVideo === video.uuid;

                            const isVideoPreview = previewUrl && (previewUrl.endsWith('.mp4') || previewUrl.endsWith('.webm'));

                            const currentImg = (isHovered && thumbnails.length > 0)
                                ? thumbnails[currentPreview[video.uuid] || 0]
                                : toProxiedUrl(video.imagen_url || video.img_src);

                            const videoTitle = video.titulo || video.title || "video";
                            const slug = videoTitle
                                .toLowerCase()
                                .trim()
                                .replace(/\s+/g, '-')
                                .replace(/[^\w\-]+/g, '')
                                .replace(/\-\-+/g, '-');
                            const videoUrl = `/video/${video.uuid}-${slug}`;

                            return (
                                <Link href={videoUrl} key={video.uuid || video.id_post} passHref legacyBehavior>
                                    <Box
                                        component="a"
                                        sx={{ ...styles.videoCardSx, textDecoration: 'none' }}
                                        onMouseEnter={() => {
                                            setHoveredVideo(video.uuid);
                                            setLoadingPreviews((prev) => ({ ...prev, [video.uuid]: true }));
                                            setCurrentPreview((prev) => ({ ...prev, [video.uuid]: 0 }));
                                        }}
                                        onMouseLeave={() => {
                                            setHoveredVideo(null);
                                            setLoadingPreviews((prev) => ({ ...prev, [video.uuid]: false }));
                                        }}
                                        onTouchStart={() => {
                                            setHoveredVideo(video.uuid);
                                            setLoadingPreviews((prev) => ({ ...prev, [video.uuid]: true }));
                                        }}
                                        onPointerEnter={() => {
                                            setHoveredVideo(video.uuid);
                                            setLoadingPreviews((prev) => ({ ...prev, [video.uuid]: true }));
                                        }}
                                    >
                                        <div style={styles.thumbnailContainer}>
                                            {isHovered && isVideoPreview ? (
                                                <video
                                                    src={`/api/media?uuid=${video.uuid}&type=preview`}
                                                    autoPlay
                                                    muted
                                                    loop
                                                    playsInline
                                                    webkit-playsinline="true"
                                                    preload="auto"
                                                    onLoadedData={() => setLoadingPreviews((prev) => ({ ...prev, [video.uuid]: false }))}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                        borderRadius: "8px",
                                                    }}
                                                />
                                            ) : (
                                                <img
                                                    src={currentImg || '/assets/placeholder.png'}
                                                    alt={videoTitle}
                                                    style={styles.thumbnail}
                                                />
                                            )}

                                            {isHovered && loadingPreviews[video.uuid] && (
                                                <Box
                                                    sx={{
                                                        position: "absolute",
                                                        inset: 0,
                                                        backgroundColor: "rgba(0,0,0,0.4)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        zIndex: 2,
                                                    }}
                                                >
                                                    <Box
                                                        component="img"
                                                        src="/assets/loader.png"
                                                        sx={{
                                                            width: "50px",
                                                            height: "50px",
                                                            animation: "spin 2s linear infinite",
                                                            "@keyframes spin": {
                                                                "0%": { transform: "rotate(0deg)" },
                                                                "100%": { transform: "rotate(360deg)" },
                                                            },
                                                        }}
                                                    />
                                                </Box>
                                            )}
                                        </div>

                                        <div style={styles.metadataArea}>
                                            <h2 style={styles.videoTitle}>{videoTitle}</h2>

                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Box
                                                        onClick={(e) => handleRating(e, video.uuid, 'likes', video.likes || 0)}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '2px',
                                                            cursor: votedVideos.has(video.uuid) ? 'default' : 'pointer',
                                                            opacity: votedVideos.has(video.uuid) ? 0.5 : 1,
                                                            pointerEvents: votedVideos.has(video.uuid) ? 'none' : 'auto',
                                                            '&:hover': { transform: 'scale(1.2)' },
                                                            transition: 'transform 0.2s'
                                                        }}
                                                    >
                                                        <FavoriteIcon sx={{ fontSize: '14px', color: '#f013e5' }} />
                                                        <span style={styles.statsText}>{video.likes || 0}</span>
                                                    </Box>
                                                    <Box
                                                        onClick={(e) => handleRating(e, video.uuid, 'dislikes', video.dislikes || 0)}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '2px',
                                                            cursor: votedVideos.has(video.uuid) ? 'default' : 'pointer',
                                                            opacity: votedVideos.has(video.uuid) ? 0.5 : 1,
                                                            pointerEvents: votedVideos.has(video.uuid) ? 'none' : 'auto',
                                                            '&:hover': { transform: 'scale(1.2)' },
                                                            transition: 'transform 0.2s'
                                                        }}
                                                    >
                                                        <HeartBrokenIcon sx={{ fontSize: '14px', color: '#888' }} />
                                                        <span style={styles.statsText}>{video.dislikes || 0}</span>
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '2px',
                                                            cursor: 'default',
                                                        }}
                                                    >
                                                        <VisibilityIcon sx={{ fontSize: '14px', color: '#00bcd4', ml: 1 }} />
                                                        <span style={styles.statsText}>{video.views || 0}</span>
                                                    </Box>
                                                </Box>
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
                        No records found. Try a different search query.
                    </Typography>
                )}

                {/* Paginación */}
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
        borderRadius: "20px",
        padding: "8px 25px",
        fontWeight: "bold",
        boxShadow: "0 4px 10px rgba(240, 19, 229, 0.3)",
        "&:hover": {
            backgroundColor: "#e91ec4",
            transform: "scale(1.05)",
        },
        "&:disabled": {
            backgroundColor: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.2)",
        },
    },
    pageNumberBtnSx: {
        minWidth: "36px",
        height: "36px",
        borderRadius: "50%",
        fontWeight: "bold",
        transition: "all 0.2s",
        "&:hover": {
            transform: "scale(1.1)",
        }
    }
};

export default SearchPage;

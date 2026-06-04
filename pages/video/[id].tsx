import { useRouter } from 'next/router';
import React, { useEffect, useState, useRef } from 'react';
import { getVideoById, getVideoByTitle, SupabaseVideo, registerVote, getRelatedVideosByTags, addCommentToVideo, addReportToVideo, incrementVideoViews } from '@/api/videoSupabaseService';
import VideoPlayer, { VideoPlayerRef } from '@/components/VideoPlayer/VideoPlayer';
import NavBar from '@/components/NavBar/NavBar';
import NavMenu from '@/components/NavMenu/NavMenu';
import FooterComponent from '@/components/footer/Footer';
import Head from 'next/head';
import { Box, Typography, Container, CircularProgress, Grid, TextField, Button, Divider, Avatar, Paper, Modal, Backdrop, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Stack, Chip } from '@mui/material';
import { ThumbUp, ThumbDown, ChatBubble, Flag, AccessTime, CalendarToday, Favorite, CloudDownload, Visibility } from '@mui/icons-material';
import { getVisitorId } from '@/api/visitorIdHelper';
import { trackVisitorAction } from '@/api/visitorService';
import Script from "next/script";
import TopVideosSlider from '@/components/TopVideosSlider/TopVideosSlider';


// Styles adapted from ListVideos
const styles: { [key: string]: any } = {
    gridContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "15px",
        padding: "0",
    },
    videoCardSx: {
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: "12px",
        transition: "all 0.25s ease-in-out",
        cursor: "pointer",
        backgroundColor: "#111",
        border: "1px solid rgba(255,255,255,0.05)",
        "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 24px rgba(0, 0, 0, 0.5)",
            borderColor: "#f013e5",
            zIndex: 10,
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
        borderRadius: "8px",
    },
    metadataArea: {
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    },
    videoTitle: {
        color: "#fff",
        fontSize: "13px",
        fontWeight: "bold",
        margin: 0,
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        lineHeight: "1.2"
    },
    durationLabel: {
        color: "rgba(255,255,255,0.5)",
        fontSize: "11px",
    }
};

const VideoPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [video, setVideo] = useState<SupabaseVideo | null>(null);
    const [loading, setLoading] = useState(true);
    const [relatedVideos, setRelatedVideos] = useState<SupabaseVideo[]>([]);
    const [hasVoted, setHasVoted] = useState<'likes' | 'dislikes' | null>(null);
    const [newCommentText, setNewCommentText] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [relatedPage, setRelatedPage] = useState(1);
    const videosPerRelatedPage = 13;
    const videoPlayerRef = useRef<VideoPlayerRef>(null);
    const viewedRef = useRef(false);

    const handlePlay = async () => {
        if (!viewedRef.current && video) {
            viewedRef.current = true;

            try {
                await incrementVideoViews(video.uuid, video.views || 0);
                setVideo(prev => prev ? { ...prev, views: (prev.views || 0) + 1 } : prev);

            } catch (error) {
                console.error("Error incrementing views:", error);
            }
        }
    };


    // Parse comments from string: "{obj}. {obj}"
    const parseComments = (commentStr?: string) => {
        if (!commentStr) return [];
        try {
            return commentStr.split(". ").map(s => {
                try {
                    return JSON.parse(s);
                } catch (e) {
                    console.error("Error parsing individual comment:", s);
                    return null;
                }
            }).filter(Boolean);
        } catch (e) {
            console.error("Error parsing comments field:", e);
            return [];
        }
    };

    // Comment Moderation Helper
    const isCommentSafe = (text: string): boolean => {
        // 1. Detect URLs: http://, https://, www., or common domains (.com, .net, etc.)
        const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
        const domainPattern = /[a-zA-Z0-9\-\.]+\.(com|net|org|info|site|club|xxx|pro|co|me|ly)\b/gi;
        if (urlPattern.test(text) || domainPattern.test(text)) return false;

        // 2. List of bad words and recurring spam words (Spanish and English)
        const badWords = [
            "puta", "putitas", "puto", "mierda", "pendejo", "cabron", "cabrón", "verga", "panocha", "zorra",
            "perra", "joto", "maricon", "maricón", "chinga", "chingar", "chingas", "fuck", "bitch", "shit",
            "asshole", "dick", "cock", "pussy", "cunt", "whore", "slut", "spam", "viagra", "casino",
            "cripto", "crypto", "onlyfans", "telegram", "whatsapp", "inversión", "inversion"
        ];

        const lowerText = text.toLowerCase();

        for (const word of badWords) {
            // \b ensures we evaluate complete words (e.g: to not block "computadora" because it contains "puta")
            const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
            if (wordRegex.test(lowerText)) {
                return false;
            }
        }

        return true;
    };

    const handleAddComment = async () => {
        const comment = newCommentText.trim();
        if (!comment || !video) return;

        // Validate the comment before sending
        if (!isCommentSafe(comment)) {
            alert("Your comment contains inappropriate language, URLs, or spam, and cannot be posted.");
            return;
        }

        setIsSubmittingComment(true);
        try {
            const updatedVideo = await addCommentToVideo(video.uuid, { text: comment }, video.comment);
            if (updatedVideo) {
                setVideo(updatedVideo);
                setNewCommentText("");
            }
        } catch (error) {
            console.error("Error adding comment:", error);
            alert("Error adding comment");
        } finally {
            setIsSubmittingComment(false);
        }
    };

    // Report Modal State
    const [openReportModal, setOpenReportModal] = useState(false);
    const [reportEmail, setReportEmail] = useState("");
    const [reportReason, setReportReason] = useState("");
    const [reportDescription, setReportDescription] = useState("");
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);

    const handleReport = () => {
        setOpenReportModal(true);
    };

    const handleSubmitReport = async () => {
        if (!reportEmail.trim() || !reportReason || !video) return;
        setIsSubmittingReport(true);
        try {
            const updatedVideo = await addReportToVideo(
                video.uuid,
                {
                    email: reportEmail.trim(),
                    reason: reportReason,
                    description: reportDescription.trim()
                },
                video.report || 0,
                video.report_comment || ""
            );

            if (updatedVideo) {
                setVideo({ ...updatedVideo });
                alert("Thank you for your report. Our team will review this content.");
                setOpenReportModal(false);
                setReportEmail("");
                setReportReason("");
                setReportDescription("");
            }
        } catch (error) {
            console.error("Error submitting report:", error);
            alert("There was an error sending the report. Please try again.");
        } finally {
            setIsSubmittingReport(false);
        }
    };

    const handleVote = async (type: 'likes' | 'dislikes') => {
        if (!video || hasVoted) return;

        try {
            const visitorId = getVisitorId();
            const count = type === 'likes' ? (video.likes || 0) : (video.dislikes || 0);

            const updatedVideoData = await registerVote(video.uuid, visitorId, type, count);

            if (updatedVideoData) {
                // Synchronize local state safely preserving optional fields if necessary
                setVideo(prev => prev ? ({ ...prev, ...updatedVideoData }) : updatedVideoData);
                setHasVoted(type);
                localStorage.setItem(`voted_${video.uuid}`, type);
            } else {
                alert("You have already reacted to this video.");
                // Synchronize local vote state if the server said we already voted
                setHasVoted(type);
                localStorage.setItem(`voted_${video.uuid}`, type);
            }

        } catch (error: any) {
            console.error('Error voting:', error);
            alert("There was an error processing your vote.");
        }
    };

    useEffect(() => {
        if (id) {
            const fetchVideo = async () => {
                setLoading(true);
                try {
                    const idStr = id as string;

                    // Case 1: Pattern UUID-title (professional SEO style)
                    // UUID is exactly 36 characters
                    const potentialUuid = idStr.length >= 36 ? idStr.substring(0, 36) : "";
                    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(potentialUuid);

                    let data;
                    if (isUuid) {
                        data = await getVideoById(potentialUuid);
                    } else {
                        // Case 2: Legacy or Title-only URL
                        // Try by UUID directly (maybe the full param is a UUID)
                        data = await getVideoById(idStr);
                        if (!data) {
                            // If still not found, search by the slug/title
                            data = await getVideoByTitle(idStr);
                        }
                    }

                    if (data) {
                        setVideo(data);
                        const voted = localStorage.getItem(`voted_${data.uuid}`);
                        if (voted === 'likes' || voted === 'dislikes') {
                            setHasVoted(voted as any);
                        }
                        const related = await getRelatedVideosByTags(data.tags, 30, data.uuid);
                        setRelatedVideos(related);
                    }

                } catch (error) {
                    console.error("Error loading video:", error);
                } finally {
                    setLoading(false);
                    // Reset view counter when video changes
                    viewedRef.current = false;
                }
            };
            fetchVideo();
        }
    }, [id]);

    const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
    const [currentPreview, setCurrentPreview] = useState<{ [key: string]: number }>({});
    const touchPreviewVideoRef = useRef<string | null>(null);
    const suppressNextRecommendationClickRef = useRef(false);
    const touchPreviewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (hoveredVideo) {
            const vid = relatedVideos.find((v) => v.uuid === hoveredVideo);
            const previewSource = vid?.preview_url || vid?.preview;

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
    }, [hoveredVideo, relatedVideos]);

    useEffect(() => {
        return () => {
            if (touchPreviewTimeoutRef.current) {
                clearTimeout(touchPreviewTimeoutRef.current);
            }
        };
    }, []);

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', color: '#fff' }}>
                <Head>
                    <title>Loading Video - novapornx</title>
                </Head>
                <CircularProgress color="secondary" />
            </Box>
        );
    }

    if (!video) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', color: '#fff' }}>
                <Head>
                    <title>Video Not Found - novapornx</title>
                </Head>
                <Typography variant="h5">Video not found</Typography>
            </Box>
        );
    }


    const handleDownload = async () => {
        if (video && video.uuid) {
            setIsDownloading(true);
            try {
                // Register visitor information who downloads including the video
                trackVisitorAction(video.video_stream_url);

                // Now call the segment unifier
                const downloadUrl = `/api/download-video?uuid=${video.uuid}`;

                // Create an invisible link to force the download of the joined stream
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', `${video.titulo || 'video'}.mp4`);
                document.body.appendChild(link);
                link.click();
                link.remove();

            } catch (err) {
                console.error("Download error:", err);
                alert("Error processing the download");
            } finally {
                // Give a small margin so the browser starts the download
                setTimeout(() => setIsDownloading(false), 2000);
            }
        }
    };

    const handleClickRecommendation = (vid: SupabaseVideo) => {
        if (suppressNextRecommendationClickRef.current) {
            suppressNextRecommendationClickRef.current = false;
            return;
        }

        const title = vid.titulo || vid.title || "video";
        const slug = title
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-');         // Replace multiple - with single -

        router.push(`/video/${vid.uuid}-${slug}`);
    };

    const handleTouchRecommendationPreview = (vid: SupabaseVideo) => {
        if (touchPreviewTimeoutRef.current) {
            clearTimeout(touchPreviewTimeoutRef.current);
        }

        if (touchPreviewVideoRef.current !== vid.uuid) {
            suppressNextRecommendationClickRef.current = true;
            touchPreviewVideoRef.current = vid.uuid;
        }

        setHoveredVideo(vid.uuid);
        setCurrentPreview((prev) => ({
            ...prev,
            [vid.uuid]: 0
        }));

        touchPreviewTimeoutRef.current = setTimeout(() => {
            if (touchPreviewVideoRef.current === vid.uuid) {
                touchPreviewVideoRef.current = null;
                setHoveredVideo(null);
            }
        }, 3500);
    };

    // Helper: converts any external CDN URL to a local proxied route to prevent CORS
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
        // If it's just the filename (e.g: UUID.webp without protocol or slash)
        if (!url.startsWith('http') && !url.startsWith('/')) {
            return `/capturas-proxy/${url}`;
        }
        return url;
    };
    //console.log("jejejejjeje", video)
    return (
        <div style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <NavBar sx={{ backgroundColor: "#e91ec4" }} />
            <NavMenu sx={{ backgroundColor: "#e91ec4" }} />

            <Head>
                <title>{video.titulo} - novapornx</title>
                <meta name="description" content={video.descripcion || `Watch ${video.titulo} on novapornx. Free premium HD latina videos and amateur HD porn colombian available for streaming and download.`} />
                {video.tags && <meta name="keywords" content={`${video.tags}, free premium hd latina videos, amateur hd porn colombian, free 4k homemade latina porn, hd milf amateur videos free, novapornx`} />}

                {/* Canonical */}
                <link rel="canonical" href={`https://novapornx.com/video/${id}`} />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="video.other" />
                <meta property="og:url" content={`https://novapornx.com/video/${id}`} />
                <meta property="og:title" content={`${video.titulo} - novapornx`} />
                <meta property="og:description" content={video.descripcion || `Watch ${video.titulo} on novapornx. Free premium HD latina videos and amateur HD porn.`} />
                <meta property="og:image" content={video.imagen_url || "https://novapornx.com/assets/backGround.png"} />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content={`https://novapornx.com/video/${id}`} />
                <meta property="twitter:title" content={`${video.titulo} - novapornx`} />
                <meta property="twitter:description" content={video.descripcion || `Watch ${video.titulo} on novapornx. Free HD porn videos and amateur content.`} />
                <meta property="twitter:image" content={video.imagen_url || "https://novapornx.com/assets/backGround.png"} />

                {/* JSON-LD Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "VideoObject",
                            "name": video.titulo,
                            "description": video.descripcion || `Watch ${video.titulo} in HD on novapornx (novaporn).`,
                            "thumbnailUrl": [video.imagen_url || "https://novapornx.com/assets/backGround.png"],
                            "uploadDate": video.created_at || new Date().toISOString(),
                            "duration": video.duracion ? `PT${video.duracion.replace(':', 'M')}S` : "PT0M0S",
                            "embedUrl": `https://novapornx.com/video/${id}`,
                            "interactionStatistic": {
                                "@type": "InteractionCounter",
                                "interactionType": { "@type": "LikeAction" },
                                "userInteractionCount": video.likes || 0
                            }
                        })
                    }}
                />
            </Head>

            <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: '0' }}>
                {video.titulo} - novapornx, Free Premium HD Latina Videos, Amateur HD Porn Colombian
            </h1>

            <Container
                maxWidth={false}
                sx={{
                    flexGrow: 1,
                    px: { xs: 0, sm: 2, md: 3 },
                    py: { xs: 1, sm: 2, md: 4 },
                }}
            >
                <Grid container rowSpacing={{ xs: 2, md: 4 }} columnSpacing={{ xs: 0, sm: 2, md: 4 }} sx={{ mx: 0, width: '100%' }}>
                    {/* Left Column: Player and Main Content */}
                    <Grid item xs={12} lg={8.5} sx={{ minWidth: 0 }}>
                        <Box
                            sx={{
                                width: '100%',
                                mb: { xs: 2, md: 3 },
                                borderRadius: { xs: 0, sm: '14px' },
                                overflow: 'hidden',
                                bgcolor: '#000',
                            }}
                        >
                            <VideoPlayer
                                ref={videoPlayerRef}
                                videoEmbedUrl={video.video_stream_url || `/api/media?uuid=${video.uuid}&type=stream`}
                                poster={video.imagen_url}
                                autoplay={false}
                                muted={true}
                                onPlay={handlePlay}
                            />
                        </Box>

                        {/* Info and Comments Section */}
                        <Box sx={{ px: { xs: 1.5, sm: 0 } }}>
                            <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', pb: { xs: 2, md: 3 }, mb: { xs: 2, md: 3 } }}>
                                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', mb: 1.5, fontSize: { xs: '1.15rem', sm: '1.4rem', md: '2rem' }, lineHeight: 1.2, overflowWrap: 'anywhere' }}>
                                    {video.titulo}
                                </Typography>
                                <Stack direction="row" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: { xs: '0.78rem', sm: '0.9rem' }, alignItems: 'center', flexWrap: 'wrap', gap: { xs: 1, sm: 2 } }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <AccessTime sx={{ fontSize: '1rem' }} />
                                        {
                                            video?.duracion ||
                                            (video?.duracion_segundos
                                                ? (() => {
                                                    const totalSeconds = Number(video.duracion_segundos);
                                                    const hours = Math.floor(totalSeconds / 3600);
                                                    const minutes = Math.floor((totalSeconds % 3600) / 60);
                                                    const seconds = totalSeconds % 60;

                                                    return hours > 0
                                                        ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                                                        : `${minutes}:${seconds.toString().padStart(2, '0')}`;
                                                })()
                                                : "Unknown")
                                        }
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#00bcd4' }}>
                                        <Visibility sx={{ fontSize: '1rem' }} />
                                        {video.views || 0}
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <CalendarToday sx={{ fontSize: '1rem' }} />
                                        {video.created_at ? new Date(video.created_at).toLocaleDateString() : 'N/A'}
                                    </Box>
                                </Stack>
                            </Box>

                            {/* Voting and Report Buttons */}
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, max-content)' },
                                    gap: { xs: 1, sm: 1.5 },
                                    alignItems: 'stretch',
                                    mb: { xs: 3, md: 4 },
                                    '& .MuiButton-root': {
                                        width: { xs: '100%', md: 'auto' },
                                        minHeight: { xs: 46, sm: 44 },
                                        whiteSpace: 'nowrap',
                                    },
                                    '& .MuiButton-startIcon': {
                                        mr: { xs: 0.75, sm: 1 },
                                    },
                                }}
                            >
                                <Button
                                    variant="outlined"
                                    startIcon={<ThumbUp />}
                                    onClick={() => handleVote('likes')}
                                    disabled={!!hasVoted}
                                    sx={{
                                        color: hasVoted === 'likes' ? '#4caf50' : 'rgba(76, 175, 80, 0.7)',
                                        borderColor: hasVoted === 'likes' ? '#4caf50' : 'rgba(76, 175, 80, 0.3)',
                                        backgroundColor: hasVoted === 'likes' ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                                        '&:hover': {
                                            borderColor: '#4caf50',
                                            backgroundColor: 'rgba(76, 175, 80, 0.05)',
                                            color: '#4caf50'
                                        },
                                        borderRadius: '10px',
                                        textTransform: 'none',
                                        fontWeight: 'bold',
                                        px: { xs: 1.5, sm: 3 },
                                        '&.Mui-disabled': {
                                            color: hasVoted === 'likes' ? '#4caf50' : 'rgba(255,255,255,0.3)',
                                            borderColor: hasVoted === 'likes' ? '#4caf50' : 'rgba(255,255,255,0.1)',
                                            opacity: 1
                                        }
                                    }}
                                >
                                    {video.likes ?? 0}
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<ThumbDown />}
                                    onClick={() => handleVote('dislikes')}
                                    disabled={!!hasVoted}
                                    sx={{
                                        color: hasVoted === 'dislikes' ? '#f44336' : 'rgba(244, 67, 54, 0.7)',
                                        borderColor: hasVoted === 'dislikes' ? '#f44336' : 'rgba(244, 67, 54, 0.3)',
                                        backgroundColor: hasVoted === 'dislikes' ? 'rgba(244, 67, 54, 0.1)' : 'transparent',
                                        '&:hover': {
                                            borderColor: '#f44336',
                                            backgroundColor: 'rgba(244, 67, 54, 0.05)',
                                            color: '#f44336'
                                        },
                                        borderRadius: '10px',
                                        textTransform: 'none',
                                        fontWeight: 'bold',
                                        px: { xs: 1.5, sm: 3 },
                                        '&.Mui-disabled': {
                                            color: hasVoted === 'dislikes' ? '#f44336' : 'rgba(255,255,255,0.3)',
                                            borderColor: hasVoted === 'dislikes' ? '#f44336' : 'rgba(255,255,255,0.1)',
                                            opacity: 1
                                        }
                                    }}
                                >
                                    {video.dislikes ?? 0}
                                </Button>

                                <Button
                                    variant="contained"
                                    onClick={handleDownload}
                                    disabled={isDownloading}
                                    sx={{
                                        gridColumn: { xs: '1 / -1', sm: 'auto' },
                                        backgroundColor: '#f013e5',
                                        '&:hover': { backgroundColor: '#d011c5' },
                                        borderRadius: '10px',
                                        textTransform: 'none',
                                        fontWeight: 'bold',
                                        px: { xs: 2, sm: 3 },
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 1
                                    }}
                                >
                                    {isDownloading ? (
                                        <CircularProgress size={20} sx={{ color: '#fff' }} />
                                    ) : (
                                        <Box component="img" src="/assets/loader.png" sx={{ width: 20, height: 20 }} />
                                    )}
                                    {isDownloading ? 'Generating...' : 'Download'}
                                    {!isDownloading && <Favorite sx={{ fontSize: 16, ml: 0.5 }} />}
                                </Button>

                                <Button
                                    variant="outlined"
                                    startIcon={<Flag />}
                                    onClick={handleReport}
                                    sx={{
                                        color: 'rgba(255,255,255,0.6)',
                                        borderColor: 'rgba(255,255,255,0.2)',
                                        '&:hover': { borderColor: '#fff', color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' },
                                        borderRadius: '10px',
                                        textTransform: 'none',
                                        px: { xs: 1.5, sm: 3 },
                                    }}
                                >
                                    Report
                                </Button>
                            </Box>

                            <Box sx={{ p: 2.5, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', borderLeft: '4px solid #f013e5', mb: 4 }}>
                                <Typography variant="body1" sx={{ lineHeight: 1.6, color: '#ccc', mb: 2 }}>
                                    {video.descripcion || "No description available."}
                                </Typography>

                                {video.actresses && video.actresses.trim() !== "" && (
                                    <Box sx={{ mb: 2, mt: 1 }}>
                                        <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>
                                            Actresses:
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {video.actresses.split(',').map((actress, index) => (
                                                <Chip
                                                    key={index}
                                                    label={actress.trim()}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: 'rgba(240, 19, 229, 0.1)',
                                                        color: '#f013e5',
                                                        fontWeight: 'bold',
                                                        borderRadius: '6px',
                                                        border: '1px solid rgba(240, 19, 229, 0.3)',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(240, 19, 229, 0.2)',
                                                            borderColor: '#f013e5'
                                                        }
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                {video.tags && (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                                        {video.tags.split(',').map((tag, index) => (
                                            <Chip
                                                key={index}
                                                label={tag.trim()}
                                                size="small"
                                                icon={<Favorite sx={{ fontSize: '14px !important', color: '#f013e5 !important' }} />}
                                                sx={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                    color: '#fff',
                                                    borderRadius: '6px',
                                                    border: '1px solid rgba(240, 19, 229, 0.2)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(240, 19, 229, 0.1)',
                                                        borderColor: '#f013e5'
                                                    },
                                                    '& .MuiChip-icon': {
                                                        marginLeft: '8px'
                                                    }
                                                }}
                                            />
                                        ))}
                                    </Box>
                                )}
                            </Box>



                            {/* Comments Section */}
                            <Box id="comments-section" sx={{ mt: 6, mb: 6 }}>
                                <Typography variant="h6" sx={{ color: '#fff', mb: 3, fontWeight: 'bold', borderLeft: '4px solid #f013e5', pl: 2 }}>
                                    Comments ({parseComments(video.comment).length})
                                </Typography>

                                <Box sx={{ mb: 4, backgroundColor: 'rgba(255,255,255,0.03)', p: 3, borderRadius: '12px' }}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        placeholder="Write your comment..."
                                        value={newCommentText}
                                        onChange={(e) => setNewCommentText(e.target.value)}
                                        sx={{
                                            backgroundColor: 'rgba(0,0,0,0.3)',
                                            borderRadius: '8px',
                                            '& .MuiOutlinedInput-root': {
                                                color: '#fff',
                                                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                                '&:hover fieldset': { borderColor: '#f013e5' },
                                                '&.Mui-focused fieldset': { borderColor: '#f013e5' },
                                            }
                                        }}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                        <Button
                                            variant="contained"
                                            onClick={handleAddComment}
                                            disabled={isSubmittingComment || !newCommentText.trim()}
                                            sx={{
                                                backgroundColor: '#f013e5',
                                                '&:hover': { backgroundColor: '#e91ec4' },
                                                fontWeight: 'bold',
                                                borderRadius: '20px',
                                                px: 4
                                            }}
                                        >
                                            {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                                        </Button>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {parseComments(video.comment).length > 0 ? (
                                        parseComments(video.comment).reverse().map((c: any, index: number) => (
                                            <Paper key={index} sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <Box sx={{ display: 'flex', gap: 2 }}>
                                                    <Avatar sx={{ bgcolor: '#f013e5', fontSize: '14px' }}>U</Avatar>
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                            <Typography variant="subtitle2" sx={{ color: '#f013e5', fontWeight: 'bold' }}>
                                                                Anonymous
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                                                                {c.date ? new Date(c.date).toLocaleDateString() : 'Recently'}
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="body2" sx={{ color: '#eee', lineHeight: 1.5 }}>
                                                            {c.text}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        ))
                                    ) : (
                                        <Typography sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', py: 4 }}>
                                            No comments yet. Be the first to comment!
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </Box>

                    </Grid>


                    {/* Right Column: Recommendations Sidebar */}
                    <Grid item xs={12} lg={3.5}>
                        <Box sx={{
                            position: { lg: 'sticky' },
                            top: { lg: 24 },
                            maxHeight: { lg: 'calc(100vh - 48px)' },
                            overflowY: { lg: 'auto' },
                            pr: { lg: 1 },
                            '&::-webkit-scrollbar': { width: '9px' },
                            '&::-webkit-scrollbar-thumb': {
                                bgcolor: 'rgba(240, 19, 229, 0.3)',
                                borderRadius: '10px'
                            }
                        }}>
                            {/* Ad banner — centrado en mobile */}
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                width: "100%",
                                overflow: 'hidden'

                            }}>
                                <iframe
                                    src="//a.magsrv.com/iframe.php?idzone=5941696&size=300x250"
                                    width="300"
                                    height="250"
                                    scrolling="no"
                                    marginWidth={0}
                                    marginHeight={0}
                                    frameBorder={0}
                                    style={{ maxWidth: '100%' }}
                                />
                            </Box>

                            <Typography variant="h6" sx={{
                                color: '#fff',
                                mb: 2,
                                fontWeight: 'bold',
                                borderLeft: '4px solid #f013e5',
                                pl: 2,
                                fontSize: { xs: '1rem', sm: '1.1rem' }
                            }}>
                                Related Porn Videos
                            </Typography>

                            <Grid container spacing={1}>
                                {relatedVideos
                                    .slice(
                                        (relatedPage - 1) * videosPerRelatedPage,
                                        relatedPage * videosPerRelatedPage
                                    )
                                    .map((vid: SupabaseVideo) => {
                                        const previewUrl = vid.preview_url || vid.preview;
                                        const thumbnails =
                                            previewUrl &&
                                                !previewUrl.endsWith('.mp4') &&
                                                !previewUrl.endsWith('.webm')
                                                ? previewUrl
                                                    .split(',')
                                                    .map((u) => toProxiedUrl(u.trim()))
                                                    .filter(Boolean)
                                                : [];

                                        const isHovered = hoveredVideo === vid.uuid;
                                        const isVideoPreview =
                                            previewUrl &&
                                            (previewUrl.endsWith('.mp4') ||
                                                previewUrl.endsWith('.webm'));
                                        const currentImg =
                                            isHovered && thumbnails.length > 0
                                                ? thumbnails[currentPreview[vid.uuid] || 0]
                                                : toProxiedUrl(vid.imagen_url || vid.img_src);

                                        return (
                                            // xs=6 → 2 columnas en mobile
                                            // sm=4 → 3 columnas en tablet
                                            // md=3 → 4 columnas en pantallas medianas (cuando el sidebar ocupa todo el ancho)
                                            // lg=6 → 2 columnas cuando está en la sidebar lateral
                                            <Grid item xs={6} sm={4} md={3} lg={6} key={vid.uuid}>
                                                <Box
                                                    sx={{
                                                        ...styles.videoCardSx,
                                                        cursor: 'pointer',
                                                        borderRadius: '8px',
                                                        overflow: 'hidden',
                                                        transition: 'transform 0.2s',
                                                        '&:hover': { transform: 'scale(1.02)' }
                                                    }}
                                                    onMouseEnter={() => {
                                                        setHoveredVideo(vid.uuid);
                                                        setCurrentPreview((prev) => ({
                                                            ...prev,
                                                            [vid.uuid]: 0
                                                        }));
                                                    }}
                                                    onMouseLeave={() => setHoveredVideo(null)}
                                                    onClick={() => handleClickRecommendation(vid)}
                                                >
                                                    {/* Thumbnail */}
                                                    <Box sx={{
                                                        position: 'relative',
                                                        width: '100%',
                                                        paddingTop: '56.25%', // 16:9 ratio
                                                        bgcolor: '#111'
                                                    }}>
                                                        <Box sx={{
                                                            position: 'absolute',
                                                            inset: 0
                                                        }}>
                                                            {isHovered && isVideoPreview ? (
                                                                <video
                                                                    src={`/api/media?uuid=${vid.uuid}&type=preview`}
                                                                    autoPlay
                                                                    muted
                                                                    loop
                                                                    playsInline
                                                                    style={{
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        objectFit: 'cover'
                                                                    }}
                                                                />
                                                            ) : (
                                                                <img
                                                                    src={currentImg}
                                                                    alt={vid.titulo}
                                                                    style={{
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        objectFit: 'cover',
                                                                        display: 'block'
                                                                    }}
                                                                />
                                                            )}
                                                        </Box>
                                                    </Box>

                                                    {/* Metadata */}
                                                    <Box sx={{
                                                        p: { xs: '4px 6px', sm: '6px 8px' },
                                                        bgcolor: 'rgba(0,0,0,0.6)'
                                                    }}>
                                                        <Typography sx={{
                                                            color: '#fff',
                                                            fontSize: { xs: '11px', sm: '12px' },
                                                            fontWeight: 500,
                                                            lineHeight: 1.3,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden'
                                                        }}>
                                                            {vid.titulo}
                                                        </Typography>

                                                        <Box sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            mt: '4px',
                                                            gap: 1
                                                        }}>
                                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                                <span style={{
                                                                    fontSize: '11px',
                                                                    color: '#ccc',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '3px'
                                                                }}>
                                                                    <Visibility sx={{ fontSize: '12px', color: '#00bcd4' }} />
                                                                    {vid.views || 0}
                                                                </span>
                                                                <span style={{ ...styles.durationLabel, fontSize: '11px' }}>
                                                                    ⏳{' '}
                                                                    {vid.duracion_segundos && vid.duracion_segundos > 0
                                                                        ? `${Math.floor(vid.duracion_segundos / 60)}:${(vid.duracion_segundos % 60)
                                                                            .toString()
                                                                            .padStart(2, '0')}`
                                                                        : vid.duracion || '0:00'}
                                                                </span>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        );
                                    })}
                            </Grid>

                            {/* Related Videos Pagination Controls */}
                            {relatedVideos.length > videosPerRelatedPage && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2, gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        disabled={relatedPage === 1}
                                        onClick={() => setRelatedPage(prev => Math.max(1, prev - 1))}
                                        sx={{
                                            borderColor: 'rgba(240, 19, 229, 0.5)',
                                            color: '#f013e5',
                                            '&:disabled': { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }
                                        }}
                                    >
                                        Previous
                                    </Button>
                                    <Typography sx={{ color: '#fff', alignSelf: 'center', fontSize: '0.9rem' }}>
                                        {relatedPage} / {Math.ceil(relatedVideos.length / videosPerRelatedPage)}
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        disabled={relatedPage >= Math.ceil(relatedVideos.length / videosPerRelatedPage)}
                                        onClick={() => setRelatedPage(prev => Math.min(Math.ceil(relatedVideos.length / videosPerRelatedPage), prev + 1))}
                                        sx={{
                                            borderColor: 'rgba(240, 19, 229, 0.5)',
                                            color: '#f013e5',
                                            '&:disabled': { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }
                                        }}
                                    >
                                        Next
                                    </Button>
                                </Box>
                            )}
                            {/* Ad banner — centrado en mobile */}
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                width: '100%',
                                overflow: 'hidden'
                            }}>
                                <iframe
                                    src="//a.magsrv.com/iframe.php?idzone=5941704&size=300x250"
                                    width="300"
                                    height="250"
                                    scrolling="no"
                                    marginWidth={0}
                                    marginHeight={0}
                                    frameBorder={0}
                                    style={{ maxWidth: '100%' }}
                                />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>

            {/* Report Video Modal */}
            <Modal
                open={openReportModal}
                onClose={() => setOpenReportModal(false)}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                        sx: { backgroundColor: 'rgba(0, 0, 0, 0.9)' }
                    },
                }}
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '95%', sm: 500 },
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    bgcolor: '#111',
                    backgroundImage: 'linear-gradient(rgba(17, 17, 17, 0.85), rgba(17, 17, 17, 0.85)), url("/assets/imgReport.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '20px',
                    boxShadow: '0 0 30px rgba(240, 19, 229, 0.3)',
                    p: 4,
                    border: '1px solid rgba(240, 19, 229, 0.2)',
                    outline: 'none'
                }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Flag sx={{ color: '#f013e5', fontSize: 40, mb: 1 }} />
                        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>
                            Report Video
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            Help us keep the community safe.
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            fullWidth
                            label="Your Email"
                            variant="outlined"
                            value={reportEmail}
                            onChange={(e) => setReportEmail(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: '#fff',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                    '&:hover fieldset': { borderColor: '#f013e5' },
                                    '&.Mui-focused fieldset': { borderColor: '#f013e5' },
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
                                '& .MuiInputLabel-root.Mui-focused': { color: '#f013e5' }
                            }}
                        />

                        <FormControl>
                            <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2, fontWeight: 'bold' }}>
                                Reason for reporting:
                            </Typography>
                            <RadioGroup
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                                sx={{ gap: 1 }}
                            >
                                {[
                                    "Violent or Abusive",
                                    "Young, Minor or Underage",
                                    "Contains Non-consensual acts",
                                    "Not a Porn Video",
                                    "Spam or Misleading",
                                    "Wrong Categories or Tags",
                                    "Other Reasons"
                                ].map((option) => (
                                    <Paper
                                        key={option}
                                        onClick={() => setReportReason(option)}
                                        sx={{
                                            backgroundColor: reportReason === option ? 'rgba(240, 19, 229, 0.1)' : 'rgba(255,255,255,0.02)',
                                            border: reportReason === option ? '1px solid #f013e5' : '1px solid rgba(255,255,255,0.05)',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255,255,255,0.05)',
                                                borderColor: reportReason === option ? '#f013e5' : 'rgba(255,255,255,0.2)'
                                            }
                                        }}
                                    >
                                        <FormControlLabel
                                            value={option}
                                            control={<Radio sx={{
                                                color: 'rgba(255,255,255,0.3)',
                                                '&.Mui-checked': { color: '#f013e5' }
                                            }} />}
                                            label={option}
                                            sx={{
                                                width: '100%',
                                                m: 0,
                                                p: 1.5,
                                                color: '#fff',
                                                '& .MuiFormControlLabel-label': { fontWeight: 500 }
                                            }}
                                        />
                                    </Paper>
                                ))}
                            </RadioGroup>
                        </FormControl>

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Additional details (optional)"
                            variant="outlined"
                            value={reportDescription}
                            onChange={(e) => setReportDescription(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: '#fff',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                    '&:hover fieldset': { borderColor: '#f013e5' },
                                    '&.Mui-focused fieldset': { borderColor: '#f013e5' },
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
                                '& .MuiInputLabel-root.Mui-focused': { color: '#f013e5' }
                            }}
                        />

                        <Box sx={{ display: 'flex', gap: 2, pt: 1 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => setOpenReportModal(false)}
                                sx={{
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    borderRadius: '12px',
                                    fontWeight: 'bold',
                                    '&:hover': { borderColor: '#fff' }
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleSubmitReport}
                                disabled={isSubmittingReport || !reportEmail.trim() || !reportReason}
                                sx={{
                                    backgroundColor: '#f013e5',
                                    borderRadius: '12px',
                                    fontWeight: 'bold',
                                    '&:hover': { backgroundColor: '#e91ec4' }
                                }}
                            >
                                {isSubmittingReport ? 'Sending...' : 'Submit Report'}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>
            {/* Slider de los más populares antes del paginador */}
            <TopVideosSlider />
            {/* Espacio para anuncios, ahora en línea (uno al lado del otro) - Hidden on mobile */}
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 2,
                    mt: 1,
                    mb: 1,
                    px: 1,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        width: {
                            xs: "100%",
                            sm: "100%",
                            md: "auto",
                        },
                    }}
                >
                    <iframe
                        src="//a.magsrv.com/iframe.php?idzone=5941728&size=300x100"
                        width="300"
                        height="100"
                        scrolling="no"
                        marginWidth={0}
                        marginHeight={0}
                        frameBorder={0}
                        style={{
                            border: 0,
                            maxWidth: "100%",
                        }}
                    />
                </Box>

                <Box
                    sx={{
                        width: {
                            xs: "100%",
                            md: "300px",
                        },
                        minHeight: "100px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <iframe
                        src="//a.magsrv.com/iframe.php?idzone=5941728&size=300x100"
                        width="300"
                        height="100"
                        scrolling="no"
                        marginWidth={0}
                        marginHeight={0}
                        frameBorder={0}
                    />
                </Box>
            </Box>
            <FooterComponent />
        </div>
    );
};


export default VideoPage;

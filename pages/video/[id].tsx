import { useRouter } from 'next/router';
import React, { useEffect, useState, useRef } from 'react';
import {
    getVideoById, getVideoByTitle, SupabaseVideo, registerVote,
    getRelatedVideosByTags, addCommentToVideo, addReportToVideo, incrementVideoViews
} from '@/api/videoSupabaseService';
import VideoPlayer, { VideoPlayerRef } from '@/components/VideoPlayer/VideoPlayer';
import NavBar from '@/components/NavBar/NavBar';
import NavMenu from '@/components/NavMenu/NavMenu';
import FooterComponent from '@/components/footer/Footer';
import Head from 'next/head';
import {
    Box, Typography, Container, CircularProgress, Grid, TextField, Button,
    Avatar, Paper, Modal, Backdrop, FormControl, FormControlLabel, Radio,
    RadioGroup, Stack, Chip
} from '@mui/material';
import {
    ThumbUp, ThumbDown, Flag, AccessTime, CalendarToday,
    Favorite, Visibility
} from '@mui/icons-material';
import { getVisitorId } from '@/api/visitorIdHelper';
import { trackVisitorAction } from '@/api/visitorService';
import Script from "next/script";
import TopVideosSlider from '@/components/TopVideosSlider/TopVideosSlider';
import { styles } from '../../styles/videoStyles';

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = "https://novapornx.com";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalize title into a URL-friendly slug (handles accents) */
const buildSlug = (title: string): string =>
    title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-");

/** Format seconds → mm:ss or hh:mm:ss */
const formatSeconds = (total: number): string => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return h > 0
        ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
        : `${m}:${s.toString().padStart(2, "0")}`;
};

/** ISO 8601 duration for schema.org e.g. PT4M35S */
const toISODuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `PT${h}H${m}M${s}S` : `PT${m}M${s}S`;
};

/**
 * Convert legacy "mm:ss" string duration to ISO 8601.
 * Falls back to PT0M0S if malformed.
 */
const durationStringToISO = (duracion?: string): string => {
    if (!duracion) return "PT0M0S";
    const parts = duracion.split(":").map(Number);
    if (parts.length === 2) return `PT${parts[0]}M${parts[1]}S`;
    if (parts.length === 3) return `PT${parts[0]}H${parts[1]}M${parts[2]}S`;
    return "PT0M0S";
};

/** Proxy CDN URLs to avoid CORS issues */
const toProxiedUrl = (url?: string | null): string => {
    if (!url) return "/assets/placeholder.png";
    if (url.includes("pub-c9afcfde57fd4b9fbc70f2802ea3ed05.r2.dev"))
        return url.replace("https://pub-c9afcfde57fd4b9fbc70f2802ea3ed05.r2.dev", "/capturas-proxy");
    if (url.includes("pub-8a7870d75cc841b788eafa8b0f0fbf0c.r2.dev"))
        return url.replace("https://pub-8a7870d75cc841b788eafa8b0f0fbf0c.r2.dev", "/media-proxy");
    if (url.includes("xmoviescdn.online"))
        return url.replace("https://xmoviescdn.online", "/image-proxy");
    if (!url.startsWith("http") && !url.startsWith("/"))
        return `/capturas-proxy/${url}`;
    return url;
};

/** Basic comment safety check */
const isCommentSafe = (text: string): boolean => {
    const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
    const domainPattern = /[a-zA-Z0-9-.]+\.(com|net|org|info|site|club|xxx|pro|co|me|ly)\b/gi;
    if (urlPattern.test(text) || domainPattern.test(text)) return false;
    const badWords = [
        "puta", "putitas", "puto", "mierda", "pendejo", "cabron", "cabrón", "verga",
        "panocha", "zorra", "perra", "joto", "maricon", "maricón", "chinga", "chingar",
        "chingas", "fuck", "bitch", "shit", "asshole", "dick", "cock", "pussy", "cunt",
        "whore", "slut", "spam", "viagra", "casino", "cripto", "crypto", "onlyfans",
        "telegram", "whatsapp", "inversión", "inversion",
    ];
    const lower = text.toLowerCase();
    return !badWords.some((w) => new RegExp(`\\b${w}\\b`, "i").test(lower));
};

/** Parse comments stored as "{obj}. {obj}" string */
const parseComments = (commentStr?: string): any[] => {
    if (!commentStr) return [];
    try {
        return commentStr
            .split(". ")
            .map((s) => { try { return JSON.parse(s); } catch { return null; } })
            .filter(Boolean);
    } catch { return []; }
};

// ─── Component ────────────────────────────────────────────────────────────────

const VideoPage = () => {
    const router = useRouter();
    const { id } = router.query;

    const [video, setVideo] = useState<SupabaseVideo | null>(null);
    const [loading, setLoading] = useState(true);
    const [relatedVideos, setRelatedVideos] = useState<SupabaseVideo[]>([]);
    const [hasVoted, setHasVoted] = useState<"likes" | "dislikes" | null>(null);
    const [newCommentText, setNewCommentText] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [relatedPage, setRelatedPage] = useState(1);
    const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
    const [currentPreview, setCurrentPreview] = useState<{ [key: string]: number }>({});

    // Report modal state
    const [openReportModal, setOpenReportModal] = useState(false);
    const [reportEmail, setReportEmail] = useState("");
    const [reportReason, setReportReason] = useState("");
    const [reportDescription, setReportDescription] = useState("");
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);

    const videosPerRelatedPage = 13;
    const videoPlayerRef = useRef<VideoPlayerRef>(null);
    const viewedRef = useRef(false);
    const touchPreviewVideoRef = useRef<string | null>(null);
    const suppressNextRecommendationClickRef = useRef(false);
    const touchPreviewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const popupOpened = useRef(false);

    // ─── Fetch video ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (!id) return;
        const fetchVideo = async () => {
            setLoading(true);
            try {
                const idStr = id as string;
                const potentialUuid = idStr.length >= 36 ? idStr.substring(0, 36) : "";
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(potentialUuid);

                let data: SupabaseVideo | null = null;
                if (isUuid) {
                    data = await getVideoById(potentialUuid);
                } else {
                    data = await getVideoById(idStr);
                    if (!data) data = await getVideoByTitle(idStr);
                }

                if (data) {
                    setVideo(data);
                    const voted = localStorage.getItem(`voted_${data.uuid}`);
                    if (voted === "likes" || voted === "dislikes") setHasVoted(voted as any);
                    const related = await getRelatedVideosByTags(data.tags, 30, data.uuid);
                    setRelatedVideos(related);
                }
            } catch (error) {
                console.error("Error loading video:", error);
            } finally {
                setLoading(false);
                viewedRef.current = false;
            }
        };
        fetchVideo();
    }, [id]);

    // ─── Preview cycling for related videos ─────────────────────────────────
    useEffect(() => {
        if (!hoveredVideo) return;
        const vid = relatedVideos.find((v) => v.uuid === hoveredVideo);
        const previewSource = vid?.preview_url || vid?.preview;
        if (previewSource && !previewSource.endsWith(".mp4") && !previewSource.endsWith(".webm")) {
            const imgs = previewSource.split(",").map((u) => u.trim()).filter(Boolean);
            if (imgs.length > 1) {
                const interval = setInterval(() => {
                    setCurrentPreview((prev) => ({
                        ...prev,
                        [hoveredVideo]: ((prev[hoveredVideo] || 0) + 1) % imgs.length,
                    }));
                }, 1000);
                return () => clearInterval(interval);
            }
        }
    }, [hoveredVideo, relatedVideos]);

    useEffect(() => {
        return () => {
            if (touchPreviewTimeoutRef.current) clearTimeout(touchPreviewTimeoutRef.current);
        };
    }, []);

    // ─── Handlers ────────────────────────────────────────────────────────────
    const handlePlay = async () => {
        // Evita abrir más de una vez por sesión
        if (!popupOpened.current) {
            popupOpened.current = true;

            window.open(
                "https://s.pemsrv.com/v1/link.php?cat=&idzone=5944442&type=8",
                "_blank",
                "noopener,noreferrer"
            );
        }

        if (!viewedRef.current && video) {
            viewedRef.current = true;
            try {
                await incrementVideoViews(video.uuid, video.views || 0);
                setVideo((prev) => prev ? { ...prev, views: (prev.views || 0) + 1 } : prev);
            } catch (error) {
                console.error("Error incrementing views:", error);
            }
        }
    };

    const handleVote = async (type: "likes" | "dislikes") => {
        if (!video || hasVoted) return;
        try {
            const visitorId = getVisitorId();
            const count = type === "likes" ? (video.likes || 0) : (video.dislikes || 0);
            const updatedVideoData = await registerVote(video.uuid, visitorId, type, count);
            if (updatedVideoData) {
                setVideo((prev) => prev ? { ...prev, ...updatedVideoData } : updatedVideoData);
                setHasVoted(type);
                localStorage.setItem(`voted_${video.uuid}`, type);
            } else {
                alert("You have already reacted to this video.");
                setHasVoted(type);
                localStorage.setItem(`voted_${video.uuid}`, type);
            }
        } catch (error: any) {
            console.error("Error voting:", error);
            alert("There was an error processing your vote.");
        }
    };

    const handleAddComment = async () => {
        const comment = newCommentText.trim();
        if (!comment || !video) return;
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

    const handleSubmitReport = async () => {
        if (!reportEmail.trim() || !reportReason || !video) return;
        setIsSubmittingReport(true);
        try {
            const updatedVideo = await addReportToVideo(
                video.uuid,
                { email: reportEmail.trim(), reason: reportReason, description: reportDescription.trim() },
                video.report || 0,
                video.report_comment || ""
            );
            if (updatedVideo) {
                setVideo({ ...updatedVideo });
                alert("Thank you for your report. Our team will review this content.");
                setOpenReportModal(false);
                setReportEmail(""); setReportReason(""); setReportDescription("");
            }
        } catch (error) {
            console.error("Error submitting report:", error);
            alert("There was an error sending the report. Please try again.");
        } finally {
            setIsSubmittingReport(false);
        }
    };

    const handleDownload = async () => {
        if (!video?.uuid) return;

        setIsDownloading(true);

        try {
            // Abrir la URL en una nueva pestaña
            window.open(
                "https://s.pemsrv.com/v1/link.php?cat=&idzone=5943532&type=8",
                "_blank"
            );

            trackVisitorAction(video.video_stream_url);

            const link = document.createElement("a");
            link.href = `/api/download-video?uuid=${video.uuid}`;
            link.setAttribute("download", `${video.titulo || "video"}.mp4`);
            document.body.appendChild(link);
            link.click();
            link.remove();

        } catch (err) {
            console.error("Download error:", err);
            alert("Error processing the download");
        } finally {
            setTimeout(() => setIsDownloading(false), 2000);
        }
    };

    const handleClickRecommendation = (vid: SupabaseVideo) => {
        const slug = buildSlug(vid.titulo || vid.title || "video");
        router.push(`/video/${vid.uuid}-${slug}`);
    };

    const handleTouchRecommendationPreview = (vid: SupabaseVideo) => {
        if (touchPreviewTimeoutRef.current) clearTimeout(touchPreviewTimeoutRef.current);
        if (touchPreviewVideoRef.current !== vid.uuid) {
            touchPreviewVideoRef.current = vid.uuid;
        }
        setHoveredVideo(vid.uuid);
        setCurrentPreview((prev) => ({ ...prev, [vid.uuid]: 0 }));
        touchPreviewTimeoutRef.current = setTimeout(() => {
            if (touchPreviewVideoRef.current === vid.uuid) {
                touchPreviewVideoRef.current = null;
                setHoveredVideo(null);
            }
        }, 3500);
    };

    // ─── Loading / not found states ──────────────────────────────────────────
    if (loading) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#000", color: "#fff" }}>
                <Head><title>Loading Video – NovaPornX</title></Head>
                <CircularProgress color="secondary" />
            </Box>
        );
    }

    if (!video) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#000", color: "#fff" }}>
                <Head>
                    <title>Video Not Found – NovaPornX</title>
                    <meta name="robots" content="noindex, nofollow" />
                </Head>
                <Typography variant="h5">Video not found</Typography>
            </Box>
        );
    }

    // ─── Derived SEO values (computed once, after video is loaded) ───────────
    const videoTitle = video.titulo || "HD Video";
    const slug = buildSlug(videoTitle);
    const canonicalUrl = `${BASE_URL}/video/${video.uuid}-${slug}`;

    // ✅ FIX: use UUID-slug canonical, not the raw `id` param from URL
    // The raw `id` could be a legacy format; canonical must always be the clean URL
    const pageTitle = `${videoTitle} – Free HD Porn Video | NovaPornX`;
    const pageDescription =
        video.descripcion ||
        `Watch "${videoTitle}" in full HD on NovaPornX. Free premium adult videos, no registration required.`;

    const isoUploadDate = video.created_at || new Date().toISOString();
    const isoDuration = video.duracion_segundos && video.duracion_segundos > 0
        ? toISODuration(video.duracion_segundos)
        : durationStringToISO(video.duracion);

    const thumbnailUrl = video.imagen_url || `${BASE_URL}/assets/backGround.png`;
    const tags = video.tags ? video.tags.split(",").map((t: string) => t.trim()) : [];
    const actresses = video.actresses ? video.actresses.split(",").map((a: string) => a.trim()) : [];
    const comments = parseComments(video.comment);

    // ─── JSON-LD: VideoObject (primary, rich-results eligible) ──────────────
    const videoObjectSchema = {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": videoTitle,
        "description": pageDescription,
        "thumbnailUrl": [thumbnailUrl],
        "uploadDate": isoUploadDate,
        "duration": isoDuration,
        "contentUrl": canonicalUrl,
        "embedUrl": canonicalUrl,
        "url": canonicalUrl,
        "inLanguage": "es",
        "interactionStatistic": [
            {
                "@type": "InteractionCounter",
                "interactionType": "https://schema.org/WatchAction",
                "userInteractionCount": video.views || 0,
            },
            {
                "@type": "InteractionCounter",
                "interactionType": "https://schema.org/LikeAction",
                "userInteractionCount": video.likes || 0,
            },
        ],
        ...(tags.length > 0 ? { "keywords": tags.join(", ") } : {}),
        ...(actresses.length > 0 ? { "actor": actresses.map((name: string) => ({ "@type": "Person", "name": name })) } : {}),
    };

    // ─── JSON-LD: BreadcrumbList ─────────────────────────────────────────────
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": "Videos", "item": `${BASE_URL}/videos` },
            { "@type": "ListItem", "position": 3, "name": videoTitle, "item": canonicalUrl },
        ],
    };

    // ─── JSON-LD: Comments as UserReview ────────────────────────────────────
    // Only include if there are comments – gives Google more signals on the page
    const commentsSchema = comments.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": videoTitle,
        "url": canonicalUrl,
        "comment": comments.slice(0, 10).map((c: any, i: number) => ({
            "@type": "Comment",
            "position": i + 1,
            "text": c.text || "",
            "dateCreated": c.date || isoUploadDate,
            "author": { "@type": "Person", "name": "Anonymous" },
        })),
    } : null;

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <div style={{ backgroundColor: "#000", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <NavBar sx={{ backgroundColor: "#e91ec4" }} />
            <NavMenu sx={{ backgroundColor: "#e91ec4" }} />

            {/* ── SEO Head ─────────────────────────────────────────────────── */}
            <Head>
                {/* Core meta */}
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                {tags.length > 0 && (
                    <meta
                        name="keywords"
                        content={[...tags, "free hd porn", "premium porn videos", "novapornx"].join(", ")}
                    />
                )}

                {/* ✅ Canonical always uses UUID-slug format, never raw `id` param */}
                <link rel="canonical" href={canonicalUrl} />

                {/* Open Graph – video.other triggers richer previews */}
                <meta property="og:type" content="video.other" />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={thumbnailUrl} />
                <meta property="og:image:width" content="1280" />
                <meta property="og:image:height" content="720" />
                <meta property="og:site_name" content="NovaPornX" />
                <meta property="og:video" content={canonicalUrl} />
                <meta property="og:video:type" content="text/html" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={canonicalUrl} />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content={thumbnailUrl} />

                {/* ✅ JSON-LD: VideoObject – primary rich result */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(videoObjectSchema) }}
                />
                {/* ✅ JSON-LD: BreadcrumbList */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
                />
                {/* ✅ JSON-LD: Comments (optional, only if present) */}
                {commentsSchema && (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(commentsSchema) }}
                    />
                )}
            </Head>

            {/* Ads */}
            <Script src="https://a.magsrv.com/ad-provider.js" strategy="afterInteractive" />
            <ins className="eas6a97888e31" data-zoneid="5941732" />
            <Script id="magsrv-zone-5941732">
                {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
            </Script>

            <Container maxWidth={false} sx={{ flexGrow: 1, px: { xs: 0, sm: 2, md: 3 }, py: { xs: 1, sm: 2, md: 4 } }}>
                <Grid container rowSpacing={{ xs: 2, md: 4 }} columnSpacing={{ xs: 0, sm: 2, md: 4 }} sx={{ mx: 0, width: "100%" }}>

                    {/* ── Left Column: Player + Content ─────────────────────── */}
                    <Grid item xs={12} lg={8.5} sx={{ minWidth: 0 }}>
                        <Box sx={{ width: "100%", mb: { xs: 2, md: 3 }, borderRadius: { xs: 0, sm: "14px" }, overflow: "hidden", bgcolor: "#000" }}>
                            <VideoPlayer
                                ref={videoPlayerRef}
                                videoEmbedUrl={video.video_stream_url || `/api/media?uuid=${video.uuid}&type=stream`}
                                poster={video.imagen_url}
                                autoplay={false}
                                muted={true}
                                onPlay={handlePlay}
                            />
                        </Box>

                        <Box sx={{ px: { xs: 1.5, sm: 0 } }}>
                            {/* ── Title + Meta ─────────────────────────────── */}
                            <Box sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)", pb: { xs: 2, md: 3 }, mb: { xs: 2, md: 3 } }}>
                                {/*
                                    ✅ FIX: H1 is now VISIBLE on the page.
                                    The hidden H1 (clip trick) was removed — it's a cloaking signal.
                                    Typography variant="h1" renders the semantic tag AND is visible.
                                */}
                                <Typography
                                    component="h1"
                                    sx={{
                                        color: "#fff",
                                        fontWeight: "bold",
                                        mb: 1.5,
                                        fontSize: { xs: "1.15rem", sm: "1.4rem", md: "1.8rem" },
                                        lineHeight: 1.2,
                                        overflowWrap: "anywhere",
                                    }}
                                >
                                    {videoTitle}
                                </Typography>

                                <Stack
                                    direction="row"
                                    sx={{
                                        color: "rgba(255,255,255,0.6)",
                                        fontSize: { xs: "0.78rem", sm: "0.9rem" },
                                        alignItems: "center",
                                        flexWrap: "wrap",
                                        gap: { xs: 1, sm: 2 },
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <AccessTime sx={{ fontSize: "1rem" }} />
                                        {video.duracion_segundos && video.duracion_segundos > 0
                                            ? formatSeconds(Number(video.duracion_segundos))
                                            : video.duracion || "Unknown"}
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#00bcd4" }}>
                                        <Visibility sx={{ fontSize: "1rem" }} />
                                        {video.views || 0}
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <CalendarToday sx={{ fontSize: "1rem" }} />
                                        {video.created_at ? new Date(video.created_at).toLocaleDateString() : "N/A"}
                                    </Box>
                                </Stack>
                            </Box>

                            {/* ── Action Buttons ───────────────────────────── */}
                            <Box sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, max-content)" },
                                gap: { xs: 1, sm: 1.5 },
                                alignItems: "stretch",
                                mb: { xs: 3, md: 4 },
                                "& .MuiButton-root": { width: { xs: "100%", md: "auto" }, minHeight: { xs: 46, sm: 44 }, whiteSpace: "nowrap" },
                            }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<ThumbUp />}
                                    onClick={() => handleVote("likes")}
                                    disabled={!!hasVoted}
                                    aria-label={`Like this video (${video.likes ?? 0} likes)`}
                                    sx={{
                                        color: hasVoted === "likes" ? "#4caf50" : "rgba(76,175,80,0.7)",
                                        borderColor: hasVoted === "likes" ? "#4caf50" : "rgba(76,175,80,0.3)",
                                        backgroundColor: hasVoted === "likes" ? "rgba(76,175,80,0.1)" : "transparent",
                                        "&:hover": { borderColor: "#4caf50", backgroundColor: "rgba(76,175,80,0.05)", color: "#4caf50" },
                                        borderRadius: "10px", textTransform: "none", fontWeight: "bold", px: { xs: 1.5, sm: 3 },
                                        "&.Mui-disabled": { color: hasVoted === "likes" ? "#4caf50" : "rgba(255,255,255,0.3)", borderColor: hasVoted === "likes" ? "#4caf50" : "rgba(255,255,255,0.1)", opacity: 1 },
                                    }}
                                >
                                    {video.likes ?? 0}
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<ThumbDown />}
                                    onClick={() => handleVote("dislikes")}
                                    disabled={!!hasVoted}
                                    aria-label={`Dislike this video (${video.dislikes ?? 0} dislikes)`}
                                    sx={{
                                        color: hasVoted === "dislikes" ? "#f44336" : "rgba(244,67,54,0.7)",
                                        borderColor: hasVoted === "dislikes" ? "#f44336" : "rgba(244,67,54,0.3)",
                                        backgroundColor: hasVoted === "dislikes" ? "rgba(244,67,54,0.1)" : "transparent",
                                        "&:hover": { borderColor: "#f44336", backgroundColor: "rgba(244,67,54,0.05)", color: "#f44336" },
                                        borderRadius: "10px", textTransform: "none", fontWeight: "bold", px: { xs: 1.5, sm: 3 },
                                        "&.Mui-disabled": { color: hasVoted === "dislikes" ? "#f44336" : "rgba(255,255,255,0.3)", borderColor: hasVoted === "dislikes" ? "#f44336" : "rgba(255,255,255,0.1)", opacity: 1 },
                                    }}
                                >
                                    {video.dislikes ?? 0}
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleDownload}
                                    disabled={isDownloading}
                                    aria-label="Download this video"
                                    sx={{
                                        gridColumn: { xs: "1 / -1", sm: "auto" },
                                        backgroundColor: "#f013e5",
                                        "&:hover": { backgroundColor: "#d011c5" },
                                        borderRadius: "10px", textTransform: "none", fontWeight: "bold",
                                        px: { xs: 2, sm: 3 }, display: "flex", alignItems: "center", justifyContent: "center", gap: 1,
                                    }}
                                >
                                    {isDownloading
                                        ? <CircularProgress size={20} sx={{ color: "#fff" }} />
                                        : <Box component="img" src="/assets/loader.png" sx={{ width: 20, height: 20 }} />}
                                    {isDownloading ? "Generating..." : "Download"}
                                    {!isDownloading && <Favorite sx={{ fontSize: 16, ml: 0.5 }} />}
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<Flag />}
                                    onClick={() => setOpenReportModal(true)}
                                    aria-label="Report this video"
                                    sx={{
                                        color: "rgba(255,255,255,0.6)", borderColor: "rgba(255,255,255,0.2)",
                                        "&:hover": { borderColor: "#fff", color: "#fff", bgcolor: "rgba(255,255,255,0.05)" },
                                        borderRadius: "10px", textTransform: "none", px: { xs: 1.5, sm: 3 },
                                    }}
                                >
                                    Report
                                </Button>
                            </Box>

                            {/* ── Description + Tags ───────────────────────── */}
                            <Box
                                sx={{ p: 2.5, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "12px", borderLeft: "4px solid #f013e5", mb: 4 }}
                            >
                                <Typography variant="body1" sx={{ lineHeight: 1.6, color: "#ccc", mb: 2 }}>
                                    {video.descripcion || "No description available."}
                                </Typography>

                                {actresses.length > 0 && (
                                    <Box sx={{ mb: 2, mt: 1 }}>
                                        <Typography
                                            component="h2"
                                            sx={{ color: "rgba(255,255,255,0.5)", mb: 1, textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.75rem", fontWeight: "bold" }}
                                        >
                                            Actresses:
                                        </Typography>
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                            {actresses.map((actress: string, index: number) => (
                                                <Chip
                                                    key={index}
                                                    label={actress}
                                                    size="small"
                                                    component="a"
                                                    href={`${BASE_URL}/search?q=${encodeURIComponent(actress)}`}
                                                    clickable
                                                    sx={{
                                                        backgroundColor: "rgba(240,19,229,0.1)",
                                                        color: "#f013e5",
                                                        fontWeight: "bold",
                                                        borderRadius: "6px",
                                                        border: "1px solid rgba(240,19,229,0.3)",
                                                        textDecoration: "none",
                                                        "&:hover": { backgroundColor: "rgba(240,19,229,0.2)", borderColor: "#f013e5" },
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                {/* ✅ Tags are now <a> links to /search?q=tag → crawlable internal links */}
                                {tags.length > 0 && (
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                                        {tags.map((tag: string, index: number) => (
                                            <Chip
                                                key={index}
                                                label={tag}
                                                size="small"
                                                component="a"
                                                href={`${BASE_URL}/search?q=${encodeURIComponent(tag)}`}
                                                clickable
                                                icon={<Favorite sx={{ fontSize: "14px !important", color: "#f013e5 !important" }} />}
                                                sx={{
                                                    backgroundColor: "rgba(255,255,255,0.05)",
                                                    color: "#fff",
                                                    borderRadius: "6px",
                                                    border: "1px solid rgba(240,19,229,0.2)",
                                                    textDecoration: "none",
                                                    "&:hover": { backgroundColor: "rgba(240,19,229,0.1)", borderColor: "#f013e5" },
                                                    "& .MuiChip-icon": { marginLeft: "8px" },
                                                }}
                                            />
                                        ))}
                                    </Box>
                                )}
                            </Box>

                            {/* ── Comments ─────────────────────────────────── */}
                            <Box component="section" id="comments-section" aria-label="Comments" sx={{ mt: 6, mb: 6 }}>
                                <Typography
                                    component="h2"
                                    sx={{ color: "#fff", mb: 3, fontWeight: "bold", borderLeft: "4px solid #f013e5", pl: 2, fontSize: "1.1rem" }}
                                >
                                    Comments ({comments.length})
                                </Typography>

                                <Box sx={{ mb: 4, backgroundColor: "rgba(255,255,255,0.03)", p: 3, borderRadius: "12px" }}>
                                    <TextField
                                        fullWidth multiline rows={3}
                                        placeholder="Write your comment..."
                                        value={newCommentText}
                                        onChange={(e) => setNewCommentText(e.target.value)}
                                        inputProps={{ "aria-label": "Write a comment" }}
                                        sx={{
                                            backgroundColor: "rgba(0,0,0,0.3)", borderRadius: "8px",
                                            "& .MuiOutlinedInput-root": {
                                                color: "#fff",
                                                "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                                                "&:hover fieldset": { borderColor: "#f013e5" },
                                                "&.Mui-focused fieldset": { borderColor: "#f013e5" },
                                            },
                                        }}
                                    />
                                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                                        <Button
                                            variant="contained"
                                            onClick={handleAddComment}
                                            disabled={isSubmittingComment || !newCommentText.trim()}
                                            sx={{ backgroundColor: "#f013e5", "&:hover": { backgroundColor: "#e91ec4" }, fontWeight: "bold", borderRadius: "20px", px: 4 }}
                                        >
                                            {isSubmittingComment ? "Posting..." : "Post Comment"}
                                        </Button>
                                    </Box>
                                </Box>

                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    {comments.length > 0 ? (
                                        [...comments].reverse().map((c: any, index: number) => (
                                            <Paper
                                                key={index}
                                                component="article"
                                                sx={{ p: 2, backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}
                                            >
                                                <Box sx={{ display: "flex", gap: 2 }}>
                                                    <Avatar sx={{ bgcolor: "#f013e5", fontSize: "14px" }}>U</Avatar>
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                                            <Typography variant="subtitle2" sx={{ color: "#f013e5", fontWeight: "bold" }}>
                                                                Anonymous
                                                            </Typography>
                                                            <Typography
                                                                component="time"
                                                                dateTime={c.date || isoUploadDate}
                                                                variant="caption"
                                                                sx={{ color: "rgba(255,255,255,0.4)" }}
                                                            >
                                                                {c.date ? new Date(c.date).toLocaleDateString() : "Recently"}
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="body2" sx={{ color: "#eee", lineHeight: 1.5 }}>
                                                            {c.text}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        ))
                                    ) : (
                                        <Typography sx={{ color: "rgba(255,255,255,0.4)", textAlign: "center", py: 4 }}>
                                            No comments yet. Be the first to comment!
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                            <Script
                                src="https://a.magsrv.com/ad-provider.js"
                                strategy="afterInteractive"
                            />

                            <ins
                                className="eas6a97888e37"
                                data-zoneid="5944470"
                            />

                            <Script id="magsrv-zone-5944470">
                                {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
                            </Script>
                        </Box>
                    </Grid>

                    {/* ── Right Column: Related Videos Sidebar ──────────────── */}
                    <Grid item xs={12} lg={3.5}>
                        <Box sx={{
                            position: { lg: "sticky" },
                            top: { lg: 24 },
                            maxHeight: { lg: "calc(100vh - 48px)" },
                            overflowY: { lg: "auto" },
                            pr: { lg: 1 },
                            "&::-webkit-scrollbar": { width: "9px" },
                            "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(240,19,229,0.3)", borderRadius: "10px" },
                        }}>
                            <Box sx={{ display: "flex", justifyContent: "center", width: "100%", overflow: "hidden" }}>
                                <iframe src="//a.magsrv.com/iframe.php?idzone=5941696&size=300x250" width="300" height="250" scrolling="no" marginWidth={0} marginHeight={0} frameBorder={0} style={{ maxWidth: "100%" }} title="Advertisement" />
                            </Box>

                            {/*
                                ✅ FIX: "Related Porn Videos" uses <h2> — correct within the H1 > H2 outline.
                                The main video title is H1; sections like this are H2.
                            */}
                            <Typography
                                component="h2"
                                sx={{ color: "#fff", mb: 2, fontWeight: "bold", borderLeft: "4px solid #f013e5", pl: 2, fontSize: { xs: "1rem", sm: "1.1rem" } }}
                            >
                                Related Porn Videos
                            </Typography>

                            <Grid container spacing={1}>
                                {relatedVideos
                                    .slice((relatedPage - 1) * videosPerRelatedPage, relatedPage * videosPerRelatedPage)
                                    .map((vid: SupabaseVideo) => {
                                        const previewUrl = vid.preview_url || vid.preview;
                                        const thumbnails =
                                            previewUrl && !previewUrl.endsWith(".mp4") && !previewUrl.endsWith(".webm")
                                                ? previewUrl.split(",").map((u) => toProxiedUrl(u.trim())).filter(Boolean)
                                                : [];
                                        const isHovered = hoveredVideo === vid.uuid;
                                        const isVideoPreview = previewUrl && (previewUrl.endsWith(".mp4") || previewUrl.endsWith(".webm"));
                                        const currentImg =
                                            isHovered && thumbnails.length > 0
                                                ? thumbnails[currentPreview[vid.uuid] || 0]
                                                : toProxiedUrl(vid.imagen_url || vid.img_src);
                                        const relatedSlug = buildSlug(vid.titulo || vid.title || "video");
                                        const relatedUrl = `/video/${vid.uuid}-${relatedSlug}`;

                                        return (
                                            <Grid item xs={6} sm={4} md={3} lg={6} key={vid.uuid}>
                                                {/*
                                                    ✅ FIX: Related video cards use real <a> links.
                                                    Previously onClick-only — bots couldn't crawl related videos.
                                                    Now they are anchor tags → full internal link equity.
                                                */}
                                                <Box
                                                    component="a"
                                                    href={relatedUrl}
                                                    onClick={(e: React.MouseEvent) => {
                                                        e.preventDefault();
                                                        handleClickRecommendation(vid);
                                                    }}
                                                    onTouchStart={() => handleTouchRecommendationPreview(vid)}
                                                    onMouseEnter={() => {
                                                        setHoveredVideo(vid.uuid);
                                                        setCurrentPreview((prev) => ({ ...prev, [vid.uuid]: 0 }));
                                                    }}
                                                    onMouseLeave={() => setHoveredVideo(null)}
                                                    sx={{
                                                        ...styles.videoCardSx,
                                                        display: "block",
                                                        textDecoration: "none",
                                                        cursor: "pointer",
                                                        borderRadius: "8px",
                                                        overflow: "hidden",
                                                        transition: "transform 0.2s",
                                                        "&:hover": { transform: "scale(1.02)" },
                                                    }}
                                                >
                                                    <Box sx={{ position: "relative", width: "100%", paddingTop: "56.25%", bgcolor: "#111" }}>
                                                        <Box sx={{ position: "absolute", inset: 0 }}>
                                                            {isHovered && isVideoPreview ? (
                                                                <video
                                                                    src={`/api/media?uuid=${vid.uuid}&type=preview`}
                                                                    autoPlay muted loop playsInline
                                                                    style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
                                                                />
                                                            ) : (
                                                                <img
                                                                    src={currentImg}
                                                                    // ✅ Descriptive alt per related video
                                                                    alt={`${vid.titulo || "Related video"} – free HD porn`}
                                                                    loading="lazy"
                                                                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }}
                                                                />
                                                            )}
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ p: { xs: "4px 6px", sm: "6px 8px" }, bgcolor: "rgba(0,0,0,0.6)" }}>
                                                        <Typography sx={{
                                                            color: "#fff", fontSize: { xs: "11px", sm: "12px" }, fontWeight: 500,
                                                            lineHeight: 1.3, display: "-webkit-box",
                                                            WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                                                        }}>
                                                            {vid.titulo}
                                                        </Typography>
                                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: "4px", gap: 1 }}>
                                                            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                                                <span style={{ fontSize: "11px", color: "#ccc", display: "flex", alignItems: "center", gap: "3px" }}>
                                                                    <Visibility sx={{ fontSize: "12px", color: "#00bcd4" }} />
                                                                    {vid.views || 0}
                                                                </span>
                                                                <span style={{ ...styles.durationLabel, fontSize: "11px" }}>
                                                                    ⏳ {vid.duracion_segundos && vid.duracion_segundos > 0
                                                                        ? formatSeconds(Number(vid.duracion_segundos))
                                                                        : vid.duracion || "0:00"}
                                                                </span>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        );
                                    })}
                            </Grid>

                            {/* Related pagination */}
                            {relatedVideos.length > videosPerRelatedPage && (
                                <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 2, gap: 1 }}>
                                    <Button
                                        variant="outlined" size="small"
                                        disabled={relatedPage === 1}
                                        onClick={() => setRelatedPage((p) => Math.max(1, p - 1))}
                                        sx={{ borderColor: "rgba(240,19,229,0.5)", color: "#f013e5", "&:disabled": { borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" } }}
                                    >
                                        Previous
                                    </Button>
                                    <Typography sx={{ color: "#fff", alignSelf: "center", fontSize: "0.9rem" }}>
                                        {relatedPage} / {Math.ceil(relatedVideos.length / videosPerRelatedPage)}
                                    </Typography>
                                    <Button
                                        variant="outlined" size="small"
                                        disabled={relatedPage >= Math.ceil(relatedVideos.length / videosPerRelatedPage)}
                                        onClick={() => setRelatedPage((p) => Math.min(Math.ceil(relatedVideos.length / videosPerRelatedPage), p + 1))}
                                        sx={{ borderColor: "rgba(240,19,229,0.5)", color: "#f013e5", "&:disabled": { borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" } }}
                                    >
                                        Next
                                    </Button>
                                </Box>
                            )}

                            <Box sx={{ display: "flex", justifyContent: "center", width: "100%", overflow: "hidden" }}>
                                <iframe src="//a.magsrv.com/iframe.php?idzone=5941704&size=300x250" width="300" height="250" scrolling="no" marginWidth={0} marginHeight={0} frameBorder={0} style={{ maxWidth: "100%" }} title="Advertisement" />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>

            {/* ── Report Modal ─────────────────────────────────────────────── */}
            <Modal
                open={openReportModal}
                onClose={() => setOpenReportModal(false)}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{ backdrop: { timeout: 500, sx: { backgroundColor: "rgba(0,0,0,0.9)" } } }}
                aria-labelledby="report-modal-title"
            >
                <Box sx={{
                    position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                    width: { xs: "95%", sm: 500 }, maxHeight: "90vh", overflowY: "auto",
                    bgcolor: "#111",
                    backgroundImage: 'linear-gradient(rgba(17,17,17,0.85),rgba(17,17,17,0.85)),url("/assets/imgReport.jpg")',
                    backgroundSize: "cover", backgroundPosition: "center",
                    borderRadius: "20px", boxShadow: "0 0 30px rgba(240,19,229,0.3)",
                    p: 4, border: "1px solid rgba(240,19,229,0.2)", outline: "none",
                }}>
                    <Box sx={{ textAlign: "center", mb: 3 }}>
                        <Flag sx={{ color: "#f013e5", fontSize: 40, mb: 1 }} />
                        <Typography id="report-modal-title" variant="h5" sx={{ color: "#fff", fontWeight: "bold" }}>
                            Report Video
                        </Typography>
                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                            Help us keep the community safe.
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <TextField
                            fullWidth label="Your Email" variant="outlined"
                            value={reportEmail} onChange={(e) => setReportEmail(e.target.value)}
                            inputProps={{ "aria-label": "Your email address" }}
                            sx={{
                                "& .MuiOutlinedInput-root": { color: "#fff", "& fieldset": { borderColor: "rgba(255,255,255,0.1)" }, "&:hover fieldset": { borderColor: "#f013e5" }, "&.Mui-focused fieldset": { borderColor: "#f013e5" } },
                                "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" },
                                "& .MuiInputLabel-root.Mui-focused": { color: "#f013e5" },
                            }}
                        />

                        <FormControl component="fieldset">
                            <Typography component="legend" sx={{ color: "rgba(255,255,255,0.7)", mb: 2, fontWeight: "bold", fontSize: "0.9rem" }}>
                                Reason for reporting:
                            </Typography>
                            <RadioGroup value={reportReason} onChange={(e) => setReportReason(e.target.value)} sx={{ gap: 1 }}>
                                {["Violent or Abusive", "Young, Minor or Underage", "Contains Non-consensual acts", "Not a Porn Video", "Spam or Misleading", "Wrong Categories or Tags", "Other Reasons"].map((option) => (
                                    <Paper key={option} onClick={() => setReportReason(option)} sx={{
                                        backgroundColor: reportReason === option ? "rgba(240,19,229,0.1)" : "rgba(255,255,255,0.02)",
                                        border: reportReason === option ? "1px solid #f013e5" : "1px solid rgba(255,255,255,0.05)",
                                        borderRadius: "12px", cursor: "pointer", transition: "all 0.2s",
                                        "&:hover": { backgroundColor: "rgba(255,255,255,0.05)", borderColor: reportReason === option ? "#f013e5" : "rgba(255,255,255,0.2)" },
                                    }}>
                                        <FormControlLabel
                                            value={option}
                                            control={<Radio sx={{ color: "rgba(255,255,255,0.3)", "&.Mui-checked": { color: "#f013e5" } }} />}
                                            label={option}
                                            sx={{ width: "100%", m: 0, p: 1.5, color: "#fff", "& .MuiFormControlLabel-label": { fontWeight: 500 } }}
                                        />
                                    </Paper>
                                ))}
                            </RadioGroup>
                        </FormControl>

                        <TextField
                            fullWidth multiline rows={3} label="Additional details (optional)" variant="outlined"
                            value={reportDescription} onChange={(e) => setReportDescription(e.target.value)}
                            sx={{
                                "& .MuiOutlinedInput-root": { color: "#fff", "& fieldset": { borderColor: "rgba(255,255,255,0.1)" }, "&:hover fieldset": { borderColor: "#f013e5" }, "&.Mui-focused fieldset": { borderColor: "#f013e5" } },
                                "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" },
                                "& .MuiInputLabel-root.Mui-focused": { color: "#f013e5" },
                            }}
                        />

                        <Box sx={{ display: "flex", gap: 2, pt: 1 }}>
                            <Button fullWidth variant="outlined" onClick={() => setOpenReportModal(false)}
                                sx={{ borderColor: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: "12px", fontWeight: "bold", "&:hover": { borderColor: "#fff" } }}>
                                Cancel
                            </Button>
                            <Button fullWidth variant="contained" onClick={handleSubmitReport}
                                disabled={isSubmittingReport || !reportEmail.trim() || !reportReason}
                                sx={{ backgroundColor: "#f013e5", borderRadius: "12px", fontWeight: "bold", "&:hover": { backgroundColor: "#e91ec4" } }}>
                                {isSubmittingReport ? "Sending..." : "Submit Report"}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>

            <TopVideosSlider />

            {/* Bottom ad banners */}
            <Box sx={{ width: "100%", display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 2, mt: 1, mb: 1, px: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "center", width: { xs: "100%", sm: "100%", md: "auto" } }}>
                    <iframe src="//a.magsrv.com/iframe.php?idzone=5941728&size=300x100" width="300" height="100" scrolling="no" marginWidth={0} marginHeight={0} frameBorder={0} style={{ border: 0, maxWidth: "100%" }} title="Advertisement" />
                </Box>
                <Box sx={{ width: { xs: "100%", md: "300px" }, minHeight: "100px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <iframe src="//a.magsrv.com/iframe.php?idzone=5941728&size=300x100" width="300" height="100" scrolling="no" marginWidth={0} marginHeight={0} frameBorder={0} title="Advertisement" />
                </Box>
            </Box>

            <FooterComponent />
        </div>
    );
};

export default VideoPage;

import { useRouter } from 'next/router';
import React, { useEffect, useState, useRef } from 'react';
import { getVideoById, getVideoByTitle, SupabaseVideo, registerVote, getRandomVideos, addCommentToVideo, addReportToVideo } from '@/api/videoSupabaseService';
import VideoPlayer, { VideoPlayerRef } from '@/components/VideoPlayer/VideoPlayer';
import NavBar from '@/components/NavBar/NavBar';
import NavMenu from '@/components/NavMenu/NavMenu';
import FooterComponent from '@/components/footer/Footer';
import Head from 'next/head';
import { Box, Typography, Container, CircularProgress, Grid, TextField, Button, Divider, Avatar, Paper, Modal, Backdrop, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Stack, Chip } from '@mui/material';
import { ThumbUp, ThumbDown, ChatBubble, Flag, AccessTime, CalendarToday, Favorite, CloudDownload } from '@mui/icons-material';
import { getVisitorId } from '@/api/visitorIdHelper';

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
    const videoPlayerRef = useRef<VideoPlayerRef>(null);

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

    const handleAddComment = async () => {
        if (!newCommentText.trim() || !video) return;
        setIsSubmittingComment(true);
        try {
            const updatedVideo = await addCommentToVideo(video.uuid, { text: newCommentText.trim() }, video.comment);
            if (updatedVideo) {
                setVideo(updatedVideo);
                setNewCommentText("");
            }
        } catch (error) {
            console.error("Error adding comment:", error);
            alert("Error al añadir comentario");
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
            const updatedVideoData = await registerVote(video.uuid, visitorId, type, type === 'likes' ? video.likes : video.dislikes);

            if (updatedVideoData) {
                setVideo({ ...updatedVideoData });
            } else {
                setVideo(prev => prev ? ({ ...prev, [type]: (prev[type] || 0) + 1 }) : null);
            }
            setHasVoted(type);
            localStorage.setItem(`voted_${video.uuid}`, type);

        } catch (error) {
            console.error('Error voting:', error);
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
                            setHasVoted(voted);
                        }
                        const related = await getRandomVideos(8, data.uuid);
                        setRelatedVideos(related);
                    }

                } catch (error) {
                    console.error("Error loading video:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchVideo();
        }
    }, [id]);

    const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
    const [currentPreview, setCurrentPreview] = useState<{ [key: string]: number }>({});

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

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', color: '#fff' }}>
                <CircularProgress color="secondary" />
            </Box>
        );
    }

    if (!video) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', color: '#fff' }}>
                <Typography variant="h5">Video not found</Typography>
            </Box>
        );
    }


    const handleDownload = async () => {
        if (video && video.uuid) {
            setIsDownloading(true);
            try {
                // Ahora llamamos al unificador de segmentos
                const downloadUrl = `/api/download-video?uuid=${video.uuid}`;

                // Creamos un link invisible para forzar la descarga del flujo unido
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', `${video.titulo || 'video'}.mp4`);
                document.body.appendChild(link);
                link.click();
                link.remove();

            } catch (err) {
                console.error("Download error:", err);
                alert("Error al procesar la descarga");
            } finally {
                // Damos un margen pequeño para que el navegador inicie la descarga
                setTimeout(() => setIsDownloading(false), 2000);
            }
        }
    };

    const handleClickRecommendation = (vid: SupabaseVideo) => {
        const title = vid.titulo || vid.title || "video";
        const slug = title
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-');         // Replace multiple - with single -

        router.push(`/video/${vid.uuid}-${slug}`);
    };

    return (
        <div style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <NavBar sx={{ backgroundColor: "#e91ec4" }} />
            <NavMenu sx={{ backgroundColor: "#e91ec4" }} />

            <Head>
                <title>{video.titulo} - novapornx</title>
                <meta name="description" content={video.descripcion || `Watch ${video.titulo} on novapornx`} />
            </Head>

            <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
                <Box sx={{ mb: 2 }}>
                    <VideoPlayer
                        ref={videoPlayerRef}
                        videoEmbedUrl={video.video_stream_url || `/api/media?uuid=${video.uuid}&type=stream`}
                        poster={video.imagen_url}
                        autoplay={false}
                        muted={true}
                    />
                </Box>

                {/* Info and Comments Section */}
                <Box sx={{ p: 3 }}>
                    <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 3, mb: 3 }}>
                        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', mb: 1.5, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                            {video.titulo}
                        </Typography>
                        <Stack direction="row" spacing={2} sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AccessTime sx={{ fontSize: '1rem' }} />
                                {video.duracion || "Unknown"}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CalendarToday sx={{ fontSize: '1rem' }} />
                                {video.created_at ? new Date(video.created_at).toLocaleDateString() : 'N/A'}
                            </Box>
                        </Stack>
                    </Box>

                    {/* Voting and Report Buttons */}
                    <Stack direction="row" spacing={2} sx={{ mb: 4, flexWrap: 'wrap', gap: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<ThumbUp />}
                            onClick={() => handleVote('likes')}
                            disabled={!!hasVoted}
                            sx={{
                                bgcolor: hasVoted ? 'rgba(255,255,255,0.05)' : 'rgba(76, 175, 80, 0.1)',
                                color: '#4caf50',
                                '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.2)' },
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 'bold',
                                px: 3
                            }}
                        >
                            {video.likes || 0}
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<ThumbDown />}
                            onClick={() => handleVote('dislikes')}
                            disabled={!!hasVoted}
                            sx={{
                                bgcolor: hasVoted ? 'rgba(255,255,255,0.05)' : 'rgba(244, 67, 54, 0.1)',
                                color: '#f44336',
                                '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.2)' },
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 'bold',
                                px: 3
                            }}
                        >
                            {video.dislikes || 0}
                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleDownload}
                            disabled={isDownloading}
                            sx={{
                                backgroundColor: '#f013e5',
                                '&:hover': { backgroundColor: '#d011c5' },
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 'bold',
                                px: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            {isDownloading ? (
                                <CircularProgress size={20} sx={{ color: '#fff' }} />
                            ) : (
                                <Box component="img" src="/assets/loader.png" sx={{ width: 20, height: 20 }} />
                            )}
                            {isDownloading ? 'Generando...' : 'Download'}
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
                                textTransform: 'none'
                            }}
                        >
                            Reportar
                        </Button>
                    </Stack>

                    <Box sx={{ p: 2.5, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', borderLeft: '4px solid #f013e5', mb: 4 }}>
                        <Typography variant="body1" sx={{ lineHeight: 1.6, color: '#ccc', mb: 2 }}>
                            {video.descripcion || "Sin descripción disponible."}
                        </Typography>

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

                    {/* Preview Images Slider */}
                    {video.preview_images_urls && (
                        <Box sx={{ mt: 6, mb: 4 }}>
                            <Typography variant="h6" sx={{ color: '#fff', mb: 3, fontWeight: 'bold', borderLeft: '4px solid #f013e5', pl: 2 }}>
                                Capturas del Video
                            </Typography>
                            <Box
                                sx={{
                                    width: '100%',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                    py: 3,
                                    cursor: 'pointer',
                                    '&:hover .marquee-content': {
                                        animationPlayState: 'paused'
                                    }
                                }}
                            >
                                <Box
                                    className="marquee-content"
                                    sx={{
                                        display: 'flex',
                                        gap: 3,
                                        width: 'max-content',
                                        animation: 'marquee-scroll 50s linear infinite',
                                        '@keyframes marquee-scroll': {
                                            '0%': { transform: 'translateX(0)' },
                                            '100%': { transform: 'translateX(-50%)' }
                                        }
                                    }}
                                >
                                    {(() => {
                                        try {
                                            const parsed = JSON.parse(video.preview_images_urls);
                                            if (!Array.isArray(parsed)) return null;

                                            const getLabel = (url: string) => {
                                                const filename = url.split('/').pop() || "";
                                                const match = filename.match(/(\d+_\d+)/);
                                                return match ? match[1].replace('_', ':') : "";
                                            };

                                            const timeToSeconds = (label: string) => {
                                                if (!label) return 0;
                                                const parts = label.split(':').map(Number);
                                                if (parts.length === 2) {
                                                    return parts[0] * 60 + parts[1];
                                                }
                                                return 0;
                                            };

                                            const displayList = [...parsed, ...parsed];

                                            return displayList.map((url: string, idx: number) => {
                                                let finalUrl = url;
                                                if (url.includes('pub-c9afcfde57fd4b9fbc70f2802ea3ed05.r2.dev')) {
                                                    finalUrl = url.replace('https://pub-c9afcfde57fd4b9fbc70f2802ea3ed05.r2.dev', '/capturas-proxy');
                                                } else if (!url.startsWith('http')) {
                                                    finalUrl = `/capturas-proxy/${url}`;
                                                }

                                                const timestampLabel = getLabel(url);
                                                const seconds = timeToSeconds(timestampLabel);

                                                return (
                                                    <Box
                                                        key={idx}
                                                        sx={{
                                                            width: '220px',
                                                            flexShrink: 0,
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            gap: 1.5
                                                        }}
                                                        onClick={() => {
                                                            if (videoPlayerRef.current) {
                                                                videoPlayerRef.current.seekTo(seconds);
                                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                            }
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                width: '100%',
                                                                aspectRatio: '16/9',
                                                                borderRadius: '8px',
                                                                overflow: 'hidden',
                                                                border: '1px solid rgba(255,255,255,0.1)',
                                                                transition: 'all 0.3s ease',
                                                                '&:hover': {
                                                                    borderColor: '#f013e5',
                                                                    boxShadow: '0 0 20px rgba(240, 19, 229, 0.4)',
                                                                    transform: 'scale(1.02)'
                                                                }
                                                            }}
                                                        >
                                                            <img
                                                                src={finalUrl}
                                                                alt={`Capture ${idx}`}
                                                                loading="lazy"
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover'
                                                                }}
                                                            />
                                                        </Box>
                                                        {timestampLabel && (
                                                            <Typography sx={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', opacity: 0.8 }}>
                                                                {timestampLabel}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                );
                                            });
                                        } catch (e) {
                                            return null;
                                        }
                                    })()}
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {/* Comments Section */}
                    <Box id="comments-section" sx={{ mt: 6, mb: 6 }}>
                        <Typography variant="h6" sx={{ color: '#fff', mb: 3, fontWeight: 'bold', borderLeft: '4px solid #f013e5', pl: 2 }}>
                            Comentarios ({parseComments(video.comment).length})
                        </Typography>

                        <Box sx={{ mb: 4, backgroundColor: 'rgba(255,255,255,0.03)', p: 3, borderRadius: '12px' }}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Escribe tu comentario..."
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
                                    {isSubmittingComment ? 'Publicando...' : 'Publicar Comentario'}
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
                                                        Anónimo
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                                                        {c.date ? new Date(c.date).toLocaleDateString() : 'Recientemente'}
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
                                    No hay comentarios todavía. ¡Sé el primero en comentar!
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* Recommended Videos Section */}
                {relatedVideos.length > 0 && (
                    <Box sx={{ mt: 6 }}>
                        <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 'bold', borderLeft: '4px solid #f013e5', pl: 2 }}>
                            Videos Relacionados
                        </Typography>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "repeat(2, 1fr)",
                                    sm: "repeat(3, 1fr)",
                                    md: "repeat(4, 1fr)"
                                },
                                gap: "15px",
                                padding: "0",
                            }}
                        >
                            {relatedVideos.map((vid: SupabaseVideo) => {
                                const previewUrl = vid.preview_url || vid.preview;
                                const thumbnails = (previewUrl && !previewUrl.endsWith('.mp4') && !previewUrl.endsWith('.webm'))
                                    ? previewUrl.split(",").map(u => u.trim()).filter(Boolean)
                                    : [];

                                const isHovered = hoveredVideo === vid.uuid;
                                const isVideoPreview = previewUrl && (previewUrl.endsWith('.mp4') || previewUrl.endsWith('.webm'));
                                const currentImg = (isHovered && thumbnails.length > 0)
                                    ? thumbnails[currentPreview[vid.uuid] || 0]
                                    : (vid.imagen_url || vid.img_src);

                                return (
                                    <Box
                                        key={vid.uuid}
                                        sx={styles.videoCardSx}
                                        onMouseEnter={() => {
                                            setHoveredVideo(vid.uuid);
                                            setCurrentPreview((prev) => ({ ...prev, [vid.uuid]: 0 }));
                                        }}
                                        onMouseLeave={() => setHoveredVideo(null)}
                                        onClick={() => handleClickRecommendation(vid)}
                                    >
                                        <div style={styles.thumbnailContainer}>
                                            {isHovered && isVideoPreview ? (
                                                <video
                                                    src={`/api/media?uuid=${vid.uuid}&type=preview`}
                                                    autoPlay
                                                    muted
                                                    loop
                                                    playsInline
                                                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
                                                />
                                            ) : (
                                                <img
                                                    src={currentImg || '/assets/placeholder.png'}
                                                    alt={vid.titulo}
                                                    style={styles.thumbnail}
                                                />
                                            )}
                                        </div>
                                        <div style={styles.metadataArea}>
                                            <p style={styles.videoTitle}>{vid.titulo}</p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                                                <span style={styles.durationLabel}>
                                                    ⏳ {(vid.duracion_segundos && vid.duracion_segundos > 0)
                                                        ? `${Math.floor(vid.duracion_segundos / 60)}:${(vid.duracion_segundos % 60).toString().padStart(2, '0')}`
                                                        : (vid.duracion || "0:00")}
                                                </span>
                                            </div>
                                        </div>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                )}
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

            <FooterComponent />
        </div>
    );
};

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
        "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 24px rgba(0, 0, 0, 0.5)",
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
        fontSize: "14px",
        fontWeight: "bold",
        margin: 0,
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
    },
    durationLabel: {
        color: "rgba(255,255,255,0.6)",
        fontSize: "12px",
    }
};

export default VideoPage;

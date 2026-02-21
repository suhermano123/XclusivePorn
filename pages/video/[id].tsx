import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { getVideoById, SupabaseVideo, registerVote, getRandomVideos, addCommentToVideo, addReportToVideo } from '@/api/videoSupabaseService';
import VideoPlayer from '@/components/VideoPlayer/VideoPlayer';
import NavBar from '@/components/NavBar/NavBar';
import NavMenu from '@/components/NavMenu/NavMenu';
import FooterComponent from '@/components/footer/Footer';
import Head from 'next/head';
import { Box, Typography, Container, CircularProgress, Grid, TextField, Button, Divider, Avatar, Paper, Modal, Backdrop, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { ThumbUp, ThumbDown, ChatBubble, Flag } from '@mui/icons-material';
import ListVideos from '@/components/ListVideos/ListVideos'; // Or reuse the grid component logic? 
// Actually ListVideos is a full page component. We might need a simpler VideoCard or just use ListVideos if it accepts props to rendering a specific list.
// Checking ListVideos, it manages its own state and fetching. 
// We should probably create a simpler list or just map over videos here using the same card style from ListVideos (which is inline).
// Or better, let's just make a simple grid here for now to avoid refactoring ListVideos.
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

    // Parse comments from string: "{obj}. {obj}"
    const parseComments = (commentStr?: string) => {
        if (!commentStr) return [];
        try {
            // Split by ". " but be careful not to split inside JSON strings. 
            // However, assuming user's literal format "{}. {}"
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

    // Parse comments from string: "{obj}. {obj}"

    // Visitor ID logic - handled by getVisitorId() when needed

    const handleVote = async (type: 'likes' | 'dislikes') => {
        if (!video || hasVoted) return;

        try {
            const visitorId = getVisitorId();
            console.log("Votando:", type, "UUID:", video.uuid, "Current:", type === 'likes' ? video.likes : video.dislikes);
            const updatedVideoData = await registerVote(video.uuid, visitorId, type, type === 'likes' ? video.likes : video.dislikes);
            console.log("Respuesta del servidor:", updatedVideoData);

            if (updatedVideoData) {
                setVideo({ ...updatedVideoData });
            } else {
                setVideo(prev => prev ? ({ ...prev, [type]: (prev[type] || 0) + 1 }) : null);
            }
            setHasVoted(type);

            // Persist vote locally to prevent re-vote in this session/browser
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
                    const data = await getVideoById(id as string);
                    setVideo(data);

                    // Check if already voted locally
                    const voted = localStorage.getItem(`voted_${id}`);
                    if (voted === 'likes' || voted === 'dislikes') {
                        setHasVoted(voted);
                    }

                    // Fetch related videos
                    const related = await getRandomVideos(8, id as string); // Fetch 8 random videos
                    setRelatedVideos(related);

                } catch (error) {
                    console.error("Error loading video:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchVideo();
        }
    }, [id]);

    // Hover logic for recommendations
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

    const handleClickRecommendation = (uuid: string) => {
        router.push(`/video/${uuid}`);
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
                        videoEmbedUrl={video.video_stream_url || `/api/media?uuid=${video.uuid}&type=stream`}
                        poster={video.imagen_url}
                    />
                </Box>

                {/* Video Info Section */}
                <Box sx={{ color: '#fff', mb: 4 }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', md: 'center' },
                        gap: 2,
                        mb: 2
                    }}>
                        <Box>
                            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                {video.titulo}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 'medium' }}>
                                Publicado el {new Date(video.created_at || Date.now()).toLocaleDateString()}
                            </Typography>
                        </Box>

                        {/* Voting Section */}
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            padding: '10px 20px',
                            borderRadius: '30px',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <Box
                                sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', '&:hover': { transform: 'scale(1.1)' }, transition: 'transform 0.2s' }}
                                onClick={() => handleVote('likes')}
                            >
                                <ThumbUp
                                    className={hasVoted === 'likes' ? 'like-animation' : ''}
                                    sx={{ fontSize: '24px', color: hasVoted === 'likes' ? '#f013e5' : '#fff' }}
                                />
                                <Typography sx={{ fontWeight: 'bold' }}>{video.likes || 0}</Typography>
                            </Box>
                            <Box
                                sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', '&:hover': { transform: 'scale(1.1)' }, transition: 'transform 0.2s' }}
                                onClick={() => handleVote('dislikes')}
                            >
                                <ThumbDown
                                    className={hasVoted === 'dislikes' ? 'dislike-animation' : ''}
                                    sx={{ fontSize: '24px', color: hasVoted === 'dislikes' ? '#888' : '#fff' }}
                                />
                                <Typography sx={{ fontWeight: 'bold' }}>{video.dislikes || 0}</Typography>
                            </Box>
                            <Box
                                sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', '&:hover': { transform: 'scale(1.1)' }, transition: 'transform 0.2s' }}
                                onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                <ChatBubble sx={{ fontSize: '22px', color: '#fff' }} />
                                <Typography sx={{ fontWeight: 'bold' }}>{parseComments(video.comment).length}</Typography>
                            </Box>

                            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.1)', mx: 1 }} />

                            <Button
                                startIcon={<Flag />}
                                onClick={handleReport}
                                sx={{
                                    color: '#f013e5',
                                    fontWeight: 'bold',
                                    textTransform: 'none',
                                    fontSize: '14px',
                                    '&:hover': {
                                        backgroundColor: 'rgba(240, 19, 229, 0.1)',
                                        transform: 'scale(1.05)'
                                    },
                                    transition: 'all 0.2s'
                                }}
                            >
                                Report
                            </Button>
                        </Box>
                    </Box>

                    <Box sx={{ p: 2.5, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', borderLeft: '4px solid #f013e5', mb: 4 }}>
                        <Typography variant="body1" sx={{ lineHeight: 1.6, color: '#ccc' }}>
                            {video.descripcion || "Sin descripción disponible."}
                        </Typography>
                    </Box>

                    {/* Comments Section */}
                    <Box id="comments-section" sx={{ mt: 4, mb: 6 }}>
                        <Typography variant="h6" sx={{ color: '#fff', mb: 3, fontWeight: 'bold', borderLeft: '4px solid #f013e5', pl: 2 }}>
                            Comentarios ({parseComments(video.comment).length})
                        </Typography>

                        {/* Add Comment Form */}
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

                        {/* Comments List */}
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

                        <div style={styles.gridContainer}>
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
                                        onClick={() => handleClickRecommendation(vid.uuid)}
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
                        </div>
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

// Styles copied/adapted from ListVideos
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
        borderRadius: "8px 8px 0 0",
        display: "block",
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
    durationLabel: {
        fontSize: "10px",
        color: "#aaa",
        fontWeight: "bold",
        backgroundColor: "rgba(255,255,255,0.05)",
        padding: "2px 6px",
        borderRadius: "4px",
    },
};

export default VideoPage;

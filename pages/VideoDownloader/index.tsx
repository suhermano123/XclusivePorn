import React, { useState } from "react";
import Head from "next/head";
import { Box, Button, Typography, TextField, CircularProgress, Alert, Paper, Grid, Card, CardMedia, CardContent, Divider, LinearProgress } from "@mui/material";
import NavBar from "@/components/NavBar/NavBar";
import NavMenu from "@/components/NavMenu/NavMenu";
import FooterComponent from "@/components/footer/Footer";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DownloadIcon from "@mui/icons-material/Download";

interface TaskStatus {
    status: string;
    url: string;
    progress?: number;
    upload_progress?: number;
    download_url?: string;
    details?: {
        title: string;
        thumbnail: string;
    };
}

const VideoDownloader: React.FC = () => {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
    const [taskId, setTaskId] = useState<string | null>(null);

    // Polling effect for task status
    React.useEffect(() => {
        if (!taskId) return;

        const checkProgress = setInterval(async () => {
            try {
                const res = await fetch(`/api/status/${taskId}`);
                if (!res.ok) throw new Error("Status API error");

                const data: TaskStatus = await res.json();
                setTaskStatus(data);

                if (data.status === 'completed' || data.status === 'error' || data.status === 'failed') {
                    clearInterval(checkProgress);
                    setLoading(false);
                    if (data.status === 'error' || data.status === 'failed') {
                        setError("An error occurred while processing the video on the servers.");
                    }
                }
            } catch (e) {
                console.error("Error polling status:", e);
                // We keep polling in case it's a transient network error
            }
        }, 3000);

        return () => clearInterval(checkProgress);
    }, [taskId]);

    const handleDownload = async () => {
        if (!url) return;
        setLoading(true);
        setError(null);
        setTaskStatus(null);
        setTaskId(null);

        try {
            const response = await fetch('/api/downloader', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.task_id) {
                    setTaskId(data.task_id);
                    setUrl("");
                } else if (data.status === 'success' || data.url) {
                    // Fallback in case API returns immediate result
                    setTaskStatus(data);
                    setLoading(false);
                } else {
                    setError("Could not start the video process. Check the link.");
                    setLoading(false);
                }
            } else {
                setError("Error processing the request. Please try again later.");
                setLoading(false);
            }
        } catch (err) {
            console.error("Error downloading video:", err);
            setError("An error occurred while connecting to the server.");
            setLoading(false);
        }
    };

    return (
        <main style={{ backgroundColor: "#000", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Added semantic <main> element instead of a generic <div>. Improves accessibility and SEO. */}
            <Head>
                {/* Basic Meta Tags Optimized for Search Engines */}
                <title>Video Downloader - Free Premium HD Latina Videos & Amateur HD Porn</title>
                <meta name="description" content="Download your favorite videos easily with our premium video downloader. Download free premium hd latina videos, amateur hd porn, and free 4k homemade latina porn." />
                <meta name="keywords" content="video downloader, free download, download mp4 video, free premium hd latina videos, amateur hd porn colombian, free 4k homemade latina porn, hd milf amateur videos free" />
                <meta name="robots" content="index, follow" /> {/* Permite a Google indexar y seguir la página */}
                <meta name="author" content="XclusivePorn" />

                {/* Open Graph (OG) Tags for social media sharing */}
                <meta property="og:title" content="XclusivePorn Video Downloader - High Speed" />
                <meta property="og:description" content="The ultimate tool to download your favorite videos in maximum quality, without limits." />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="XclusivePorn" />

                {/* Twitter Card Tags for Twitter/X */}
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content="Free Video Downloader - XclusivePorn" />
                <meta name="twitter:description" content="Fast and safe download in MP4 format and maximum quality." />

                {/* Structured Data (JSON-LD) - Generates a 'Rich Snippet' in Google defining this as a software tool */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebApplication",
                            "name": "XclusivePorn Video Downloader",
                            "applicationCategory": "MultimediaApplication",
                            "operatingSystem": "All",
                            "description": "Free tool to download videos from multiple online platforms in MP4 format without limits or waiting.",
                            "offers": {
                                "@type": "Offer",
                                "price": "0",
                                "priceCurrency": "USD"
                            }
                        })
                    }}
                />
            </Head>

            <NavBar sx={{ backgroundColor: "#e91ec4" }} />
            <NavMenu sx={{ backgroundColor: "#e91ec4" }} />

            <Box sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
                py: 10,
                background: "radial-gradient(circle at center, #1a1a1a 0%, #000 100%)"
            }}>
                <Paper sx={{
                    p: { xs: 3, md: 6 },
                    width: "100%",
                    maxWidth: (taskStatus || loading) ? 900 : 700,
                    transition: "max-width 0.5s ease",
                    borderRadius: 6,
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <Box sx={{ position: "relative", zIndex: 1 }}>
                        <CloudDownloadIcon sx={{ fontSize: 70, color: "#f013e5", mb: 2 }} />

                        {/* Important SEO change: Every page must have ONE unique H1 element. component="h1" tells Google it is the main topic, but visually we keep variant="h3" */}
                        <Typography variant="h3" component="h1" sx={{
                            color: "#fff",
                            fontWeight: 900,
                            mb: 1,
                            letterSpacing: "-1px",
                            fontSize: { xs: "2rem", md: "3rem" }
                        }}>
                            VIDEO DOWNLOADER
                        </Typography>

                        {/* Convert the main subtitle into an <H2> to structure hierarchically */}
                        <Typography component="h2" variant="h6" sx={{ color: "rgba(255,255,255,0.5)", mb: 5, fontWeight: 400 }}>
                            Enter the video link to start the high-quality download
                        </Typography>

                        <Box sx={{ mb: 4 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="https://xhamster.com/videos/..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                disabled={loading}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        color: "#fff",
                                        borderRadius: "16px",
                                        backgroundColor: "rgba(255,255,255,0.05)",
                                        fontSize: "1.1rem",
                                        py: 0.5,
                                        transition: "all 0.3s ease",
                                        "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                                        "&:hover fieldset": { borderColor: "rgba(240, 19, 229, 0.5)" },
                                        "&.Mui-focused fieldset": { borderColor: "#f013e5" },
                                    }
                                }}
                            />
                        </Box>

                        <Button
                            fullWidth
                            variant="contained"
                            disabled={loading || !url}
                            onClick={handleDownload}
                            sx={{
                                py: 2,
                                borderRadius: "16px",
                                fontSize: "1.1rem",
                                fontWeight: "bold",
                                backgroundColor: "#f013e5",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    backgroundColor: "#e91ec4",
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 15px 30px rgba(240, 19, 229, 0.4)",
                                },
                                "&:active": { transform: "translateY(0)" },
                                boxShadow: "0 10px 20px rgba(240, 19, 229, 0.3)",
                                textTransform: "none",
                                letterSpacing: "1px"
                            }}
                        >
                            {loading ? <CircularProgress size={28} color="inherit" /> : "DOWNLOAD VIDEO"}
                        </Button>

                        {error && (
                            <Alert
                                severity="error"
                                sx={{
                                    mt: 4,
                                    borderRadius: "16px",
                                    backgroundColor: "rgba(211, 47, 47, 0.15)",
                                    color: "#fff",
                                    border: `1px solid rgba(211, 47, 47, 0.5)`,
                                    textAlign: "left"
                                }}
                            >
                                {error}
                            </Alert>
                        )}

                        {taskStatus && taskStatus.details && (
                            <Box sx={{ mt: 5, textAlign: "left", animation: "fadeIn 0.5s ease" }}>
                                <Typography variant="h5" sx={{ color: "#fff", fontWeight: "bold", mb: 2 }}>
                                    Process Result
                                </Typography>
                                <Card sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', md: 'row' },
                                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    borderRadius: 4,
                                    overflow: 'hidden'
                                }}>
                                    <CardMedia
                                        component="img"
                                        sx={{ width: { xs: '100%', md: 350 }, height: { xs: 200, md: 'auto' }, objectFit: 'cover' }}
                                        image={taskStatus.details.thumbnail}
                                        alt={taskStatus.details.title}
                                    />
                                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <CardContent sx={{ flex: '1 0 auto', p: 3, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                            <Typography component="div" variant="h6" sx={{ color: "#fff", fontWeight: "bold", mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {taskStatus.details.title}
                                            </Typography>
                                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

                                            {(taskStatus.status === 'processing' || taskStatus.status === 'uploading') && (() => {
                                                const globalProgress = taskStatus.status === 'processing'
                                                    ? (taskStatus.progress || 0) * 0.5
                                                    : 50 + (taskStatus.upload_progress || 0) * 0.5;

                                                const label = taskStatus.status === 'processing'
                                                    ? `Processing / Downloading... ${globalProgress.toFixed(1)}%`
                                                    : `Uploading to R2 / Preparing link... ${globalProgress.toFixed(1)}%`;

                                                return (
                                                    <Box sx={{ mb: 3 }}>
                                                        <Typography variant="subtitle2" sx={{ color: "#fff", mb: 1 }}>
                                                            {label}
                                                        </Typography>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={globalProgress}
                                                            sx={{
                                                                height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.1)',
                                                                '& .MuiLinearProgress-bar': { backgroundColor: taskStatus.status === 'processing' ? '#f013e5' : '#4caf50', transition: 'transform 0.4s linear' }
                                                            }}
                                                        />
                                                    </Box>
                                                );
                                            })()}

                                            {taskStatus.status === 'completed' && taskStatus.download_url && (
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    href={taskStatus.download_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    startIcon={<DownloadIcon />}
                                                    sx={{
                                                        py: 2,
                                                        borderRadius: "16px",
                                                        fontSize: "1.1rem",
                                                        fontWeight: "bold",
                                                        backgroundColor: "#4caf50",
                                                        color: "#fff",
                                                        transition: "all 0.3s ease",
                                                        "&:hover": {
                                                            backgroundColor: "#388e3c",
                                                            transform: "translateY(-2px)",
                                                            boxShadow: "0 10px 20px rgba(76, 175, 80, 0.4)",
                                                        },
                                                    }}
                                                >
                                                    DOWNLOAD VIDEO NOW (MP4)
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Box>
                                </Card>
                            </Box>
                        )}
                    </Box>
                </Paper>

                <Box sx={{ mt: 10, textAlign: "center", maxWidth: 900, width: "100%" }}>
                    <Typography variant="h5" sx={{ color: "#fff", mb: 4, fontWeight: "bold", opacity: 0.8 }}>
                        Supported Platforms
                    </Typography>
                    <Grid container spacing={3} justifyContent="center">
                        {['XNXX', 'XHamster', 'Pornhub', 'SpankBang', 'Eporner', 'HQPorner'].map((platform) => (
                            <Grid item xs={6} sm={4} md={3} key={platform}>
                                <Box sx={{
                                    px: 4, py: 2,
                                    borderRadius: "16px",
                                    backgroundColor: "rgba(255,255,255,0.03)",
                                    color: "rgba(255,255,255,0.7)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        backgroundColor: "rgba(255,255,255,0.07)",
                                        borderColor: "rgba(240, 19, 229, 0.3)",
                                        color: "#fff",
                                        transform: "scale(1.05)"
                                    }
                                }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                                        {platform}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Box>

            <FooterComponent />
            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </main >
    );
};

export default VideoDownloader;

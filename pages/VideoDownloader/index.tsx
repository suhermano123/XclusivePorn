import React, { useState } from "react";
import Head from "next/head";
import { Box, Button, Typography, TextField, CircularProgress, Alert, Paper, Grid, Card, CardMedia, CardContent, Divider, LinearProgress } from "@mui/material";
import NavBar from "@/components/NavBar/NavBar";
import NavMenu from "@/components/NavMenu/NavMenu";
import FooterComponent from "@/components/footer/Footer";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DownloadIcon from "@mui/icons-material/Download";

interface DownloadOption {
    url: string;
    ext: string;
    resolution: string;
    width?: number;
}

interface VideoData {
    title: string;
    thumbnail: string;
    duration: number;
    best_resolution: string;
    downloads: DownloadOption[];
}

const VideoDownloader: React.FC = () => {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [videoData, setVideoData] = useState<VideoData | null>(null);
    const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({});

    const handleDownload = async () => {
        if (!url) return;
        setLoading(true);
        setError(null);
        setVideoData(null);

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
                if (data.status === 'success' && data.data) {
                    setVideoData(data.data);
                    setUrl("");
                } else {
                    setError("No se pudo obtener la información del video. Comprueba el enlace.");
                }
            } else {
                setError("Error al procesar la solicitud. Por favor, inténtalo de nuevo más tarde.");
            }
        } catch (err) {
            console.error("Error downloading video:", err);
            setError("Ocurrió un error al conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    const handleStartDownload = async (download: DownloadOption) => {
        if (!download.url.includes('.m3u8')) {
            window.open(download.url, '_blank');
            return;
        }

        const taskId = Math.random().toString(36).substring(7);
        const resolutionId = download.resolution || 'default';
        setDownloadProgress((prev) => ({ ...prev, [resolutionId]: 0 }));

        try {
            // Start processing entirely in the background
            const startRes = await fetch(`/api/process-m3u8`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: download.url,
                    title: videoData?.title || '',
                    taskId: taskId,
                    duration: videoData?.duration || 0
                })
            });
            if (!startRes.ok) {
                console.error("Fallo al iniciar procesamiento");
                setTimeout(() => setDownloadProgress((p) => { const n = { ...p }; delete n[resolutionId]; return n; }), 2000);
                return;
            }
        } catch (e) {
            console.error(e);
            return;
        }

        const checkProgress = setInterval(async () => {
            try {
                const res = await fetch(`/api/progress?taskId=${taskId}`);
                const data = await res.json();

                if (data && typeof data.progress === 'number') {
                    setDownloadProgress((prev) => ({ ...prev, [resolutionId]: data.progress }));

                    if (data.progress >= 100 && data.status === 'completed') {
                        clearInterval(checkProgress);

                        // Una vez finalizado por el backend, procedemos a descargar verdaderamente el archivo resultante
                        const downloadUrl = `/api/download-file?taskId=${taskId}&title=${encodeURIComponent(videoData?.title || '')}`;
                        const iframe = document.createElement('iframe');
                        iframe.style.display = 'none';
                        iframe.src = downloadUrl;
                        document.body.appendChild(iframe);

                        // Limpiamos el iframe en 30 minutos
                        setTimeout(() => { if (document.body.contains(iframe)) document.body.removeChild(iframe); }, 1800000);

                        setTimeout(() => {
                            setDownloadProgress((prev) => {
                                const newP = { ...prev };
                                delete newP[resolutionId];
                                return newP;
                            });
                        }, 5000);
                    } else if (data.status === 'error' || data.status === 'unknown') {
                        clearInterval(checkProgress);
                        setTimeout(() => {
                            setDownloadProgress((prev) => {
                                const newP = { ...prev };
                                delete newP[resolutionId];
                                return newP;
                            });
                        }, 2000);
                    }
                }
            } catch (e) {
                // Ignore fetch errors during polling
            }
        }, 1500);
    };

    return (
        <main style={{ backgroundColor: "#000", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Agregado elemento semántico <main> en lugar de un <div> genérico. Mejora la accesibilidad y el SEO. */}
            <Head>
                {/* Meta Etiquetas Básicas Optimizadas para Motores de Búsqueda */}
                <title>Descargador de Videos XclusivePorn - Rápido, Gratis y Alta Calidad</title>
                <meta name="description" content="Descarga tus videos favoritos fácilmente con nuestro descargador de video premium. Compatible con formato MP4, 1080p y 4K. Solo pega el enlace y comienza a descargar GRATIS." />
                <meta name="keywords" content="descargador de videos, descargar gratis, bajar video mp4, xnxx downloader, xhamster downloader, pornhub downloader, guardar video, downloader online" />
                <meta name="robots" content="index, follow" /> {/* Permite a Google indexar y seguir la página */}
                <meta name="author" content="XclusivePorn" />

                {/* Etiquetas Open Graph (OG) para que se vea genial al compartir en Redes Sociales, Discord o WhatsApp */}
                <meta property="og:title" content="Descargador de Videos XclusivePorn - Alta Velocidad" />
                <meta property="og:description" content="La herramienta definitiva para bajar tus videos favoritos en calidad máxima, sin límites." />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="XclusivePorn" />

                {/* Etiquetas Twitter Card para Twitter/X */}
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content="Descargador de Videos Gratis - XclusivePorn" />
                <meta name="twitter:description" content="Descarga rápido y seguro en formato MP4 y máxima calidad." />

                {/* Structured Data (JSON-LD) - Genera un 'Rich Snippet' en Google definiendo esto como una herramienta de software */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebApplication",
                            "name": "XclusivePorn Video Downloader",
                            "applicationCategory": "MultimediaApplication",
                            "operatingSystem": "All",
                            "description": "Herramienta gratuita para descargar videos de múltiples plataformas online en formato MP4 sin límites ni esperas.",
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
                    maxWidth: videoData ? 900 : 700,
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

                        {/* Cambio importante de SEO: Toda página debe tener UN único elemento H1. component="h1" le dice a Google que es el tema principal, pero visualmente mantenemos variant="h3" */}
                        <Typography variant="h3" component="h1" sx={{
                            color: "#fff",
                            fontWeight: 900,
                            mb: 1,
                            letterSpacing: "-1px",
                            fontSize: { xs: "2rem", md: "3rem" }
                        }}>
                            VIDEO DOWNLOADER
                        </Typography>

                        {/* Convertimos el subtítulo principal en un <H2> para estructurar jerárquicamente */}
                        <Typography component="h2" variant="h6" sx={{ color: "rgba(255,255,255,0.5)", mb: 5, fontWeight: 400 }}>
                            Introduce el enlace del video para comenzar la descarga en alta calidad
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
                            {loading ? <CircularProgress size={28} color="inherit" /> : "DESCARGAR VIDEO"}
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

                        {videoData && (
                            <Box sx={{ mt: 5, textAlign: "left", animation: "fadeIn 0.5s ease" }}>
                                <Typography variant="h5" sx={{ color: "#fff", fontWeight: "bold", mb: 2 }}>
                                    Resultado
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
                                        image={videoData.thumbnail}
                                        alt={videoData.title}
                                    />
                                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <CardContent sx={{ flex: '1 0 auto', p: 3 }}>
                                            <Typography component="div" variant="h6" sx={{ color: "#fff", fontWeight: "bold", mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {videoData.title}
                                            </Typography>
                                            <Typography variant="subtitle1" color="text.secondary" component="div" sx={{ color: "rgba(255,255,255,0.7)", mb: 2 }}>
                                                Mejor resolución: {videoData.best_resolution || 'Desconocida'}
                                            </Typography>
                                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />
                                            <Typography variant="subtitle2" sx={{ color: "#f013e5", mb: 2, fontWeight: "bold", letterSpacing: "1px" }}>
                                                ENLACES DE DESCARGA:
                                            </Typography>
                                            <Grid container spacing={2}>
                                                {videoData.downloads && videoData.downloads.length > 0 ? (
                                                    Array.from(new Map(videoData.downloads.map(item => [item.resolution || item.url, item])).values()).map((download, index) => {
                                                        const resolutionId = download.resolution || 'default';
                                                        const progress = downloadProgress[resolutionId];
                                                        const isDownloading = progress !== undefined;

                                                        return (
                                                            <Grid item xs={12} sm={6} md={4} key={index}>
                                                                <Box sx={{ position: 'relative', width: '100%' }}>
                                                                    <Button
                                                                        variant="outlined"
                                                                        fullWidth
                                                                        onClick={() => handleStartDownload(download)}
                                                                        disabled={isDownloading}
                                                                        startIcon={isDownloading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                                                                        sx={{
                                                                            color: isDownloading ? "rgba(255,255,255,0.7)" : "#fff",
                                                                            borderColor: isDownloading ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.3)",
                                                                            borderRadius: "10px",
                                                                            textTransform: "none",
                                                                            py: 1,
                                                                            "&:hover": {
                                                                                borderColor: "#f013e5",
                                                                                backgroundColor: "rgba(240, 19, 229, 0.1)"
                                                                            }
                                                                        }}
                                                                    >
                                                                        {isDownloading ? `Procesando... ${progress}%` : (download.resolution || download.ext || "Descargar")}
                                                                    </Button>
                                                                    {isDownloading && (
                                                                        <LinearProgress
                                                                            variant="determinate"
                                                                            value={progress}
                                                                            color="secondary"
                                                                            sx={{
                                                                                position: 'absolute',
                                                                                bottom: -4,
                                                                                left: 4,
                                                                                right: 4,
                                                                                height: 4,
                                                                                borderRadius: 2,
                                                                                backgroundColor: 'rgba(255,255,255,0.1)',
                                                                                '& .MuiLinearProgress-bar': {
                                                                                    backgroundColor: '#f013e5'
                                                                                }
                                                                            }}
                                                                        />
                                                                    )}
                                                                </Box>
                                                            </Grid>
                                                        );
                                                    })
                                                ) : (
                                                    <Grid item xs={12}>
                                                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
                                                            No hay enlaces de descarga directos disponibles.
                                                        </Typography>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </CardContent>
                                    </Box>
                                </Card>
                            </Box>
                        )}
                    </Box>
                </Paper>

                <Box sx={{ mt: 10, textAlign: "center", maxWidth: 900, width: "100%" }}>
                    <Typography variant="h5" sx={{ color: "#fff", mb: 4, fontWeight: "bold", opacity: 0.8 }}>
                        Plataformas Compatibles
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

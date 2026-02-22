import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getVideosPaginated, SupabaseVideo } from "@/api/videoSupabaseService";
import { Skeleton, Box, Button, Chip } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import HeartBrokenIcon from "@mui/icons-material/HeartBroken";
import FooterComponent from "../footer/Footer";
import AgeVerification from "../OlderVerify/OlderVerify";
import Image from "next/image";
import { getVisitorId } from "@/api/visitorIdHelper";

const VideoGrid: React.FC = () => {
  const [videoL, setVideoL] = useState<SupabaseVideo[]>([]);
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const [loadingPreviews, setLoadingPreviews] = useState<{ [key: string]: boolean }>({});
  const [currentPreview, setCurrentPreview] = useState<{ [key: string]: number }>({});
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [votedVideos, setVotedVideos] = useState<Set<string>>(new Set());
  const videosPerPage = 30;

  const loadVideos = async (page: number) => {
    try {
      const { items, totalCount: count } = await getVideosPaginated(videosPerPage, page);
      setVideoL(items);
      setTotalCount(count);
    } catch (error) {
      console.error("Error loading videos:", error);
    }
  };

  useEffect(() => {
    loadVideos(currentPage);
  }, [currentPage]);

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
      // Use preview_url for previews. If it's a comma-separated list of images, split it.
      // If it's a video file (mp4/webm), we'll handle it in the render.
      const previewSource = video?.preview_url || video?.preview; // Fallback to legacy

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

  const handleClick = (video: SupabaseVideo) => {
    // Navigate to the video page using uuid and title as slug
    const title = video.titulo || video.title || "video";
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-');         // Replace multiple - with single -

    router.push(`/video/${video.uuid}-${slug}`);
  };

  const handleRating = async (e: React.MouseEvent, uuid: string, type: 'likes' | 'dislikes', currentValue: number) => {
    e.stopPropagation();

    if (votedVideos.has(uuid)) {
      alert("Ya has votado en este video.");
      return;
    }

    try {
      const visitorId = getVisitorId();

      // Actualización optimista
      setVideoL(prev => prev.map(v =>
        v.uuid === uuid ? { ...v, [type]: (v[type] || 0) + 1 } : v
      ));

      // Actualizar estado local y persistir
      const newVoted = new Set(votedVideos);
      newVoted.add(uuid);
      setVotedVideos(newVoted);
      localStorage.setItem(`voted_${uuid}`, type);

      const { registerVote } = await import("@/api/videoSupabaseService");
      await registerVote(uuid, visitorId, type, currentValue);
    } catch (error: any) {
      console.error(`Error updating ${type}:`, error);
      // Revertir si hay error (opcional)
      if (error.message === 'Already voted') {
        alert("Ya has reaccionado a este video.");
      }
    }
  };

  const totalPages = Math.ceil(totalCount / videosPerPage);

  return (
    <div>
      <AgeVerification />
      <div style={styles.container}>
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
            padding: "15px",
          }}
        >
          {videoL.length === 0
            ? Array(15)
              .fill(0)
              .map((_, index) => (
                <div key={index} style={{ ...styles.videoCard, backgroundColor: "rgba(240, 236, 236, 0.1)", minHeight: "220px" }}>
                  <Skeleton variant="rectangular" width="100%" height={150} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                  <Skeleton variant="text" width="90%" style={{ marginTop: "10px", marginLeft: "10px" }} />
                  <Skeleton variant="text" width="60%" style={{ marginTop: "5px", marginLeft: "10px" }} />
                </div>
              ))
            : videoL.map((video: SupabaseVideo) => {
              const previewUrl = video.preview_url || video.preview;
              const thumbnails = (previewUrl && !previewUrl.endsWith('.mp4') && !previewUrl.endsWith('.webm'))
                ? previewUrl.split(",").map(u => u.trim()).filter(Boolean)
                : [];

              const isHovered = hoveredVideo === video.uuid;

              // Determine what to show
              // If hovering and we have a video preview url, show video.
              // If hovering and we have image thumbnails, show rotating thumbnails.
              // Otherwise show main image.

              const isVideoPreview = previewUrl && (previewUrl.endsWith('.mp4') || previewUrl.endsWith('.webm'));

              const currentImg = (isHovered && thumbnails.length > 0)
                ? thumbnails[currentPreview[video.uuid] || 0]
                : (video.imagen_url || video.img_src);

              return (
                <Box
                  key={video.uuid || video.id_post}
                  sx={styles.videoCardSx}
                  onMouseEnter={() => {
                    setHoveredVideo(video.uuid);
                    setLoadingPreviews((prev) => ({ ...prev, [video.uuid]: true }));
                    setCurrentPreview((prev) => ({ ...prev, [video.uuid]: 0 }));
                  }}
                  onMouseLeave={() => {
                    setHoveredVideo(null);
                    setLoadingPreviews((prev) => ({ ...prev, [video.uuid]: false }));
                  }}
                  onClick={() => handleClick(video)}
                >
                  {/* Image/Video Container without overlays */}
                  <div style={styles.thumbnailContainer}>
                    {isHovered && (video.video_stream_url || isVideoPreview) ? (
                      <video
                        src={video.video_stream_url || `/api/media?uuid=${video.uuid}&type=preview`}
                        autoPlay
                        muted
                        loop
                        playsInline
                        onLoadedData={() => setLoadingPreviews((prev) => ({ ...prev, [video.uuid]: false }))}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    ) : (
                      <Image
                        priority
                        height={200}
                        width={300}
                        src={currentImg || video.imagen_url || video.img_src || '/assets/placeholder.png'} // Fallback
                        alt={video.titulo || video.title || 'Video'}
                        style={styles.thumbnail}
                        unoptimized={true}
                        onLoad={() => {
                          if (isHovered) {
                            setLoadingPreviews((prev) => ({ ...prev, [video.uuid]: false }));
                          }
                        }}
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

                  {/* Metadata Area Below Video */}
                  <div style={styles.metadataArea}>
                    <p style={styles.videoTitle}>{video.titulo || video.title}</p>

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
                      </Box>
                      <span style={styles.durationLabel}>
                        ⏳ {(video.duracion_segundos && video.duracion_segundos > 0)
                          ? `${Math.floor(video.duracion_segundos / 60)}:${(video.duracion_segundos % 60).toString().padStart(2, '0')}`
                          : (video.duracion || "0:00")}
                      </span>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
                      {/* 
                      <Chip
                        label={video.from}
                        size="small"
                        sx={styles.sourceChip}
                      />
                      */}
                    </Box>
                  </div>
                </Box>
              );
            })}
        </Box>

        {/* Paginación */}
        <Box sx={{ display: "flex", justifyContent: "center", marginBottom: '40px', gap: '10px', padding: '20px' }}>
          <Button
            variant="contained"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                onClick={() => setCurrentPage(pageNum)}
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
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            sx={styles.paginationBtnSx}
          >
            Next
          </Button>
        </Box>

        <FooterComponent />
      </div>
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
    // This style object is partially superseded by the sx prop in the component render,
    // but kept here for reference or fallback.
    display: "grid",
    gap: "15px",
    padding: "15px",
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
  sourceChip: {
    backgroundColor: "rgba(240, 19, 229, 0.15)",
    color: "#f013e5",
    fontSize: "0.65rem",
    height: "18px",
    fontWeight: "bold",
    border: "1px solid rgba(240, 19, 229, 0.3)",
    '& .MuiChip-label': { padding: '0 6px' }
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

export default VideoGrid;

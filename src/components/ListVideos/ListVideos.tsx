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
    // Cargar votos locales al inicio
    const savedVotes = localStorage.getItem('voted_videos');
    if (savedVotes) {
      setVotedVideos(new Set(JSON.parse(savedVotes)));
    }
  }, [currentPage]);

  useEffect(() => {
    if (hoveredVideo) {
      const video = videoL.find((v) => v.id_post === hoveredVideo);
      const previewImages = video?.preview?.split(",").map(u => u.trim()).filter(Boolean) || [];

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
  }, [hoveredVideo, videoL]);

  const handleClick = (video: SupabaseVideo) => {
    let url = "";
    if (video.href) {
      if (video.href.startsWith('http') || video.href.startsWith('/')) {
        url = video.href;
      } else {
        url = `/video/${video.href}`;
      }
    } else {
      url = `/video/${video.id_post}`;
    }
    window.open(url, '_blank');
  };

  const handleRating = async (e: React.MouseEvent, id_post: string, type: 'likes' | 'dislikes', currentValue: number) => {
    e.stopPropagation();

    if (votedVideos.has(id_post)) {
      alert("Ya has votado en este video.");
      return;
    }

    try {
      const visitorId = getVisitorId();

      // Actualización optimista
      setVideoL(prev => prev.map(v =>
        v.id_post === id_post ? { ...v, [type]: (v[type] || 0) + 1 } : v
      ));

      // Actualizar estado local y persistir
      const newVoted = new Set(votedVideos);
      newVoted.add(id_post);
      setVotedVideos(newVoted);
      localStorage.setItem('voted_videos', JSON.stringify(Array.from(newVoted)));

      const { registerVote } = await import("@/api/videoSupabaseService");
      await registerVote(id_post, visitorId, type, currentValue);
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
        <div style={styles.gridContainer}>
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
              const previewURLs = video.preview ? video.preview.split(",").map(u => u.trim()).filter(Boolean) : [];
              const isHovered = hoveredVideo === video.id_post;
              const currentImg = (isHovered && previewURLs.length > 0)
                ? previewURLs[currentPreview[video.id_post] || 0]
                : video.img_src;

              const isVideo = currentImg?.toLowerCase().endsWith('.mp4');

              return (
                <Box
                  key={video.id_post}
                  sx={styles.videoCardSx}
                  onMouseEnter={() => {
                    setHoveredVideo(video.id_post);
                    setCurrentPreview((prev) => ({ ...prev, [video.id_post]: 0 }));
                  }}
                  onMouseLeave={() => setHoveredVideo(null)}
                  onClick={() => handleClick(video)}
                >
                  {/* Image/Video Container without overlays */}
                  <div style={styles.thumbnailContainer}>
                    {isHovered && isVideo ? (
                      <video
                        src={currentImg}
                        autoPlay
                        muted
                        loop
                        playsInline
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
                        src={currentImg || video.img_src}
                        alt={video.title}
                        style={styles.thumbnail}
                        unoptimized={true}
                      />
                    )}
                  </div>

                  {/* Metadata Area Below Video */}
                  <div style={styles.metadataArea}>
                    <p style={styles.videoTitle}>{video.title}</p>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Box
                          onClick={(e) => handleRating(e, video.id_post, 'likes', video.likes || 0)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            cursor: votedVideos.has(video.id_post) ? 'default' : 'pointer',
                            opacity: votedVideos.has(video.id_post) ? 0.5 : 1,
                            pointerEvents: votedVideos.has(video.id_post) ? 'none' : 'auto',
                            '&:hover': { transform: 'scale(1.2)' },
                            transition: 'transform 0.2s'
                          }}
                        >
                          <FavoriteIcon sx={{ fontSize: '14px', color: '#f013e5' }} />
                          <span style={styles.statsText}>{video.likes || 0}</span>
                        </Box>
                        <Box
                          onClick={(e) => handleRating(e, video.id_post, 'dislikes', video.dislikes || 0)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            cursor: votedVideos.has(video.id_post) ? 'default' : 'pointer',
                            opacity: votedVideos.has(video.id_post) ? 0.5 : 1,
                            pointerEvents: votedVideos.has(video.id_post) ? 'none' : 'auto',
                            '&:hover': { transform: 'scale(1.2)' },
                            transition: 'transform 0.2s'
                          }}
                        >
                          <HeartBrokenIcon sx={{ fontSize: '14px', color: '#888' }} />
                          <span style={styles.statsText}>{video.dislikes || 0}</span>
                        </Box>
                      </Box>
                      <span style={styles.durationLabel}>⏳ {video.duracion}</span>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
                      <Chip
                        label={video.from}
                        size="small"
                        sx={styles.sourceChip}
                      />
                    </Box>
                  </div>
                </Box>
              );
            })}
        </div>

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
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
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

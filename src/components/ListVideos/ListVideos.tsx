import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import useDynamoDB from "@/hooks/UseDynamoDB";
import { VideoItem } from "@/api/types/videoTypes";
import { addVideos } from "@/redux/videosSlice";
import { VideosState } from "@/redux/videosSlice";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton, Pagination } from "@mui/material"; // Importamos Pagination
import FooterComponent from "../footer/Footer";
import { CSSProperties } from "react";
import AgeVerification from "../OlderVerify/OlderVerify";
import Image from "next/image";

const VideoGrid: React.FC = () => {
  const { GetItems } = useDynamoDB("list_videos");
  const [videoL, setVideoL] = useState<any>([]);
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const [currentPreview, setCurrentPreview] = useState<{
    [key: string]: number;
  }>({});
  const [loading, setLoading] = useState(true); // Nuevo estado para el loading
  const dispatch = useDispatch();
  const videos = useSelector(
    (state: { videos: VideosState }) => state.videos.videos
  );

  const router = useRouter();

  const handleAddVideo = (newVideos: any) => {
    dispatch(addVideos(newVideos));
  };

  const [currentPage, setCurrentPage] = useState(1); // Estado de la página actual
  const videosPerPage = 19; // Limitar a 20 videos por página

  const handlePageChange = (event: any, value: number) => {
    setCurrentPage(value);
  };

  useEffect(() => {
    if (videos.length === 0) {
      setLoading(false);
      GetItems().then((tables) => {
        if (tables) {
          setVideoL(tables); // Solo se llama si tables no es undefined
        } else {
          setVideoL([]); // Si es undefined, se establece un arreglo vacío
        }
      });
    } else {
      setVideoL(videos);
      setLoading(false); // Si ya hay videos en Redux, dejamos de mostrar el Skeleton
    }
  }, [videos]);

  useEffect(() => {
    if (videoL.length > 0) {
      handleAddVideo(videoL);
    }
  }, [videoL]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (hoveredVideo) {
      interval = setInterval(() => {
        setCurrentPreview((prev) => ({
          ...prev,
          [hoveredVideo]:
            (prev[hoveredVideo] + 1) %
            videoL
              .find((v: any) => v.id_video.S === hoveredVideo)!
              .video_thumsnail.S.split(",").length,
        }));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [hoveredVideo, videoL]);

  const handleClick = (video: VideoItem) => {
    router.push({
      pathname: `/video/${video.id_video.S}`
    });
  };

  // Calcular el índice de inicio y fin de los videos a mostrar según la página actual
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = videoL.slice(indexOfFirstVideo, indexOfLastVideo); // Seleccionar los videos de la página actual

  return (
    <div>
      <meta
        name="juicyads-site-verification"
        content="f483025e8fb2d3cfaa1a93f7fde3d85d"
      />
      <AgeVerification />
      <div style={styles.container}>
        <div style={styles.gridContainer}>
          {currentVideos?.length == 0
            ? Array(8)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    style={{
                      ...styles.videoCard,
                      backgroundColor: "rgba(240, 236, 236, 0.3)",
                      minHeight: "230px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={200}
                      style={styles.thumbnail}
                    />
                    <Skeleton
                      variant="text"
                      width="60%"
                      style={{ marginTop: "10px", marginLeft: "20px" }}
                    />
                    <Skeleton
                      variant="text"
                      width="40%"
                      style={{ marginTop: "5px", marginLeft: "20px" }}
                    />
                    <Skeleton
                      variant="text"
                      width="40%"
                      style={{ marginTop: "5px", marginLeft: "20px" }}
                    />
                    <Skeleton
                      variant="text"
                      width="40%"
                      style={{ marginTop: "5px", marginLeft: "20px" }}
                    />
                    <Skeleton
                      variant="text"
                      width="40%"
                      style={{ marginTop: "5px", marginLeft: "20px" }}
                    />
                  </div>
                ))
            : currentVideos.map((video: any) => {
                const previewImages = video.video_thumsnail?.S
                  ? video.video_thumsnail.S.split(",")
                      .map((url: any) => url.trim())
                      .filter(Boolean)
                  : [];

                return (
                  <div
                    key={video.id_video?.S || `skeleton-${Math.random()}`}
                    style={styles.videoCard}
                    onMouseEnter={() => {
                      setHoveredVideo(video.id_video?.S);
                      setCurrentPreview((prev) => ({
                        ...prev,
                        [video.id_video?.S]: 0,
                      }));
                    }}
                    onMouseLeave={() => setHoveredVideo(null)}
                    onClick={() => handleClick(video)}
                  >
                    <div style={styles.thumbnailContainer}>
                      <p style={styles.videoTitle}>{video.video_name.S}</p>
                      <Image
                        priority
                        height={300}
                        width={300}
                        src={video.oficial_thumb.S}
                        alt={video.video_name.S}
                        style={styles.thumbnail}
                      />
                      {hoveredVideo === video.id_video.S &&
                        previewImages.length > 0 && (
                          <Image
                            priority
                            height={300}
                            width={300}
                            alt={video.video_name.S}
                            src={
                              previewImages[
                                currentPreview[video.id_video.S] || 0
                              ]
                            }
                            style={styles.previewOverlay}
                          />
                        )}
                      <div style={styles.videoInfo}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <div
                            style={{
                              ...styles.overlay,
                              opacity:
                                hoveredVideo === video.id_video.S ? 0 : 1,
                            }}
                          >
                            <span>⏳ {video.video_time.S}</span> |
                            <span>❤️ {video.video_likes.S}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>

        {/* Paginador */}
        <Pagination
          count={Math.ceil(videoL.length / videosPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="secondary"
          sx={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
            "& .MuiPaginationItem-icon": { color: "white" },
            "& .MuiPaginationItem-text": { color: "rgba(255, 255, 255, 0.6)" },
            "& .MuiPaginationItem-root.Mui-selected": { color: "white" },
          }}
        />

        <FooterComponent />
      </div>
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh", // Esto asegura que el contenido y el footer se distribuyan correctamente
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "14px",
    paddingTop: "17px",
    marginBottom: "60px", // Espacio entre el contenido y el footer
  },
  videoCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "10px",
    transition: "transform 0.3s ease-in-out",
    cursor: "pointer",
  },
  thumbnailContainer: {
    position: "relative",
    width: "100%",
    height: "auto",
    aspectRatio: "16/9",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    display: "block",
    objectFit: "cover",
    borderRadius: "10px",
  },
  previewOverlay: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "10px",
    transition: "opacity 0.3s ease-in-out",
  },
  videoInfo: {
    position: "absolute",
    bottom: "2px",
    left: "3px",
    right: "8px",
    color: "white",
    padding: "1px 1px",
    fontSize: "10px",
    borderRadius: "5px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "opacity 0.3s ease-in-out",
  },
  overlay: {
    background: "rgba(115, 38, 122, 0.6)", // Fondo oscuro que cubre solo los íconos
    padding: "5px 10px",
    fontSize: "12px",
    borderRadius: "5px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "auto", // Esto hace que el fondo solo cubra lo necesario
  },
  videoTitle: {
    position: "absolute", // Se posiciona sobre la imagen
    top: "1px",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "11px", // Tamaño ajustado para visibilidad
    color: "white",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo oscuro para el texto
    borderRadius: "3px",
  },
};

export default VideoGrid;

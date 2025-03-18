import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import useDynamoDB from "@/hooks/UseDynamoDB";
import { VideoItem } from "@/api/types/videoTypes";
import { addVideos } from "@/redux/videosSlice";
import { VideosState } from "@/redux/videosSlice";
import { useDispatch } from "react-redux";
import { Skeleton, Pagination, Box, Button } from "@mui/material";
import FooterComponent from "../footer/Footer";
import { CSSProperties } from "react";
import AgeVerification from "../OlderVerify/OlderVerify";
import Image from "next/image";
import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { dynamoClient } from "@/api/dynamoClient";

const VideoGrid: React.FC = () => {
  const { getItemsPaginated } = useDynamoDB("list_videos");
  const [videoL, setVideoL] = useState<any>([]);
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const [currentPreview, setCurrentPreview] = useState<{ [key: string]: number }>({});
  const [currentStartKey, setCurrentStartKey] = useState<any>(undefined);
  const [prevKeys, setPrevKeys] = useState<any[]>([]);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleAddVideo = (newVideos: any) => {
    dispatch(addVideos(newVideos));
  };

  // Paginación: usamos server-side pagination
  const [lastKey, setLastKey] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const videosPerPage = 10;

  const loadVideos = async (startKey?: any) => {
    const data = await getItemsPaginated(videosPerPage, startKey);
    //console.log("datas", data);
    setVideoL(data?.items || []);
    setLastKey(data?.lastEvaluatedKey);
    setCurrentStartKey(startKey);
  };

  useEffect(() => {
    // Para la primera carga, pasamos undefined o null
    loadVideos();
    fetchTotalCount().then((count) => {setTotalCount(count)});
  }, []);

  const fetchTotalCount = async () => {
    try {
      const params = {
        TableName: "list_videos",
        Select: "COUNT" as const,
      };
      const data = await dynamoClient.send(new ScanCommand(params));
      return data.Count || 0;
    } catch (err) {
      console.error("Error al obtener total de elementos:", err);
      return 0;
    }
  };


  // Actualiza Redux (opcional)
  useEffect(() => {
    console.log("charged", videoL);
    if (videoL && videoL.length > 0) {
      dispatch(addVideos(videoL));
    }
  }, [videoL, dispatch]);

  const handleNextPage = async () => {
    if (lastKey) {
      // Guarda la clave actual en el stack
      setPrevKeys((prev) => [...prev, currentStartKey]);
      setCurrentPage((prev) => prev + 1);
      await loadVideos(lastKey);
    }
  };

  const handlePreviousPage = async () => {
    if (prevKeys.length > 0) {
      const newPrevKeys = [...prevKeys];
      const previousKey = newPrevKeys.pop();
      setPrevKeys(newPrevKeys);
      setCurrentPage((prev) => prev - 1);
      await loadVideos(previousKey);
    }
  };


  useEffect(() => {
    if (videoL && videoL.length > 0) {
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
            ((prev[hoveredVideo] || 0) + 1) %
            videoL.find((v: any) => v.id_video.S === hoveredVideo)?.video_thumsnail.S.split(",").length,
        }));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [hoveredVideo, videoL]);

  const handleClick = (video: VideoItem) => {
    router.push({ pathname: `/video/${video.id_video.S}` });
  };

  // Si estamos usando paginación en el servidor, videoL ya contiene los items de la página actual
  const currentVideos = Array.isArray(videoL) ? videoL : [];
  const totalPages = Math.ceil(totalCount / videosPerPage);
  console.log("actuales", currentVideos, totalPages);
  return (
    <div>
      <meta name="juicyads-site-verification" content="f483025e8fb2d3cfaa1a93f7fde3d85d" />
      <AgeVerification />
      <div style={styles.container}>
        <div style={styles.gridContainer}>
          {currentVideos.length === 0
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
                    <Skeleton variant="rectangular" width="100%" height={200} style={styles.thumbnail} />
                    <Skeleton variant="text" width="60%" style={{ marginTop: "10px", marginLeft: "20px" }} />
                    <Skeleton variant="text" width="40%" style={{ marginTop: "5px", marginLeft: "20px" }} />
                    <Skeleton variant="text" width="40%" style={{ marginTop: "5px", marginLeft: "20px" }} />
                    <Skeleton variant="text" width="40%" style={{ marginTop: "5px", marginLeft: "20px" }} />
                    <Skeleton variant="text" width="40%" style={{ marginTop: "5px", marginLeft: "20px" }} />
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
                      {hoveredVideo === video.id_video.S && previewImages.length > 0 && (
                        <Image
                          priority
                          height={300}
                          width={300}
                          alt={video.video_name.S}
                          src={previewImages[currentPreview[video.id_video.S] || 0]}
                          style={styles.previewOverlay}
                        />
                      )}
                      <div style={styles.videoInfo}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <div style={{ ...styles.overlay, opacity: hoveredVideo === video.id_video.S ? 0 : 1 }}>
                            <span>⏳ {video.video_time.S}</span> | <span>❤️ {video.video_likes.S}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>


        {/* Botones de navegación adicionales */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <Button variant="contained" color="secondary" onClick={handlePreviousPage} disabled={currentPage === 1} sx={{ mr: 2 }}>
            Anterior
          </Button>
          {totalPages}
          <Button variant="contained" color="secondary" onClick={handleNextPage} disabled={!lastKey}>
            Siguiente
          </Button>
        </Box>

        <FooterComponent />
      </div>
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "14px",
    paddingTop: "17px",
    marginBottom: "60px",
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
    top: 0,
    left: 0,
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
    background: "rgba(115, 38, 122, 0.6)",
    padding: "5px 10px",
    fontSize: "12px",
    borderRadius: "5px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "auto",
  },
  videoTitle: {
    position: "absolute",
    top: "1px",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "11px",
    color: "white",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: "3px",
  },
};

export default VideoGrid;

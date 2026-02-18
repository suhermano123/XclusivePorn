import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import useDynamoDB from "@/hooks/UseDynamoDB";
import { VideoItem } from "@/api/types/videoTypes";
import { addVideos } from "@/redux/videosSlice";
import { useDispatch } from "react-redux";
import { Skeleton, Box, Button } from "@mui/material";
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
  // Anteriormente se usaba prevKeys, ahora usamos pageKeys para almacenar las claves de inicio de cada página.
  const [pageKeys, setPageKeys] = useState<any[]>([undefined]);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleAddVideo = (newVideos: any) => {
    dispatch(addVideos(newVideos));
  };

  // Paginación: usamos server-side pagination
  const [lastKey, setLastKey] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const videosPerPage = 16;

  const loadVideos = async (startKey?: any) => {
    const data = await getItemsPaginated(videosPerPage, startKey);
    console.log("datas", data);
    const items = data?.items || [];

    const getDateValue = (video: any): Date => {
      if (video.video_date) {
        if (typeof video.video_date === "object" && "S" in video.video_date) {
          return new Date(video.video_date.S as string);
        } else if (typeof video.video_date === "string") {
          return new Date(video.video_date);
        }
      }
      // Si no existe la fecha, asignamos una fecha muy antigua para que quede al final.
      return new Date(0);
    };

    const sortedItems = items.sort((a, b) => {
      const dateA = getDateValue(a);
      const dateB = getDateValue(b);
      return dateB.getTime() - dateA.getTime();
    });

    setVideoL(sortedItems);
    setLastKey(data?.lastEvaluatedKey);
    setCurrentStartKey(startKey);
  };

  useEffect(() => {
    // Para la primera carga, se pasa undefined (página 1)
    loadVideos();
    fetchTotalCount().then((count) => {
      setTotalCount(count);
    });
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
    if (videoL && videoL.length > 0) {
      dispatch(addVideos(videoL));
    }
  }, [videoL, dispatch]);

  // Manejo de avanzar a la siguiente página
  const handleNextPage = async () => {
    if (lastKey) {
      await loadVideos(lastKey);
      // Al avanzar, se agrega la clave de inicio utilizada para esta nueva página
      setPageKeys((prev) => [...prev, lastKey]);
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Manejo de retroceder a la página anterior
  const handlePreviousPage = async () => {
    if (currentPage > 1) {
      const targetPage = currentPage - 1;
      // Se obtiene la clave de inicio almacenada para la página destino
      const targetKey = pageKeys[targetPage - 1]; // ya que la página 1 corresponde a índice 0
      await loadVideos(targetKey);
      setCurrentPage(targetPage);
    }
  };

  // Manejo de cambio directo de página al hacer clic en un número
  const handlePageNumberClick = async (page: number) => {
    if (page === currentPage) return;
    // Si la página solicitada ya fue cargada, se usa la clave almacenada
    if (page <= pageKeys.length) {
      const targetKey = pageKeys[page - 1];
      await loadVideos(targetKey);
      setCurrentPage(page);
    } else {
      // Si se solicita una página futura no cargada, se recorre secuencialmente hasta llegar
      let key = pageKeys[pageKeys.length - 1];
      let targetPage = pageKeys.length;
      while (targetPage < page) {
        const data = await getItemsPaginated(videosPerPage, key);
        const newKey = data?.lastEvaluatedKey;
        if (!newKey) break; // Si no hay más páginas, se sale del ciclo
        key = newKey;
        setPageKeys((prev) => [...prev, key]);
        targetPage++;
      }
      await loadVideos(key);
      setCurrentPage(targetPage);
    }
  };

  useEffect(() => {
    if (hoveredVideo) {
      const interval = setInterval(() => {
        setCurrentPreview((prev) => ({
          ...prev,
          [hoveredVideo]:
            ((prev[hoveredVideo] || 0) + 1) %
            videoL.find((v: any) => v.id_video.S === hoveredVideo)?.video_thumsnail.S.split(",")
              .length,
        }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [hoveredVideo, videoL]);

  const handleClick = (video: VideoItem) => {
    router.push({ pathname: `/video/${video.id_video.S}` });
  };

  // Videos de la página actual
  const currentVideos = Array.isArray(videoL) ? videoL : [];
  const totalPages = Math.ceil(totalCount / videosPerPage);
  console.log("Página actual:", currentPage, "Total de páginas:", totalPages);

  return (
    <div>
      <meta name="juicyads-site-verification" content="f483025e8fb2d3cfaa1a93f7fde3d85d"></meta>
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

        {/* Botones de paginación con números */}
        <Box sx={{ display: "flex", justifyContent: "center", marginBottom: '10px' }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            sx={{
              mr: 1,
              backgroundColor: "#f013e5",
              color: "#fff",
              padding: "10px 10px",
              fontSize: "1.2rem",
              fontWeight: "bold",
              borderRadius: "20px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
              "&:hover": {
                backgroundColor: "#e91ec4",
              },
              "&:disabled": {
                backgroundColor: "#bfbec9",
                color: "#e0e0e0",
              },
            }}
          >
            Back
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "contained" : "outlined"}
              onClick={() => handlePageNumberClick(page)}
              sx={{
                mx: 1,
                backgroundColor: page === currentPage ? "#f013e5" : "transparent",
                color: page === currentPage ? "#fff" : "#f013e5",
                fontSize: "1rem",
                borderRadius: "5px",
                padding: "5px 10px",
                border: "1px solid #f013e5",
                "&:hover": {
                  backgroundColor: page === currentPage ? "#e91ec4" : "#f013e5",
                  color: "#fff",
                },
              }}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="contained"
            color="secondary"
            onClick={handleNextPage}
            disabled={!lastKey}
            sx={{
              ml: 1,
              backgroundColor: "#f013e5",
              color: "#fff",
              padding: "10px 10px",
              fontSize: "1.2rem",
              fontWeight: "bold",
              borderRadius: "20px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
              "&:hover": {
                backgroundColor: "#e91ec4",
              },
              "&:disabled": {
                backgroundColor: "#b0aef5",
                color: "#e0e0e0",
              },
            }}
          >
            Next
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
    marginBottom: "10px",
    padding: "10px",
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

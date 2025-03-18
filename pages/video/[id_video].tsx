import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NavBar from "@/components/NavBar/NavBar";
import NavMenu from "@/components/NavMenu/NavMenu";
import useDynamoDB from "@/hooks/UseDynamoDB";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import {
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Paper,
  Typography,
  IconButton,
  Pagination,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import { useDispatch, useSelector } from "react-redux";
import { VideosState } from "@/redux/videosSlice";
import FooterComponent from "@/components/footer/Footer";
import { CSSProperties } from "react";
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import useWasabiObjectUrl from "@/hooks/UseWasabiGetObject";
import VideoPlayer from "@/components/VideoPlayer/VideoPlayer";
import ThumbnailSlider from "@/components/ThumbsnailSlider/ThumbsnailSlider";

const VideoPage: React.FC = () => {
  const { getItem, GetItems, addComment } = useDynamoDB("list_videos");
  const router = useRouter();
  const [hoveredVideo, setHoveredVideo] = useState<string>("");
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [videoData, setVideoData] = useState<any>(null);
  const { url, downloadFile } = useWasabiObjectUrl(
    videoData?.video_embed_url?.S
  );
  const { id_video } = router.query;
  const videoUrl = url?.toString();
  console.log("vids", relatedVideos, url);

  const videoTagsArray = Array.isArray(videoData?.video_tags?.S)
    ? videoData?.video_tags?.S.flatMap((tag: any) =>
        tag.split(",").map((t: any) => t.trim())
      )
    : videoData?.video_tags?.S?.split(",").map((tag: any) => tag.trim()) || [];

  const idVideo = id_video?.toString();

  const [currentPreview, setCurrentPreview] = useState<{
    [key: string]: number;
  }>({}); // Preview dinámico
  const [newComment, setNewComment] = useState("");

  const [likes, setLikes] = useState(videoData?.video_likes?.S);
  const oldComment = videoData?.video_comments?.S;
  const [comments, setComments] = useState<string[]>([oldComment]);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [dislikes, setDislikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1); // Estado de la página actual
  const videosPerPage = 8;

  const videos =
    useSelector((state: { videos: VideosState }) => state.videos.videos) ||
    videoData;

  useEffect(() => {
    if (!idVideo) return;

    const videoInRedux = videos.find((video) => video.id_video.S === idVideo);

    if (videoInRedux) {
      setVideoData(videoInRedux);
      console.log("Video encontrado en Redux:", videoInRedux);
    } else {
      getItem(idVideo as string).then((data: any) => {
        if (data) {
          console.log("Video obtenido de DynamoDB:", data);
          setVideoData(data);

          // 🔍 Obtener todos los videos desde DynamoDB
          GetItems().then(
            (allVideos: Record<string, AttributeValue>[] | undefined) => {
              console.log("Todos los videos obtenidos:", allVideos);

              // ✅ Guardar los videos en Redux (si lo necesitas)
              dispatch({ type: "SET_VIDEOS", payload: allVideos });

              // ✅ Llamar a getRelatedVideos con la nueva lista de videos
              setRelatedVideos(
                getRelatedVideos(data?.video_tags?.S, allVideos)
              );
            }
          );
        }
      });
    }
  }, [idVideo, videos]); // Dependencias
  console.log("actuales", oldComment);
  // ✅ Nuevo useEffect para asegurarnos de que los videos relacionados se actualicen correctamente
  useEffect(() => {
    if (videoData && videoData.video_tags?.S) {
      console.log("Actualizando videos relacionados desde Redux/DynamoDB...");
      setRelatedVideos(getRelatedVideos(videoData.video_tags.S, videos));
    }
  }, [videoData, videos]); // Se ejecuta cuando cambia videoData o los videos en Redux

  // ✅ getRelatedVideos ahora recibe la lista de videos correctamente
  const getRelatedVideos = (tags: string, videoList: any[] = []) => {
    if (!tags || videoList.length === 0) return [];

    const tagsArray = tags.split(",").map((tag) => tag.trim());
    console.log("Ejecutando getRelatedVideos con videos:", videoList);

    const related = videoList.filter((video) => {
      const videoTagsArray =
        video?.video_tags?.S?.split(",").map((tag: any) => tag.trim()) || [];
      return videoTagsArray.some((tag: any) => tagsArray.includes(tag));
    });

    return related;
  };

  const videoDescription =
    videos[0]?.video_description?.S ||
    relatedVideos?.map((videos) => {
      if (videos?.id_video?.S == idVideo) {
        return videos?.video_description?.S;
      }
    });
  const handleLike = () => {
    setLiked(!liked);
    setLikes(likes + (liked ? -1 : 1));
    if (disliked) {
      setDisliked(false);
      setDislikes(dislikes - 1);
    }
  };

  const handleDislike = () => {
    setDisliked(!disliked);
    setDislikes(dislikes + (disliked ? -1 : 1));
    if (liked) {
      setLiked(false);
      setLikes(likes - 1);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !formData.name.trim()) return; // Evita comentarios sin texto o sin nombre

    // Concatenar el nombre al comentario
    const formattedComment = `${formData.name}: ${newComment}`;

    // Agregar el nuevo comentario al array existente
    const updatedComments = [...comments, formattedComment];

    console.log("Nuevo comentario agregado:", updatedComments);

    // Convierte el array actualizado a un JSON string válido
    const updatedCommentString = JSON.stringify(updatedComments);

    try {
      // Guarda los comentarios actualizados en DynamoDB
      await addComment(idVideo, updatedCommentString);

      // Actualiza el estado local con el nuevo array de comentarios
      setComments(updatedComments);
      setNewComment(""); // Limpia el campo de entrada
    } catch (error) {
      console.error("Error al guardar el comentario:", error);
    }
  };

  const handleDownloadVideo = () => {
    window.open(videoData.video_download.S, "_blank");
  };

  const handleMouseEnter = (videoId: string, thumbnails: string) => {
    setHoveredVideo(videoId);
    const thumbArray = thumbnails
      .split(",")
      .map((thumb: string) => thumb.trim());
    setCurrentPreview({ [videoId]: 0 }); // Inicializa el preview con la primera imagen
  };

  const handleMouseLeave = () => {
    setHoveredVideo("");
    setCurrentPreview({}); // Resetea el preview
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (hoveredVideo) {
      interval = setInterval(() => {
        const video = relatedVideos.find((v) => v.id_video.S === hoveredVideo);
        const previewImages = video?.video_thumsnail.S.split(",").map(
          (url: any) => url.trim()
        );
        if (previewImages && previewImages.length > 0) {
          setCurrentPreview((prev) => ({
            ...prev,
            [hoveredVideo]: (prev[hoveredVideo] + 1) % previewImages.length,
          }));
        }
      }, 1000); // Cambia la imagen cada 1 segundo

      return () => clearInterval(interval);
    }
  }, [hoveredVideo, relatedVideos]);
  const handleRelatedVideoClick = (videoId: string, video: string) => {
    router.push({
      pathname: `/video/${videoId}`,
      query: { id_video: videoId, vid: video },
    });
  };

  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = relatedVideos.slice(
    indexOfFirstVideo,
    indexOfLastVideo
  );
  const handlePageChange = (event: any, value: number) => {
    setCurrentPage(value);
  };

  useEffect(() => {
    function TransformComments() {
      let commentsArray: string[] = [];

      try {
        // Intenta convertir `oldComment` en un array de strings
        const parsedComments = JSON.parse(oldComment?.trim() || "[]");

        // Verifica si el resultado es un array
        if (Array.isArray(parsedComments)) {
          commentsArray = parsedComments.filter((comment) => comment !== null);
        } else {
          console.error("El comentario no es un array válido:", parsedComments);
        }
      } catch (error) {
        console.error("Error al parsear oldComment:", error);
        commentsArray = []; // Si hay error, inicializa como un array vacío
      }

      setComments(commentsArray);
    }

    TransformComments();
  }, [oldComment]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  
  return (
    <div>
      <NavBar sx={{ backgroundColor: "#e91ec4" }} />
      <NavMenu sx={{ backgroundColor: "#e91ec4" }} />
      <div style={styles.videoLayout}>
        <div style={styles.videoContainer}>
          <VideoPlayer videoEmbedUrl={videoData?.video_embed_url?.S} poster={videoData?.video_thumsnail?.S} title={videoData?.video_name?.S}/>

          <div style={styles.likeDislikeContainer}>
            <IconButton
              onClick={handleLike}
              color={liked ? "secondary" : "default"}
            >
              {liked ? (
                <FavoriteIcon style={{ color: "rgb(233, 30, 196)" }} />
              ) : (
                <FavoriteBorderIcon />
              )}
            </IconButton>
            <span>{videoData?.video_likes?.S}</span>
            <IconButton
              onClick={handleDislike}
              color={disliked ? "error" : "default"}
            >
              <ThumbDownIcon style={{ color: "rgb(233, 30, 196)" }} />
            </IconButton>
            <span>{dislikes} </span>

            <span
              style={{
                marginLeft: "50px",
                width: "100%",
                display: "flex",
                flexWrap: "wrap",
                gap: "3px",
              }}
            >
              {videoTagsArray?.map((tag: any, index: any) => (
                <span
                  key={index}
                  style={{ display: "flex", alignItems: "center", gap: "3px" }}
                >
                  <LoyaltyIcon
                    style={{ color: "rgb(233, 30, 196)" }}
                    fontSize="small"
                  />
                  {tag}
                </span>
              ))}
            </span>

            <Button
              variant="contained"
              sx={{
                marginLeft: "10%",
                backgroundColor: "rgb(233, 30, 196)",
                color: "white",
                width: "490px",
                "&:hover": { backgroundColor: "#C2185B" },
              }}
              onClick={downloadFile}
            >
              DOWNLOAD VIDEO
            </Button>
          </div>
          <div style={styles.likeDislikeContainer}>{videoDescription}</div>
          <ThumbnailSlider thumbnails={videoData?.video_thumsnail?.S || ""} />
          <Paper elevation={3} style={styles.commentBox}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                marginTop: "10px",
                marginBottom: "15px",
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                sx={{ background: "white", borderRadius: "5px" }}
              />
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                label="e-mail"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                sx={{ background: "white", borderRadius: "5px" }}
              />
              <Typography variant="body2" color="textSecondary">
              or comment please fill the form
              </Typography>
            </div>
            <Typography variant="h6" gutterBottom>
              Comments
            </Typography>
            <List>
              {comments.flat().length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No hay comentarios aún. Sé el primero en comentar.
                </Typography>
              ) : (
                comments.flat().map((comment, index) => (
                  <ListItem key={index} divider>
                    <ListItemText primary={comment} />
                  </ListItem>
                ))
              )}
            </List>

            <div style={{ display: "flex", marginTop: "10px" }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                sx={{ background: "white", borderRadius: "5px" }}
              />
              <Button
                variant="contained"
                sx={{
                  marginLeft: "10px",
                  backgroundColor: "rgb(233, 30, 196)",
                  color: "white",
                  "&:hover": { backgroundColor: "#C2185B" },
                }}
                disabled={!formData.name || !formData.email}
                onClick={() => handleAddComment()}
              >
                Post
              </Button>
            </div>
          </Paper>
        </div>

        <div style={styles.recommendedVideos}>
          <Typography
            variant="h6"
            style={{
              color: "white",
              backgroundColor: "rgb(233, 30, 196)",
              width: "100%",
              borderRadius: "5px",
              display: "flex",
              justifyContent: "center", // Centra el texto horizontalmente
              alignItems: "center", // Centra el texto verticalmente
              padding: "10px 0", // Añadimos padding para darle más espacio alrededor
            }}
            gutterBottom
          >
            Related videos
          </Typography>
          <div style={styles.videoList}>
            {currentVideos.map(
              (
                video,
                index // 👈 Usamos currentVideos en lugar de relatedVideos
              ) => (
                <div
                  key={index}
                  onMouseEnter={() =>
                    handleMouseEnter(video.id_video.S, video.video_thumsnail.S)
                  }
                  onMouseLeave={handleMouseLeave}
                  onClick={() =>
                    handleRelatedVideoClick(
                      video.id_video.S,
                      video.video_embed_url.S
                    )
                  }
                  style={{ position: "relative", cursor: "pointer" }}
                >
                  <div style={styles.thumbnailContainer}>
                    <img
                      src={
                        hoveredVideo === video.id_video.S
                          ? video.video_thumsnail.S.split(",")[
                              currentPreview[hoveredVideo] || 0
                            ]
                          : video?.oficial_thumb?.S
                      }
                      alt="thumbnail"
                      style={styles.thumbnail}
                    />
                    <div style={styles.videoInfo}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div
                          style={{
                            ...styles.overlay,
                            opacity: hoveredVideo === video.id_video.S ? 1 : 0,
                          }}
                        >
                          <span>⏳ {video.video_time.S}</span> |
                          <span>❤️ {video.video_likes.S}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={styles.titleOverlay}>
                    <Typography style={{ color: "white", fontSize: "13px" }}>
                      {video.video_name.S}
                    </Typography>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
      <Pagination
        count={Math.ceil(relatedVideos.length / videosPerPage)} // Total de páginas
        page={currentPage} // Página actual
        onChange={handlePageChange} // Controlador del cambio de página
        color="secondary"
        sx={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "center",
          "& .MuiPaginationItem-icon": {
            color: "white", // Cambia el color de las flechas a blanco
          },
          "& .MuiPaginationItem-text": {
            color: "rgba(255, 255, 255, 0.6)", // Cambia el color de los números a un blanco más suave
          },
          "& .MuiPaginationItem-root.Mui-selected": {
            color: "white", // Asegura que la página seleccionada se vea en blanco
          },
        }}
      />

      <FooterComponent />
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  tagIcon: {
    marginRight: "1px",
    color: "#E91E63", // Color del icono
  },
  videoLayout: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    padding: "20px 30px",
    justifyContent: "center",
  },
  videoContainer: {
    maxWidth: "800px",
    flex: "1 1 800px",
  },
  videoFrame: {
    width: "100%",
    height: "480px",
    borderRadius: "15px",
  },
  likeDislikeContainer: {
    marginTop: "5px",
    fontFamily: "revert",
    display: "flex",
    alignItems: "center",

    gap: "1px",
    background: "rgba(255, 255, 255, 0.8)",
    padding: "3px",
    borderRadius: "10px",
    width: "100%",
  },
  commentBox: {
    marginTop: "10px",
    padding: "15px",
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(10px)",
  },
  recommendedVideos: {
    flex: "1 1 100px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  videoList: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px",
    width: "100%",
  },
  thumbnail: {
    width: "98%",
    height: "80%",
    borderRadius: "5px",
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
  },
  titleOverlay: {
    position: "absolute",
    top: "85%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: "5px",
    borderRadius: "5px",
    width: "100%",
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
  thumbnailContainer: {
    position: "relative",
  },
};

export default VideoPage;

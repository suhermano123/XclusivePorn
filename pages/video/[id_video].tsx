import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NavBar from '@/components/NavBar/NavBar';
import NavMenu from '@/components/NavMenu/NavMenu';
import useDynamoDB from '@/hooks/UseDynamoDB';
import { List, ListItem, ListItemText, TextField, Button, Paper, Typography, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { useDispatch, useSelector } from 'react-redux';
import { VideosState } from '@/redux/videosSlice';
import FooterComponent from '@/components/footer/Footer';
import TagIcon from '@mui/icons-material/Tag'; // Icono de tag
import { CSSProperties } from 'react';

const VideoPage: React.FC = () => {
  const { getItem } = useDynamoDB('list_videos');
  const router = useRouter();
  const [hoveredVideo, setHoveredVideo] = useState<string>('');
  const { vid, reference, id_video } = router.query;
  const videoUrl = vid?.toString();
  const videoTags = reference?.toString();
  const idVideo = id_video?.toString();
  const [comments, setComments] = useState<string[]>([]);
  const [currentPreview, setCurrentPreview] = useState<{ [key: string]: number }>({}); // Preview dinámico
  const [newComment, setNewComment] = useState('');
  const [videoData, setVideoData] = useState<any>(null);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [likes, setLikes] = useState(videoData?.video_likes.S);
  const [dislikes, setDislikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const dispatch = useDispatch();
  const videos = useSelector((state: { videos: VideosState }) => state.videos.videos);

  useEffect(() => {
    if (idVideo) {
      // Verificamos si ya hay videos en Redux
      const videoInRedux = videos.find((video) => video.id_video.S === idVideo);

      if (videoInRedux) {
        // Si el video está en Redux, lo utilizamos directamente
        setVideoData(videoInRedux);
        console.log('Video encontrado en Redux:', videoInRedux);

        // 🔍 Buscar otros videos con la misma etiqueta
        getRelatedVideos(videoInRedux.video_tags.S);
      } else {
        // Si no se encuentra el video en Redux, llamamos al servicio getItem de DynamoDB
        getItem(idVideo as string).then((data: any) => {
          if (data) {
            setVideoData(data);
            console.log('Video obtenido de DynamoDB:', data);

            // 🔍 Buscar otros videos con la misma etiqueta
            getRelatedVideos(data.video_tags.S);
          }
        });
      }
    }
  }, [idVideo, videos]); // Dependencias: se ejecuta cuando idVideo o videos cambian

  // Función para obtener videos relacionados
  const getRelatedVideos = (tags: string) => {
    const tagsArray = tags.split(',').map(tag => tag.trim());
    const related = videos.filter((video) => {
      const videoTagsArray = video.video_tags.S.split(',').map(tag => tag.trim());
      return videoTagsArray.some((tag) => tagsArray.includes(tag));
    });
    setRelatedVideos(related); // Establecer los videos recomendados
  };
  const videoDescription = videos[0]?.video_description?.S;
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

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, newComment]);
      setNewComment('');
    }
  };

  const handleDownloadVideo = () => {
    window.open(videoData.video_download.S, "_blank");
  };

  const handleMouseEnter = (videoId: string, thumbnails: string) => {
    setHoveredVideo(videoId);
    const thumbArray = thumbnails.split(',').map((thumb: string) => thumb.trim());
    setCurrentPreview({ [videoId]: 0 }); // Inicializa el preview con la primera imagen
  };

  const handleMouseLeave = () => {
    setHoveredVideo('');
    setCurrentPreview({}); // Resetea el preview
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (hoveredVideo) {
      interval = setInterval(() => {
        const video = relatedVideos.find((v) => v.id_video.S === hoveredVideo);
        const previewImages = video?.video_thumsnail.S.split(',').map((url: any) => url.trim());
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
      query: { id_video: videoId, vid: video},
    });
  };
  return (
    <div>
      <NavBar sx={{ backgroundColor: "#E91E63" }} />
      <NavMenu sx={{ backgroundColor: "#E91E63" }} />
      <div style={styles.videoLayout}>
        <div style={styles.videoContainer}>
          <iframe
            width="100%"
            height="480"
            src={videoUrl}
            scrolling="no"
            frameBorder="0"
            allowFullScreen
            style={styles.videoFrame}
          ></iframe>

          <div style={styles.likeDislikeContainer}>
            <IconButton onClick={handleLike} color={liked ? "secondary" : "default"}>
              {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            <span>{likes}</span>
            <IconButton onClick={handleDislike} color={disliked ? "error" : "default"}>
              <ThumbDownIcon />
            </IconButton>
            <span>{dislikes} </span><TagIcon style={styles.tagIcon} /><span style={{ marginLeft: '2px', width: '100%' }}>{videoTags}</span>
            <Button 
              variant="contained"
              sx={{
                marginLeft: '10%',
                backgroundColor: '#E91E63',
                color: 'white',
                width: '490px',
                '&:hover': { backgroundColor: '#C2185B' }
              }}
              onClick={handleDownloadVideo}
            >
              DOWNLOAD VIDEO
            </Button>
          </div>
          <div style={styles.likeDislikeContainer} >
              {videoDescription}
          </div>

          <Paper elevation={3} style={styles.commentBox}>
            <Typography variant="h6" gutterBottom>Comentarios</Typography>
            <List>
              {comments.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No hay comentarios aún. Sé el primero en comentar.
                </Typography>
              ) : (
                comments.map((comment, index) => (
                  <ListItem key={index} divider>
                    <ListItemText primary={comment} />
                  </ListItem>
                ))
              )}
            </List>

            <div style={{ display: 'flex', marginTop: '10px' }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Escribe un comentario..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                sx={{ background: 'white', borderRadius: '5px' }}
              />
              <Button 
                variant="contained"
                sx={{ 
                  marginLeft: '10px', 
                  backgroundColor: '#E91E63', 
                  color: 'white', 
                  '&:hover': { backgroundColor: '#C2185B' }
                }}
                onClick={handleAddComment}
              >
                Enviar
              </Button>
            </div>
          </Paper>
        </div>

        <div style={styles.recommendedVideos}>
          <Typography 
            variant="h6" 
            style={{ 
              color: 'white', 
              backgroundColor: '#C2185B', 
              width: '100%', 
              borderRadius: '5px', 
              display: 'flex',
              justifyContent: 'center', // Centra el texto horizontalmente
              alignItems: 'center', // Centra el texto verticalmente
              padding: '10px 0' // Añadimos padding para darle más espacio alrededor
            }} 
            gutterBottom
          >
            Related videos
          </Typography>
          <div style={styles.videoList}>
            {relatedVideos.map((video, index) => (
              <div
                key={index}
                onMouseEnter={() => handleMouseEnter(video.id_video.S, video.video_thumsnail.S)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleRelatedVideoClick(video.id_video.S, video.video_embed_url.S)} // Recursividad en el click
                style={{ position: 'relative', cursor: 'pointer' }} // Añadido cursor pointer
              >
                <div style={styles.thumbnailContainer}>
                  <img 
                    src={hoveredVideo === video.id_video.S ? video.video_thumsnail.S.split(',')[currentPreview[hoveredVideo] || 0] : video?.oficial_thumb?.S} 
                    alt="thumbnail"
                    style={styles.thumbnail}
                  />
                  <div style={styles.videoInfo}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div
                        style={{
                          ...styles.overlay,
                          opacity: hoveredVideo === video.id_video.S ? 1 : 0, // Desaparece cuando no hay hover
                        }}
                      >
                        <span>⏳ {video.video_time.S}</span> |
                        <span>❤️ {video.video_likes.S}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={styles.titleOverlay}>
                  <Typography style={{ color: 'white', fontSize: '13px' }}>
                    {video.video_name.S}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <FooterComponent />
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  tagIcon: {
    marginRight: '1px',
    color: '#E91E63', // Color del icono
  },
  videoLayout: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    padding: '20px 30px',
    justifyContent: 'center'
  },
  videoContainer: {
    maxWidth: '800px',
    flex: '1 1 800px'
  },
  videoFrame: {
    width: '100%',
    height: '480px',
    borderRadius: '15px'
  },
  likeDislikeContainer: {
    marginTop: '5px',
    fontFamily: 'revert',
    display: 'flex',
    alignItems: 'center',
    gap: '1px',
    background: 'rgba(255, 255, 255, 0.8)',
    padding: '3px',
    borderRadius: '10px',
    width: '100%'
  },
  commentBox: {
    marginTop: '10px',
    padding: '15px',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)'
  },
  recommendedVideos: {
    flex: '1 1 100px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  videoList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    width: '100%'
  },
  thumbnail: {
    width: '98%',
    height: '80%',
    borderRadius: '5px'
  },
  videoInfo: {
    position: 'absolute',
    bottom: '2px',
    left: '3px',
    right: '8px',
    color: 'white',
    padding: '1px 1px',
    fontSize: '10px',
    borderRadius: '5px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleOverlay: {
    position: 'absolute',
    top: '85%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: '5px',
    borderRadius: '5px',
    width: '100%'
  },
  overlay: {
    background: 'rgba(115, 38, 122, 0.6)',
    padding: '5px 10px',
    fontSize: '12px',
    borderRadius: '5px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 'auto',
  },
  thumbnailContainer: {
    position: 'relative',
  },
};

export default VideoPage;
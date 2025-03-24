import React, { useEffect, useRef, useState } from "react";
import useWasabiObjectUrl from "@/hooks/UseWasabiGetObject";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "./VideoPlayer.css";

const VideoPlayer = ({
  videoEmbedUrl,
  poster,
  title,
  date,
}: {
  videoEmbedUrl: string;
  poster: string;
  title: string;
  date: string;
}) => {
  const { url, loading, error } = useWasabiObjectUrl(videoEmbedUrl);
  const videoUrl = url?.toString();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any | null>(null);
  const [showAdLayer, setShowAdLayer] = useState(true);
  const firstThumbnail = poster?.split(",")[0].trim();

  const options = {
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    poster: firstThumbnail,
    sources: videoUrl ? [{ src: videoUrl, type: "video/mp4" }] : [],
  };

  useEffect(() => {
    if (videoRef.current && !playerRef.current) {
      playerRef.current = videojs(videoRef.current, options);
    } else if (playerRef.current) {
      playerRef.current.src(options.sources);
    }
  }, [videoUrl]);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  // Función para abrir el Pop-Under en una nueva ventana y ocultar la capa
  const handleAdClick = () => {
    setShowAdLayer(false);
    const adUrl = "http://www.juicyads.rocks";
    window.open(adUrl, "_blank", "width=800,height=600");
  };

  if (loading) return <div>Cargando video...</div>;
  if (error) return <div>Error al cargar el video: {error}</div>;
  if (!videoUrl) return <div>La URL del video no está disponible.</div>;

  return (
    <div style={{ position: "relative" }}>
      {/* Título del video */}
      <h2
        style={{
          marginBottom: "1px",
          fontSize: "16px",
          fontWeight: "bold",
          color: "#fff",
          background: "rgba(255, 0, 212, 0.541)",
          padding: "5px 16px",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "5px",
        }}
      >
        <span style={{width: '90%', fontSize: '15px', fontFamily: "-moz-initial"}}>{title}</span>
        <span style={{fontSize: '15px', fontFamily: "-moz-initial"}}>{date}</span>
      </h2>

      <div data-vjs-player style={{ width: "100%" }}>
        <video ref={videoRef} className="video-js vjs-fluid custom-video-js" />
      </div>

      {/* Capa invisible que activa el Pop-Under cuando se hace clic en el video */}
      {showAdLayer && (
        <div
          onClick={handleAdClick}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "transparent",
            cursor: "pointer",
            zIndex: 20,
          }}
        />
      )}
    </div>
  );
};

export default VideoPlayer;

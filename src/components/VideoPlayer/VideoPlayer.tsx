import React, { useEffect, useRef, useState } from "react";
import useWasabiObjectUrl from "@/hooks/UseWasabiGetObject";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "./VideoPlayer.css";


declare global {
  interface Window {
    adsbyjuicy?: any;
  }
}

// Componente para el anuncio de JuicyAds
const JuicyAds = ({ showAd }: { showAd: boolean }) => {
  console.log('add', showAd);
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://poweredby.jads.co/js/jads.js";
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    document.body.appendChild(script);

    script.onload = () => {
      if (window.adsbyjuicy) {
        window.adsbyjuicy.push({ adzone: 1083113 });
      }
    };

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [showAd]);

  return (
    <div>
      <ins id="1083113" data-width="308" data-height="286"></ins>
    </div>
  );
};

const VideoPlayer = ({ videoEmbedUrl, poster }: { videoEmbedUrl: string, poster: string }) => {
  // Obtener la URL del video desde Wasabi
  const { url, loading, error } = useWasabiObjectUrl(videoEmbedUrl);
  console.log("Reproduciendo:", url);

  const videoUrl = url?.toString();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any | null>(null);
  // Estado para controlar la visibilidad del overlay del anuncio
  const [showAd, setShowAd] = useState(true);

  // Configuración del reproductor
  const options = {
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    poster: poster,
    sources: videoUrl ? [{ src: videoUrl, type: "video/mp4" }] : [],
  };

  useEffect(() => {
    if (videoRef.current && !playerRef.current) {
      playerRef.current = videojs(videoRef.current, options);
    } else if (playerRef.current) {
      playerRef.current.src(options.sources);
    }
  }, [videoUrl]);

  // Limpieza del reproductor al desmontar el componente
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  if (loading) return <div>Cargando video...</div>;
  if (error) return <div>Error al cargar el video: {error}</div>;
  if (!videoUrl) return <div>La URL del video no está disponible.</div>;

  return (
    <div style={{ position: "relative" }}>
      <div data-vjs-player>
        <video ref={videoRef} className="video-js custom-video-js" />
      </div>
      {showAd && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 10,
            background: "rgba(226, 12, 173, 0.1)",
            display: "flex",
            flexDirection: "column",
            transition: "opacity 0.5s",
          }}
        >
          {/* Contenedor del anuncio centrado */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <JuicyAds showAd={showAd}/>
          </div>
          {/* Botón Close en la parte inferior */}
          <div
            style={{
              padding: "10px",
              textAlign: "center",
              background: "rgba(0,0,0,0.3)",
            }}
          >
            <button
              onClick={() => {
                setShowAd(false);
              }}
              style={{
                background: "#fff",
                border: "none",
                padding: "8px 16px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;

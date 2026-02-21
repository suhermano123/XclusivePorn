import React, { useState, useEffect, useRef } from "react";
import useWasabiObjectUrl from "@/hooks/UseWasabiGetObject";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "./VideoPlayer.css";

// Declare videojs on window for potential global access if needed by plugins
if (typeof window !== "undefined") {
  (window as any).videojs = videojs;
}

const VideoPlayer = ({
  videoEmbedUrl,
  poster,
  title,
  date,
}: {
  videoEmbedUrl: string;
  poster: string;
  title?: string;
  date?: string;
}) => {
  const isFullUrl = videoEmbedUrl?.startsWith('http') || videoEmbedUrl?.startsWith('//') || videoEmbedUrl?.startsWith('/');
  const { url, loading, error } = useWasabiObjectUrl(isFullUrl ? '' : videoEmbedUrl);

  let videoUrl = isFullUrl ? videoEmbedUrl : url?.toString();

  // Bypass CORS by using the local proxy defined in next.config.ts
  if (videoUrl?.includes('pub-8a7870d75cc841b788eafa8b0f0fbf0c.r2.dev')) {
    videoUrl = videoUrl.replace('https://pub-8a7870d75cc841b788eafa8b0f0fbf0c.r2.dev', '/media-proxy');
  }

  const [showAdLayer, setShowAdLayer] = useState(true);
  let firstThumbnail = poster?.split(",")[0].trim();

  // Bypass CORS for the poster as well
  if (firstThumbnail?.includes('xmoviescdn.online')) {
    firstThumbnail = firstThumbnail.replace('https://xmoviescdn.online', '/image-proxy');
  }

  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  // Initialize and update video.js
  useEffect(() => {
    if (!videoRef.current || !videoUrl || loading || error) return;

    const isHls = videoUrl.toLowerCase().includes(".m3u8") || videoUrl.includes("type=stream");

    // If player already exists, update the source
    if (playerRef.current) {
      const player = playerRef.current;
      player.src({
        src: videoUrl,
        type: isHls ? "application/x-mpegURL" : "video/mp4",
      });
      player.poster(firstThumbnail);
      return;
    }

    // Create video element for first-time initialization
    const videoElement = document.createElement("video-js");
    videoElement.classList.add("vjs-big-play-centered", "custom-video-js");
    videoRef.current.appendChild(videoElement);

    const player = (playerRef.current = videojs(videoElement, {
      autoplay: true,
      controls: true,
      responsive: true,
      fluid: true,
      poster: firstThumbnail,
      crossorigin: "anonymous", // Helpful for CORS if server supports it
      html5: {
        vhs: {
          overrideNative: true // Use VHS even if native HLS is present for consistency
        }
      },
      sources: [
        {
          src: videoUrl,
          type: isHls ? "application/x-mpegURL" : "video/mp4",
        },
      ],
      userActions: {
        hotkeys: true
      },
      controlBar: {
        children: [
          'playToggle',
          'volumePanel',
          'currentTimeDisplay',
          'timeDivider',
          'durationDisplay',
          'progressControl',
          'liveDisplay',
          'remainingTimeDisplay',
          'customControlSpacer',
          'playbackRateMenuButton',
          'chaptersButton',
          'descriptionsButton',
          'subsCapsButton',
          'audioTrackButton',
          'fullscreenToggle',
        ],
      },
    }, () => {
      console.log("Player ready");
    }));

    return () => {
      // We only dispose on unmount, not on videoUrl change
      // Handled by another effect or below
    };
  }, [videoUrl, loading, error, firstThumbnail]);

  // JuicyAds Float Ad
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).juicy_adzone = '1111582';

      if (!document.querySelector(`script[src="https://poweredby.jads.co/js/jfc.js"]`)) {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "https://poweredby.jads.co/js/jfc.js";
        script.async = true;
        script.charset = "utf-8";
        document.body.appendChild(script);
      }
    }
  }, []);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
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

  if (loading) return (
    <div style={{ width: '100%', aspectRatio: '16/9', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#111', borderRadius: '16px', color: '#fff' }}>
      <p>Cargando video...</p>
    </div>
  );

  if (error) return (
    <div style={{ width: '100%', aspectRatio: '16/9', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#111', borderRadius: '16px', color: '#fff' }}>
      <p>Error: {error}</p>
    </div>
  );

  if (!videoUrl) return <div style={{ color: '#fff', padding: '20px' }}>La URL del video no está disponible.</div>;

  return (
    <div style={{
      position: "relative",
      width: "100%",
      borderRadius: "16px",
      overflow: "hidden",
      backgroundColor: "#000",
      boxShadow: "0 15px 35px rgba(0,0,0,0.9)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    }}>
      <div data-vjs-player ref={videoRef} />

      {/* Capa invisible para anuncios (opcional si interfiere con controles) */}
      {showAdLayer && (
        <div
          onClick={handleAdClick}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "80%", // Dejar espacio para la barra de controles inferior
            background: "transparent",
            cursor: "pointer",
            zIndex: 5,
          }}
        />
      )}
    </div>
  );
};

export default VideoPlayer;

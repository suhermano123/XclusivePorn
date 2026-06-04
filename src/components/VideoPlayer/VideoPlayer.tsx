import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import useWasabiObjectUrl from "@/hooks/UseWasabiGetObject";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "./VideoPlayer.css";
import "videojs-contrib-ads";
import "videojs-ima";

// Declare videojs on window for potential global access if needed by plugins
if (typeof window !== "undefined") {
  (window as any).videojs = videojs;
}

export interface VideoPlayerRef {
  seekTo: (seconds: number) => void;
}

const VideoPlayer = forwardRef<VideoPlayerRef, {
  videoEmbedUrl: string;
  poster: string;
  title?: string;
  date?: string;
  muted?: boolean;
  autoplay?: boolean;
  onPlay?: () => void;
  autoLandscapeOnMobile?: boolean;
}>(({
  videoEmbedUrl,
  poster,
  title,
  date,
  muted = false,
  autoplay = false,
  onPlay,
  autoLandscapeOnMobile = true,
}, ref) => {
  const isFullUrl = videoEmbedUrl?.startsWith('http') || videoEmbedUrl?.startsWith('//') || videoEmbedUrl?.startsWith('/');
  const { url, loading, error } = useWasabiObjectUrl(isFullUrl ? '' : videoEmbedUrl);

  let videoUrl = isFullUrl ? videoEmbedUrl : url?.toString();

  // Bypass CORS by using the local proxy defined in next.config.ts
  if (videoUrl?.includes('pub-8a7870d75cc841b788eafa8b0f0fbf0c.r2.dev')) {
    videoUrl = videoUrl.replace('https://pub-8a7870d75cc841b788eafa8b0f0fbf0c.r2.dev', '/media-proxy');
  }

  const [isMobile, setIsMobile] = useState(false);
  const isMobileRef = useRef(false);
  const landscapeRequestedRef = useRef(false);
  const onPlayRef = useRef(onPlay);

  useEffect(() => {
    onPlayRef.current = onPlay;
  }, [onPlay]);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches;
      isMobileRef.current = isMobileDevice;
      setIsMobile(isMobileDevice);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [showAdLayer, setShowAdLayer] = useState(true);

  // Automatically hide ad layer on mobile
  useEffect(() => {
    if (isMobile) {
      setShowAdLayer(false);
    }
  }, [isMobile]);

  let firstThumbnail = poster?.split(",")[0].trim();

  // Bypass CORS for the poster — route through Next.js proxy rewrites
  if (firstThumbnail?.includes('pub-c9afcfde57fd4b9fbc70f2802ea3ed05.r2.dev')) {
    firstThumbnail = firstThumbnail.replace('https://pub-c9afcfde57fd4b9fbc70f2802ea3ed05.r2.dev', '/capturas-proxy');
  } else if (firstThumbnail?.includes('pub-8a7870d75cc841b788eafa8b0f0fbf0c.r2.dev')) {
    firstThumbnail = firstThumbnail.replace('https://pub-8a7870d75cc841b788eafa8b0f0fbf0c.r2.dev', '/media-proxy');
  } else if (firstThumbnail?.includes('xmoviescdn.online')) {
    firstThumbnail = firstThumbnail.replace('https://xmoviescdn.online', '/image-proxy');
  }

  // Si solo es un nombre de archivo (sin http), asumir que es del bucket de capturas
  if (firstThumbnail && !firstThumbnail.startsWith('http') && !firstThumbnail.startsWith('/')) {
    firstThumbnail = `/capturas-proxy/${firstThumbnail}`;
  }

  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  const lockMobileLandscape = async () => {
    if (!autoLandscapeOnMobile || !isMobileRef.current || landscapeRequestedRef.current) return;

    landscapeRequestedRef.current = true;

    try {
      const orientation = (window.screen as any).orientation;
      if (orientation?.lock) {
        await orientation.lock("landscape");
      }
    } catch (error) {
      console.warn("Mobile landscape mode is not available in this browser:", error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const playerElement = playerRef.current?.el?.() as HTMLElement | undefined;
      const isPlayerFullscreen = !!document.fullscreenElement && !!playerElement?.contains(document.fullscreenElement);

      if (isPlayerFullscreen) {
        lockMobileLandscape();
      } else {
        landscapeRequestedRef.current = false;
        (window.screen as any).orientation?.unlock?.();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Expose seekTo method to parent
  useImperativeHandle(ref, () => ({
    seekTo: (seconds: number) => {
      if (playerRef.current) {
        playerRef.current.currentTime(seconds);
        playerRef.current.play();
        // Hide ad layer if seeking to a specific part
        setShowAdLayer(false);
      }
    }
  }));

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
      autoplay: autoplay,
      muted: muted,
      controls: true,
      responsive: true,
      fluid: true,
      poster: firstThumbnail,

      playbackRates: [0.5, 1, 1.25, 1.5, 2],

      crossorigin: "anonymous",

      html5: {
        vhs: {
          overrideNative: true
        }
      },

      sources: [
        {
          src: videoUrl,
          type: isHls ? "application/x-mpegURL" : "video/mp4",
        },
      ],

      userActions: {
        hotkeys: true,
        doubleClick: true
      },

      controlBar: {
        volumePanel: {
          inline: false
        },

        children: [
          'playToggle',
          'volumePanel',
          'currentTimeDisplay',
          'timeDivider',
          'durationDisplay',
          'progressControl',
          'remainingTimeDisplay',
          'customControlSpacer',

          // Velocidad
          'playbackRateMenuButton',

          // Picture in Picture
          'pictureInPictureToggle',

          // Subtítulos
          'subsCapsButton',

          // Fullscreen
          'fullscreenToggle',
        ],
      },

    }, () => {
      console.log("Player ready");

      // SOLO si google.ima existe
      if ((window as any).google?.ima) {

        (player as any).ima({
          adTagUrl: "https://s.magsrv.com/v1/vast.php?idz=5942506",
        });

        player.one("play", () => {
          (player as any).ima.initializeAdDisplayContainer();
          (player as any).ima.requestAds();
        });

        player.on("ads-ad-started", () => {
          console.log("Ad started");
        });

        player.on("ads-ad-ended", () => {
          console.log("Ad ended");
        });

        player.on("adserror", (err: any) => {
          console.error("Ad error:", err);
        });
      }

    }));

    const handlePlayerFullscreenChange = () => {
      if (player.isFullscreen()) {
        lockMobileLandscape();
      }
    };

    const techElement = player.tech()?.el?.() as HTMLVideoElement | undefined;
    const handleNativeFullscreenStart = () => lockMobileLandscape();
    const handleNativeFullscreenEnd = () => {
      landscapeRequestedRef.current = false;
      (window.screen as any).orientation?.unlock?.();
    };

    player.on("fullscreenchange", handlePlayerFullscreenChange);
    techElement?.addEventListener("webkitbeginfullscreen", handleNativeFullscreenStart);
    techElement?.addEventListener("webkitendfullscreen", handleNativeFullscreenEnd);

    player.on("play", () => {
      onPlayRef.current?.();
      // optionally only trigger once: player.off("play")
    });

    return () => {
      player.off("fullscreenchange", handlePlayerFullscreenChange);
      techElement?.removeEventListener("webkitbeginfullscreen", handleNativeFullscreenStart);
      techElement?.removeEventListener("webkitendfullscreen", handleNativeFullscreenEnd);
    };
  }, [videoUrl, loading, error, firstThumbnail, autoplay, muted]);

  // JuicyAds Float Ad - Only on Desktop
  useEffect(() => {
    if (typeof window !== "undefined" && !isMobile) {
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
  }, [isMobile]);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);


  if (loading) return (
    <div style={{ width: '100%', aspectRatio: '16/9', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#111', borderRadius: '16px', color: '#fff' }}>
      <p>Loading video...</p>
    </div>
  );

  if (error) return (
    <div style={{ width: '100%', aspectRatio: '16/9', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#111', borderRadius: '16px', color: '#fff' }}>
      <p>Error: {error}</p>
    </div>
  );

  if (!videoUrl) return <div style={{ color: '#fff', padding: '20px' }}>Video URL is not available.</div>;
  console.log("google", (window as any).google);
console.log("ima", (window as any).google?.ima);

  return (
    <div className="video-player-shell" style={{
      position: "relative",
      width: "100%",
      borderRadius: "9px",
      overflow: "hidden",
      backgroundColor: "#000",
      boxShadow: "0 15px 35px rgba(0,0,0,0.9)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    }}>
      <div data-vjs-player ref={videoRef} />


    </div>
  );
});

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;

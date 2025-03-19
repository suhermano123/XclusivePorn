import React, { useEffect, useRef } from "react";
import { CSSProperties } from "react";
import DownloadIcon from "@mui/icons-material/Download";

const ThumbnailSlider = ({ thumbnails }: { thumbnails: string }) => {
  const images = thumbnails.split(",").map((url) => url.trim());
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [selectedMedia, setSelectedMedia] = React.useState<
    { url: string; width: number; height: number } | null
  >(null);
  const [modalBlobUrl, setModalBlobUrl] = React.useState<string | null>(null);
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let scrollAmount = 0;
    let isPaused = false;

    const scrollThumbnails = () => {
      if (isPaused) return;

      scrollAmount += 1; // Velocidad del scroll
      if (scrollAmount >= slider.scrollWidth / 2) {
        scrollAmount = 0;
        slider.scrollLeft = 0;
      } else {
        slider.scrollLeft += 1;
      }
      requestAnimationFrame(scrollThumbnails);
    };

    const startScrolling = () => {
      isPaused = false;
      scrollThumbnails();
    };

    const stopScrolling = () => {
      isPaused = true;
    };

    slider.addEventListener("mouseenter", stopScrolling);
    slider.addEventListener("mouseleave", startScrolling);

    startScrolling();

    return () => {
      slider.removeEventListener("mouseenter", stopScrolling);
      slider.removeEventListener("mouseleave", startScrolling);
    };
  }, []);

  const handleDownload = async () => {
    if (selectedMedia) {
      try {
        // Se simula una petición sin referer para que el servidor la acepte
        const response = await fetch(selectedMedia.url, {
          mode: "cors",
          referrer: "",
          referrerPolicy: "no-referrer",
        });
        if (!response.ok) throw new Error("Error en la respuesta de red");
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download =  "imagen_downloaded.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error("Error al descargar el medio:", error);
      }
    }
  };
  // Al cambiar selectedMedia (y si es imagen) se hace un GET a la URL original para obtener el blob
  React.useEffect(() => {
    let isMounted = true;
    if (selectedMedia) {
      setModalBlobUrl(null);
      fetch(selectedMedia.url, {
        mode: "cors",
        referrer: "",
        referrerPolicy: "no-referrer",
      })
        .then((response) => {
          if (!response.ok) throw new Error("Error en la respuesta de red");
          return response.blob();
        })
        .then((blob) => {
          if (isMounted) {
            const blobUrl = window.URL.createObjectURL(blob);
            setModalBlobUrl(blobUrl);
          }
        })
        .catch((error) => {
          console.error("Error al obtener el blob de la imagen:", error);
          setModalBlobUrl(null);
        });
    } else {
      setModalBlobUrl(null);
    }
    return () => {
      isMounted = false;
      if (modalBlobUrl) {
        window.URL.revokeObjectURL(modalBlobUrl);
      }
    };
  }, [selectedMedia]);
  const styles: { [key: string]: CSSProperties } = {
    container: {
      display: "flex",
      overflow: "hidden",
      width: "100%",
      padding: "10px 0",
      position: "relative",
      whiteSpace: "nowrap" as const,
    },
    slider: {
      display: "flex",
      gap: "10px",
      animation: "scroll 02s linear infinite",
      flexWrap: "nowrap" as const,
    },
    image: {
      width: "350px",
      height: "195px",
      objectFit: "cover" as const,
      borderRadius: "5px",
      cursor: "pointer",
      flexShrink: 0,
      transition: "transform 0.2s ease-in-out",
    },
  };

  const modalOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    cursor: "zoom-out",
  };

  const closeButtonStyle: React.CSSProperties = {
    position: "absolute",
    top: "50px",
    right: "300px",
    background: "transparent",
    border: "none",
    color: "#fc03fc",
    fontSize: "4rem",
    cursor: "pointer",
    zIndex: 1100,
  };

  const downloadButtonStyle: React.CSSProperties = {
    position: "absolute",
    top: "50px",
    right: "220px",
    background: "transparent",
    border: "none",
    color: "#fc03fc",
    fontSize: "4rem",
    cursor: "pointer",
    zIndex: 1100,
  };

  return (
    <div style={styles.container} ref={sliderRef}>
      <div style={styles.slider}>
        {images.concat(images).map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Thumbnail ${index}`}
            style={styles.image}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onClick={() => setSelectedMedia({ url: img, width: 800, height: 450 })}
          />
        ))}
      </div>
      {selectedMedia && (
        <div style={modalOverlayStyle} onClick={() => setSelectedMedia(null)}>
          <button
            style={closeButtonStyle}
            onClick={(e) => {
              e.stopPropagation(); // Evita cerrar el modal cuando haces clic en el botón de cerrar
              setSelectedMedia(null);
            }}
          >
            &times;
          </button>
          <button style={downloadButtonStyle} onClick={handleDownload}>
            <DownloadIcon fontSize="inherit" />
          </button>
          <div onClick={(e) => e.stopPropagation()}>
            <img
              src={modalBlobUrl || ''}
              alt="Vista completa"
              style={{
                maxWidth: "100vw",
                maxHeight: "100vh",
                objectFit: "contain",
                borderRadius: "8px",
                transition: "transform 0.3s ease-in-out",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
  
};

export default ThumbnailSlider;

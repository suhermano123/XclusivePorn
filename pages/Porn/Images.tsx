import * as React from "react";
import Image from "next/image";
import useDynamoDB from "@/hooks/UseDynamoDB";
import FooterComponent from "@/components/footer/Footer";
import NavBar from "@/components/NavBar/NavBar";
import NavMenu from "@/components/NavMenu/NavMenu";
import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { dynamoClient } from "@/api/dynamoClient";
import DownloadIcon from "@mui/icons-material/Download";

const IMAGES_PER_PAGE = 50;

export default function ImageLibrary() {
  const { getItemsPaginated } = useDynamoDB("post_images");
  const [images, setImages] = React.useState<any[]>([]);
  const [imageSizes, setImageSizes] = React.useState<{ width: number; height: number }[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [lastKey, setLastKey] = React.useState<any>(null);
  const [currentStartKey, setCurrentStartKey] = React.useState<any>(null);
  const [prevKeys, setPrevKeys] = React.useState<any[]>([]);
  const [totalCount, setTotalCount] = React.useState<number>(0);

  // Estado para la imagen/video seleccionado
  const [selectedMedia, setSelectedMedia] = React.useState<
    { url: string; width: number; height: number } | null
  >(null);
  // Estado para almacenar la URL del blob obtenido vía GET a la imagen
  const [modalBlobUrl, setModalBlobUrl] = React.useState<string | null>(null);

  const isVideoUrl = (url: string) => url.toLowerCase().endsWith(".mp4");

  const loadImages = async (startKey?: any) => {
    try {
      const data = await getItemsPaginated(IMAGES_PER_PAGE, startKey);
      setImages(data?.items || []);
      setLastKey(data?.lastEvaluatedKey);
      setCurrentStartKey(startKey);
    } catch (error) {
      console.error("Error al cargar las imágenes:", error);
    }
  };

  const fetchTotalCount = async () => {
    try {
      const params = { TableName: "post_images", Select: "COUNT" as const };
      const data = await dynamoClient.send(new ScanCommand(params));
      return data.Count || 0;
    } catch (err) {
      console.error("Error al obtener el total de imágenes:", err);
      return 0;
    }
  };

  React.useEffect(() => {
    loadImages();
    fetchTotalCount().then((count) => setTotalCount(count));
  }, []);

  // Medir el tamaño original de cada imagen usando window.Image
  React.useEffect(() => {
    const fetchImageSizes = async () => {
      const sizes = await Promise.all(
        images.map(
          (item) =>
            new Promise<{ width: number; height: number }>((resolve) => {
              const img = new window.Image();
              img.src = item.url_image.S;
              img.onload = () => resolve({ width: img.width, height: img.height });
              img.onerror = () => resolve({ width: 1, height: 1 });
            })
        )
      );
      setImageSizes(sizes);
    };

    if (images.length > 0) {
      fetchImageSizes();
    }
  }, [images]);

  const totalPages = Math.ceil(totalCount / IMAGES_PER_PAGE);

  const handleNextPage = async () => {
    if (lastKey) {
      setPrevKeys((prev) => [...prev, currentStartKey]);
      setCurrentPage((prev) => prev + 1);
      await loadImages(lastKey);
    }
  };

  const handlePreviousPage = async () => {
    if (prevKeys.length > 0) {
      const newPrevKeys = [...prevKeys];
      const previousKey = newPrevKeys.pop();
      setPrevKeys(newPrevKeys);
      setCurrentPage((prev) => prev - 1);
      await loadImages(previousKey);
    }
  };

  // Función para descargar la imagen o video actual usando fetch para obtener el blob
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
        link.download = isVideoUrl(selectedMedia.url)
          ? "video_downloaded.mp4"
          : "imagen_downloaded.jpg";
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
    if (selectedMedia && !isVideoUrl(selectedMedia.url)) {
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
    top: "20px",
    right: "200px",
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "4rem",
    cursor: "pointer",
    zIndex: 1100,
  };

  const downloadButtonStyle: React.CSSProperties = {
    position: "absolute",
    top: "20px",
    right: "120px",
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "4rem",
    cursor: "pointer",
    zIndex: 1100,
  };

  return (
    <>
      <NavBar sx={{ backgroundColor: "#e91ec4" }} />
      <NavMenu sx={{ backgroundColor: "#e91ec4" }} />

      <div
        style={{
          padding: "10px",
          textAlign: "center",
          maxWidth: "97vw",
          margin: "0 auto",
          border: "1px solid #ccc",
          borderRadius: "10px",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          {images.map((item, index) => {
            const size = imageSizes[index] || { width: 1, height: 1 };
            const aspectRatio = (size.height / size.width) * 100;
            const mediaUrl = item.url_image.S;
            return (
              <div
                key={item.id_image.S}
                style={{
                  position: "relative",
                  width: "100%",
                  paddingBottom: `${aspectRatio}%`,
                  backgroundColor: "transparent",
                  borderRadius: "8px",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
                onClick={() =>
                  setSelectedMedia(
                    !isVideoUrl(mediaUrl)
                      ? { url: mediaUrl, width: size.width, height: size.height }
                      : { url: mediaUrl, width: 800, height: 450 }
                  )
                }
              >
                {isVideoUrl(mediaUrl) ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls={false}
                    style={{
                      objectFit: "cover",
                      borderRadius: "3px",
                      width: "100%",
                      height: "100%",
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                  >
                    <source src={mediaUrl} type="video/mp4" />
                    
                  </video>
                ) : (
                  <Image
                    src={mediaUrl}
                    alt={`Imagen ${item.id_image.S}`}
                    fill
                    style={{
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                    sizes="(max-width: 968px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                )}
              </div>
            );
          })}
        </div>
        <div>
          <button onClick={handlePreviousPage} disabled={currentPage === 1}>
            Anterior
          </button>
          <span style={{ margin: "0 10px" }}>
            Página {currentPage} de {totalPages}
          </span>
          <button onClick={handleNextPage} disabled={!lastKey}>
            Siguiente
          </button>
        </div>
      </div>

      {/* Modal para ver la imagen o video en su tamaño original */}
      {selectedMedia && (
        <div style={modalOverlayStyle} onClick={() => setSelectedMedia(null)}>
          <button style={closeButtonStyle} onClick={() => setSelectedMedia(null)}>
            &times;
          </button>
          <button style={downloadButtonStyle} onClick={handleDownload}>
            <DownloadIcon fontSize="inherit" />
          </button>
          <div onClick={(e) => e.stopPropagation()}>
            {isVideoUrl(selectedMedia.url) ? (
              <video
                autoPlay
                controls
                style={{
                  width: "80vw",
                  height: "80vh",
                  objectFit: "contain",
                  borderRadius: "8px",
                  transition: "transform 0.3s ease-in-out",
                }}
              >
                <source src={selectedMedia.url} type="video/mp4" />
                Tu navegador no soporta el elemento de video.
              </video>
            ) : modalBlobUrl ? (
              <img
                src={modalBlobUrl}
                alt="Vista completa"
                style={{
                  maxWidth: "100vw",
                  maxHeight: "100vh",
                  objectFit: "contain",
                  borderRadius: "8px",
                  transition: "transform 0.3s ease-in-out",
                }}
              />
            ) : (
              <div style={{ color: "#fff", fontSize: "1.5rem" }}>
                Loading image...
              </div>
            )}
          </div>
        </div>
      )}

      <FooterComponent />
    </>
  );
}

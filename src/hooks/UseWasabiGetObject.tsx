import { useState, useEffect } from "react";
import AWS from "aws-sdk";

// Configurar cliente S3 para Wasabi
const s3 = new AWS.S3({
  endpoint: process.env.NEXT_PUBLIC_WASABI_ENDPOINT || "https://s3.wasabisys.com",
  region: process.env.NEXT_PUBLIC_WASABI_REGION || "us-east-1",
  accessKeyId: process.env.NEXT_PUBLIC_WASABI_ACCESS_KEY || "",
  secretAccessKey: process.env.NEXT_PUBLIC_WASABI_SECRET_KEY || "",
  signatureVersion: "v4",
});

/**
 * Hook para obtener una URL firmada de un objeto en Wasabi S3 y
 * proporcionar una función para descargar el archivo directamente.
 *
 * @param {string} objectKey - Nombre (y ruta) del archivo en el bucket.
 * @param {number} expiresIn - Tiempo de validez de la URL en segundos (por defecto 900s = 15 min).
 * @returns {Object} { url, loading, error, downloadFile }
 */
const useWasabiObjectUrl = (objectKey: string, expiresIn = 900) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!objectKey) {
      setLoading(false);
      return;
    }

    const fetchSignedUrl = async () => {
      setLoading(true);
      setError(null);
      try {
        // Generar URL firmada para acceder al objeto y forzar la descarga directa
        const signedUrl = s3.getSignedUrl("getObject", {
          Bucket: "videos-play",
          Key: objectKey,
          Expires: expiresIn,
          ResponseContentDisposition: `attachment; filename=${objectKey.split("/").pop()}`,
        });
        setUrl(signedUrl);
      } catch (err) {
        setError("Error al obtener la URL firmada de Wasabi S3");
      } finally {
        setLoading(false);
      }
    };

    fetchSignedUrl();
  }, [objectKey, expiresIn]);

  /**
   * Función para descargar el archivo directamente usando la URL firmada.
   */
  const downloadFile = () => {
    if (!url) {
      console.error("No se generó la URL firmada");
      return;
    }
    // Abre la URL firmada en una nueva pestaña, lo que dispara la descarga
    window.open(url, "_blank");
  };

  return { url, loading, error, downloadFile };
};

export default useWasabiObjectUrl;

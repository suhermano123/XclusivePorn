import React, { useEffect, useState } from "react";

const ThumbnailImage = ({ url, style, alt }) => {
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (url && url.includes("https://xmoviesforyou.com")) {
      fetch(url, {
        mode: "cors",
        // Se asigna el referer como el dominio de xmoviesforyou
        referrer: "https://xmoviesforyou.com/",
        referrerPolicy: "no-referrer-when-downgrade",
      })
        .then((response) => {
          if (!response.ok) throw new Error("Error en la respuesta de red");
          return response.blob();
        })
        .then((blob) => {
          if (isMounted) {
            const newUrl = window.URL.createObjectURL(blob);
            setBlobUrl(newUrl);
          }
        })
        .catch((error) => {
          console.error("Error al obtener el blob de la imagen:", error);
          setBlobUrl(null);
        });
    }
    return () => {
      isMounted = false;
      if (blobUrl) {
        window.URL.revokeObjectURL(blobUrl);
      }
    };
  }, [url]);

  return <img src={blobUrl || url} alt={alt} style={style} />;
};

export default ThumbnailImage;

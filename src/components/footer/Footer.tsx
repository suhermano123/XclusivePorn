import React, { useEffect, useState } from "react";
import { Typography, Link, useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";

const FooterComponent: React.FC = () => {
  const router = useRouter();

  const handleRedirect = (path: string) => {
    router.push(path);
  };
  const [renderCount, setRenderCount] = useState(0);
  const isMobile = useMediaQuery("(max-width:600px)");
  useEffect(() => {
    const loadAdScript = (
      adZoneId: string,
      containerId: string,
      width: string,
      height: string
    ) => {
      const adContainer = document.getElementById(containerId);
      if (adContainer) {
        // Limpiar el contenido previo
        adContainer.innerHTML = "";

        // Eliminar cualquier script anterior de JuicyAds para evitar duplicados
        document.querySelectorAll(`script[src*="jads.js"]`).forEach((s) =>
          s.remove()
        );

        // Crear y agregar el script principal de JuicyAds
        const script1 = document.createElement("script");
        script1.type = "text/javascript";
        script1.setAttribute("data-cfasync", "false");
        script1.async = true;
        script1.src = `https://poweredby.jads.co/js/jads.js?v=${new Date().getTime()}`;
        document.body.appendChild(script1);

        // Crear y agregar el elemento <ins> para el anuncio
        const ins = document.createElement("ins");
        ins.id = adZoneId;
        ins.setAttribute("data-width", width);
        ins.setAttribute("data-height", height);
        adContainer.appendChild(ins);

        // Crear y agregar el script para inicializar el anuncio
        const script2 = document.createElement("script");
        script2.type = "text/javascript";
        script2.setAttribute("data-cfasync", "false");
        script2.async = true;
        script2.innerHTML = `(adsbyjuicy = window.adsbyjuicy || []).push({'adzone': ${adZoneId}});`;
        adContainer.appendChild(script2);
      }
    };

    // Eliminar anuncios viejos para recargar nuevamente
    document.querySelectorAll("ins[id^='juicy-ads']").forEach((el) => el.remove());
    console.log("es movil", isMobile);

    if (isMobile) {
      // En dispositivos móviles solo se carga este anuncio
      loadAdScript("1111579", "juicy-ads-1111579", "300", "100");
    } else {
      // En escritorio se cargan los anuncios habituales
      loadAdScript("1111576", "juicy-ads-1111576", "300", "250");
      loadAdScript("1111577", "juicy-ads-1111577", "908", "258");
      loadAdScript("1111578", "juicy-ads-1111578", "300", "250");
    }
  }, [isMobile]);



  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
        {/* Contenedor del nuevo anuncio izquierdo */}
        <div
          id="juicy-ads-1111576"
          style={{
            width: "300px",
            height: "250px",
            backgroundColor: "#f1f1f1",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <Typography variant="h6" style={{ textAlign: "center", color: "#333" }}>
            Advertisement
          </Typography>
        </div>

        {/* Contenedor del anuncio principal */}
        <div
          id="juicy-ads-1111577"
          style={{
            width: "908px",
            height: "258px",
            backgroundColor: "#f1f1f1",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <Typography variant="h6" style={{ textAlign: "center", color: "#333" }}>
            Advertisement
          </Typography>
        </div>

        {/* Contenedor del nuevo anuncio derecho */}
        <div
          id="juicy-ads-1111578"
          style={{
            width: "300px",
            height: "250px",
            backgroundColor: "#f1f1f1",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <Typography variant="h6" style={{ textAlign: "center", color: "#333" }}>
            Advertisement
          </Typography>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "#e91ec4",
          color: "white",
          textAlign: "center",
          padding: "20px 10px",
          width: "100%",
          position: "relative",
        }}
      >
        <Typography variant="body2" color="inherit" paragraph>
          {"© "} {new Date().getFullYear()} novapornx All rights reserved.
        </Typography>

        <Typography variant="body2" color="inherit" paragraph>
          <Link href="#" color="inherit" style={{ margin: "0 15px" }} onClick={() => handleRedirect("/DMCA/Dmca")}>
            DMCA
          </Link>
          <Link href="#" color="inherit" style={{ margin: "0 15px" }} onClick={() => handleRedirect("/TERMS/TermsUse")}>
            Terms of Use
          </Link>
          <Link href="#" color="inherit" style={{ margin: "0 15px" }} onClick={() => handleRedirect("/Privacy-policy/policy")}>
            Privacy Policy
          </Link>
          <Link href="#" color="inherit" style={{ margin: "0 15px" }} onClick={() => handleRedirect("/faq")}>
            FAQ
          </Link>
        </Typography>

        <Typography variant="body2" color="inherit" paragraph>
          Welcome to novapornx.com free porn videos in PREMIUM HD, This site does not store any files on your servers. novapornx only indexes and links to content provided by other non-affiliated sites. All models appearing on this website are 18 years or older.
        </Typography>
      </footer>
    </div>
  );
};

export default FooterComponent;
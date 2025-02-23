import React, { useEffect, useState } from "react";
import { Typography, Link } from "@mui/material";
import { useRouter } from "next/router";

const FooterComponent: React.FC = () => {
  const router = useRouter();

  const handleRedirect = (path: string) => {
    router.push(path);
  };
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    const loadAdScript = (adZoneId: string, containerId: string, width: string, height: string) => {
      const adContainer = document.getElementById(containerId);
      
      if (adContainer) {
        adContainer.innerHTML = "";

        if (!document.querySelector(`script[src="https://poweredby.jads.co/js/jads.js"]`)) {
          const script1 = document.createElement("script");
          script1.type = "text/javascript";
          script1.setAttribute("data-cfasync", "false");
          script1.async = true;
          script1.src = "https://poweredby.jads.co/js/jads.js";
          document.body.appendChild(script1);
        }

        const ins = document.createElement("ins");
        ins.id = adZoneId;
        ins.setAttribute("data-width", width);
        ins.setAttribute("data-height", height);
        adContainer.appendChild(ins);

        const script2 = document.createElement("script");
        script2.type = "text/javascript";
        script2.setAttribute("data-cfasync", "false");
        script2.async = true;
        script2.innerHTML = `(adsbyjuicy = window.adsbyjuicy || []).push({'adzone': ${adZoneId}});`;
        adContainer.appendChild(script2);
      }
    };

    loadAdScript("1081329", "juicy-ads-1081329", "908", "258");
    loadAdScript("1081330", "juicy-ads-1081330", "300", "250");
    loadAdScript("1081332", "juicy-ads-1081332", "300", "250");

    // 🔄 Forzar una segunda ejecución después de un pequeño delay
    if (renderCount < 1) {
      setTimeout(() => setRenderCount(renderCount + 1), 100); // Retraso de 100ms para evitar conflictos
    }
  }, [renderCount]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
        {/* Contenedor del nuevo anuncio izquierdo */}
        <div
          id="juicy-ads-1081330"
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
          id="juicy-ads-1081329"
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
          id="juicy-ads-1081332"
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
          {"© "} {new Date().getFullYear()} XclusivePorn All rights reserved.
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
          This site does not store any files on your servers. PornoBae only indexes and links to content provided by other non-affiliated sites. All models appearing on this website are 18 years or older.
        </Typography>
      </footer>
    </div>
  );
};

export default FooterComponent;
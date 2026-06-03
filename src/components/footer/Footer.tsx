import React, { useEffect, useState } from "react";
import { Typography, Link as MuiLink, useMediaQuery } from "@mui/material";
import Link from "next/link";

const FooterComponent: React.FC = () => {
  const [renderCount, setRenderCount] = useState(0);
  const isMobile = useMediaQuery("(max-width:600px)");
  



  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
        {/* Contenedor del nuevo anuncio izquierdo */}
        <div

        ><iframe src="//a.magsrv.com/iframe.php?idzone=5940932&size=300x250" width="210" height="250" scrolling="no"  ></iframe>
          
        </div>

        {/* Contenedor del anuncio principal */}
        <div
          
        ><iframe src="//a.magsrv.com/iframe.php?idzone=5940940&size=300x250" width="210" height="250" scrolling="no"   ></iframe>
        
          
        </div>

        {/* Contenedor del nuevo anuncio derecho */}
        <div
          
        >
          {/* <Typography variant="h6" style={{ textAlign: "center", color: "#333" }}>
            Advertisement
          </Typography> */}
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
          <MuiLink component={Link} href="/DMCA/Dmca" color="inherit" style={{ margin: "0 15px" }}>
            DMCA
          </MuiLink>
          <MuiLink component={Link} href="/TERMS/TermsUse" color="inherit" style={{ margin: "0 15px" }}>
            Terms of Use
          </MuiLink>
          <MuiLink component={Link} href="/Privacy-policy/policy" color="inherit" style={{ margin: "0 15px" }}>
            Privacy Policy
          </MuiLink>
          <MuiLink component={Link} href="/faq" color="inherit" style={{ margin: "0 15px" }}>
            FAQ
          </MuiLink>
        </Typography>

        <Typography variant="body2" color="inherit" paragraph>
          Welcome to novapornx.com free porn videos in PREMIUM HD, This site does not store any files on your servers. novapornx only indexes and links to content provided by other non-affiliated sites. All models appearing on this website are 18 years or older.
        </Typography>
      </footer>
    </div>
  );
};

export default FooterComponent;
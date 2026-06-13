import React from "react";
import { Typography, Link as MuiLink, Box } from "@mui/material";
import Link from "next/link";

const FooterComponent: React.FC = () => {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", gap: "20px" }} aria-hidden="true">
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {/* Contenedor del nuevo anuncio izquierdo */}
          <div>
            <iframe
              src="//a.magsrv.com/iframe.php?idzone=5940932&size=300x250"
              width="210"
              height="250"
              scrolling="no"
              loading="lazy"
              title="Advertisement Left"
              style={{ border: "none" }}
            ></iframe>
          </div>

          {/* Contenedor del anuncio principal */}
          <div>
            <iframe
              src="//a.magsrv.com/iframe.php?idzone=5940940&size=300x250"
              width="210"
              height="250"
              scrolling="no"
              loading="lazy"
              title="Advertisement Right"
              style={{ border: "none" }}
            ></iframe>
          </div>
        </Box>
      </div>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "#e91ec4",
          color: "white",
          textAlign: "center",
          padding: "30px 10px",
          width: "100%",
          position: "relative",
        }}
      >
        {/* Main SEO/Navigation Links */}
        <Typography variant="body2" color="inherit" paragraph style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "10px", margin: "15px 0" }}>
          <MuiLink component={Link} href="/" color="inherit" style={{ margin: "0 10px", fontWeight: "bold" }}>
            Home
          </MuiLink>
          <MuiLink component={Link} href="/categories" color="inherit" style={{ margin: "0 10px", fontWeight: "bold" }}>
            Porn Categories
          </MuiLink>
          <MuiLink component={Link} href="/4k-porn-videos" color="inherit" style={{ margin: "0 10px", fontWeight: "bold" }}>
            4K Porn
          </MuiLink>
          <MuiLink component={Link} href="/free-hd-porn-videos" color="inherit" style={{ margin: "0 10px", fontWeight: "bold" }}>
            Free HD Porn
          </MuiLink>
          <MuiLink component={Link} href="/latina-hd-porn" color="inherit" style={{ margin: "0 10px", fontWeight: "bold" }}>
            Latina Porn
          </MuiLink>
          <MuiLink component={Link} href="/premium-hd-porn" color="inherit" style={{ margin: "0 10px", fontWeight: "bold" }}>
            Premium HD Porn
          </MuiLink>
        </Typography>

        {/* Legal Links */}
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
          {"© "} {new Date().getFullYear()} NovaPornX. All rights reserved.
        </Typography>

        <Typography variant="body2" color="inherit" paragraph style={{ maxWidth: "900px", margin: "15px auto", opacity: 0.9 }}>
          Welcome to novapornx.com free porn videos in PREMIUM HD. This site does not store any files on its servers. novapornx only indexes and links to content provided by other non-affiliated sites. All models appearing on this website are 18 years or older. Contact us at admin@novapornx.com.
        </Typography>
      </footer>
    </div>
  );
};

export default FooterComponent;
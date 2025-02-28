import * as React from "react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import { useRouter } from "next/router"; // Importa el hook useRouter
import { Typography } from "@mui/material";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import FavoriteIcon from '@mui/icons-material/Favorite';

export default function NavMenu(props: any) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter(); // Inicializa el hook useRouter

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  const handleMoviesClick = () => {
    router.push("/Downloads/PornMovies"); // Redirige a la ruta de subida de videos
  };

  React.useEffect(() => {
    const loadAdScript = () => {
      if (
        !document.querySelector(
          `script[src="https://poweredby.jads.co/js/jads.js"]`
        )
      ) {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.setAttribute("data-cfasync", "false");
        script.async = true;
        script.src = "https://poweredby.jads.co/js/jads.js";
        document.body.appendChild(script);
      }

      // Insertar el primer banner de anuncios
      const adContainer1 = document.getElementById("juicy-ads-banner-1");
      if (adContainer1) {
        adContainer1.innerHTML =
          '<ins id="1081333" data-width="468" data-height="60"></ins>';
        const script1 = document.createElement("script");
        script1.type = "text/javascript";
        script1.setAttribute("data-cfasync", "false");
        script1.async = true;
        script1.innerHTML = `(adsbyjuicy = window.adsbyjuicy || []).push({'adzone':1081333});`;
        adContainer1.appendChild(script1);
      }

      // Insertar el segundo banner de anuncios
      const adContainer2 = document.getElementById("juicy-ads-banner-2");
      if (adContainer2) {
        adContainer2.innerHTML =
          '<ins id="1081335" data-width="468" data-height="60"></ins>';
        const script2 = document.createElement("script");
        script2.type = "text/javascript";
        script2.setAttribute("data-cfasync", "false");
        script2.async = true;
        script2.innerHTML = `(adsbyjuicy = window.adsbyjuicy || []).push({'adzone':1081335});`;
        adContainer2.appendChild(script2);
      }
    };

    loadAdScript();
  }, []);

  return (
    <div>
      <Grid container sx={{ justifyContent: "center" }}>
        <Grid item>
          <Tooltip disableFocusListener title="Channels">
            <Button
              style={{
                color: "white",
                display: "flex",
                alignItems: "center", // Asegura la alineación vertical
                justifyContent: "center", // Centra el contenido horizontalmente
                gap: "5px", // Espaciado entre el icono y el texto
              }}
            >
              <LiveTvIcon sx={{ fontSize: 20, verticalAlign: "middle" }} />
              <span style={{ display: "flex", alignItems: "center" }}>
                Channels
              </span>
            </Button>
          </Tooltip>
        </Grid>
        <Grid item>
          <Tooltip disableFocusListener disableTouchListener title="Download porn movies">
            <Button style={{
                color: "white",
                display: "flex",
                alignItems: "center", // Asegura la alineación vertical
                justifyContent: "center", // Centra el contenido horizontalmente
                gap: "5px", // Espaciado entre el icono y el texto
              }} onClick={ handleMoviesClick}> <CloudDownloadIcon /> DOWNLOAD PORN MOVIES</Button>
          </Tooltip>
        </Grid>
        <Grid item>
          <Tooltip disableFocusListener disableTouchListener title="Porn stars">
            <Button style={{
                color: "white",
                display: "flex",
                alignItems: "center", // Asegura la alineación vertical
                justifyContent: "center", // Centra el contenido horizontalmente
                gap: "5px", // Espaciado entre el icono y el texto
              }}> <FavoriteIcon />Porn Stars</Button>
          </Tooltip>
        </Grid>
        <Grid item>
          <ClickAwayListener onClickAway={handleTooltipClose}>
            <div></div>
          </ClickAwayListener>
        </Grid>
      </Grid>

      {/* Espacio para anuncios, ahora en línea (uno al lado del otro) */}
      <div
        style={{
          width: "100%",
          height: "60px", // Ajusta la altura según el espacio necesario para el anuncio
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "6px", 
          marginBottom: "6px",// Espacio entre el NavMenu y los anuncios
          gap: "20px", // Espaciado entre anuncios
        }}
      >
        <div id="juicy-ads-banner-1" style={{ width: "468px", height: "60px" }}>
          <Typography variant="h6" align="center" color="textSecondary">
            Ad here 1
          </Typography>
        </div>

        <div id="juicy-ads-banner-2" style={{ width: "468px", height: "60px" }}>
          <Typography variant="h6" align="center" color="textSecondary">
            Ad here 2
          </Typography>
        </div>
      </div>
    </div>
  );
}

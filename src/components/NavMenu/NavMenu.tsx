import * as React from "react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import { useRouter } from "next/router";
import Link from "next/link";
import { Box, Typography } from "@mui/material";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Diversity1Icon from '@mui/icons-material/Diversity1';

export default function NavMenu(props: any) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
          {/* <Tooltip disableFocusListener disableTouchListener title="Download porn movies">
            <Button component={Link} href="/Downloads/PornMovies" style={{
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
            }}> <CloudDownloadIcon /> DOWNLOAD PORN MOVIES</Button>
          </Tooltip> */}
        </Grid>
        <Grid item>
          {/* <Tooltip disableFocusListener disableTouchListener title="Porn stars">
            <Button component={Link} href="/Porn/Images" style={{
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
            }}> <FavoriteIcon />PORN IMAGES</Button>
          </Tooltip> */}
        </Grid>
        <Grid item onClick={(e) => e.stopPropagation()}>
          {/* <Tooltip disableFocusListener title="Cams">
            <Button onClick={handleOpenCams}>
              CAMS
            </Button>
          </Tooltip> */}
        </Grid>
        <Grid item>
          <Tooltip disableFocusListener title="Video Downloader">
            <Button component={Link} href="/VideoDownloader" style={{
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
            }}>
              <CloudDownloadIcon /> VIDEO DOWNLOADER
            </Button>
          </Tooltip>
        </Grid>
        <Grid item>
          <ClickAwayListener onClickAway={handleTooltipClose}>
            <div></div>
          </ClickAwayListener>
        </Grid>
      </Grid>

     
    </div>
  );
}

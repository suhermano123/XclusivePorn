import * as React from "react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import { useRouter } from "next/router";
import Link from "next/link";
import { Box } from "@mui/material";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import StarIcon from "@mui/icons-material/Star";
import CategoryIcon from "@mui/icons-material/Category";

export default function NavMenu(props: any) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const handleTooltipClose = () => setOpen(false);
  const handleTooltipOpen = () => setOpen(true);

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const navLinkStyle = {
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
  };

  return (
    <nav aria-label="Main navigation">
      <Grid container sx={{ justifyContent: "center" }} component="ul" >

        <Grid item component="li">
          <Tooltip disableFocusListener disableTouchListener title="Browse porn videos by performer">
            <Button
              component={Link}
              href="/pornstars"
              aria-label="Browse porn videos by pornstar"
              style={navLinkStyle}
            >
              <StarIcon sx={{ fontSize: 20 }} aria-hidden="true" />
              Pornstars
            </Button>
          </Tooltip>
        </Grid>

        <Grid item component="li">
          <Tooltip disableFocusListener disableTouchListener title="Browse porn videos by studio">
            <Button
              component={Link}
              href="/studios"
              aria-label="Browse porn videos by studio"
              style={navLinkStyle}
            >
              <LiveTvIcon sx={{ fontSize: 20 }} aria-hidden="true" />
              Studios
            </Button>
          </Tooltip>
        </Grid>

        <Grid item component="li">
          <Tooltip disableFocusListener disableTouchListener title="Browse porn categories">
            <Button
              component={Link}
              href="/categories"
              aria-label="Browse porn categories"
              style={navLinkStyle}
            >
              <CategoryIcon sx={{ fontSize: 20 }} aria-hidden="true" />
              Categories
            </Button>
          </Tooltip>
        </Grid>

        <Grid item component="li">
          <Tooltip disableFocusListener disableTouchListener title="Download free porn videos">
            <Button
              component={Link}
              href="/VideoDownloader"
              aria-label="Free porn video downloader"
              style={navLinkStyle}
            >
              <CloudDownloadIcon aria-hidden="true" />
              Video Downloader
            </Button>
          </Tooltip>
        </Grid>

        <Grid item component="li">
          <Tooltip disableFocusListener disableTouchListener title="Free porn pictures and sex images">
            <Button
              component={Link}
              href="/images"
              aria-label="Free porn pictures and sex images gallery"
              style={navLinkStyle}
            >
              <PhotoLibraryIcon aria-hidden="true" />
              Porn Images
            </Button>
          </Tooltip>
        </Grid>

        <Grid item component="li">
          <ClickAwayListener onClickAway={handleTooltipClose}>
            <div />
          </ClickAwayListener>
        </Grid>

      </Grid>
    </nav>
  );
}
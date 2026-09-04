import * as React from "react";
import Link from "next/link";
import { Box } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import CategoryIcon from "@mui/icons-material/Category";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";

export const NAV_LINKS = [
  { href: "/pornstars", label: "Pornstars", Icon: StarIcon },
  { href: "/studios", label: "Studios", Icon: LiveTvIcon },
  { href: "/categories", label: "Categories", Icon: CategoryIcon },
  { href: "/VideoDownloader", label: "Video Downloader", Icon: CloudDownloadIcon },
  { href: "/images", label: "Porn Images", Icon: PhotoLibraryIcon },
];

/**
 * Secondary nav strip — identical dark look on every page. On narrow screens it
 * scrolls horizontally instead of wrapping into a broken grid.
 */
export default function NavMenu() {
  return (
    <Box
      component="nav"
      aria-label="Sections"
      sx={{
        backgroundColor: "#000",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        position: "sticky",
        top: { xs: 0, md: 64 },
        zIndex: (t) => t.zIndex.appBar - 1,
      }}
    >
      <Box
        component="ul"
        sx={{
          listStyle: "none",
          m: 0,
          p: 0,
          px: { xs: 1, md: 2 },
          display: "flex",
          alignItems: "stretch",
          justifyContent: { xs: "flex-start", md: "center" },
          gap: { xs: 0.5, md: 1.5 },
          overflowX: "auto",
          overflowY: "hidden",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {NAV_LINKS.map(({ href, label, Icon }) => (
          <Box component="li" key={href} sx={{ flexShrink: 0 }}>
            <Box
              component={Link}
              href={href}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.6,
                whiteSpace: "nowrap",
                textDecoration: "none",
                color: "rgba(255,255,255,0.85)",
                fontWeight: 700,
                fontSize: { xs: "0.72rem", md: "0.82rem" },
                letterSpacing: "0.3px",
                textTransform: "uppercase",
                px: { xs: 1, md: 1.5 },
                py: 1.25,
                borderBottom: "2px solid transparent",
                transition: "color .15s, border-color .15s",
                "&:hover": { color: "#fff", borderColor: "#f013e5" },
              }}
            >
              <Icon aria-hidden="true" sx={{ fontSize: { xs: 16, md: 18 }, color: "#f013e5" }} />
              {label}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

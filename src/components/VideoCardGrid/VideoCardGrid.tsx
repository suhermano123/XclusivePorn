import React from "react";
import Link from "next/link";
import { Box, Button, Typography } from "@mui/material";
import type { SupabaseVideo } from "@/api/videoSupabaseService";

const buildSlug = (title: string): string =>
  title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

const formatDuration = (seconds?: number, fallback?: string) => {
  if (!seconds || seconds <= 0) return fallback || "0:00";
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

interface Props {
  videos: SupabaseVideo[];
  currentPage: number;
  totalPages: number;
  /** Builds the href for page n (relative path). */
  hrefForPage: (n: number) => string;
  emptyMessage?: string;
}

/**
 * Server-rendered video grid with crawlable <a> pagination.
 * Deliberately has no client state — used by the pornstar/studio listings.
 */
const VideoCardGrid: React.FC<Props> = ({
  videos,
  currentPage,
  totalPages,
  hrefForPage,
  emptyMessage = "No videos found.",
}) => {
  if (videos.length === 0) {
    return (
      <Typography variant="h6" sx={{ color: "#aaa", textAlign: "center", mt: 8 }}>
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(3, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: { xs: "8px", md: "15px" },
        }}
      >
        {videos.map((video) => {
          const title = video.titulo || video.title || "Video";
          const href = `/video/${video.uuid}-${buildSlug(title)}`;
          const img = video.imagen_url || video.img_src || "/assets/placeholder.png";
          return (
            <Link href={href} key={video.uuid} passHref legacyBehavior>
              <Box
                component="a"
                sx={{
                  display: "block",
                  textDecoration: "none",
                  backgroundColor: "#111",
                  borderRadius: "8px",
                  overflow: "hidden",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "translateY(-4px)" },
                }}
              >
                <Box sx={{ position: "relative", width: "100%", paddingTop: "56.25%", bgcolor: "#000" }}>
                  <Box
                    component="img"
                    src={img}
                    alt={`${title} – free HD porn video`}
                    loading="lazy"
                    sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
                <Box sx={{ p: 1 }}>
                  <Typography
                    sx={{
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: 700,
                      lineHeight: 1.3,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {title}
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                    <span style={{ fontSize: "11px", color: "#ccc" }}>👍 {video.likes || 0}</span>
                    <span style={{ fontSize: "10px", color: "#aaa" }}>
                      ⏳ {formatDuration(video.duracion_segundos, video.duracion)}
                    </span>
                  </Box>
                </Box>
              </Box>
            </Link>
          );
        })}
      </Box>

      {totalPages > 1 && (
        <Box
          component="nav"
          aria-label="Pagination"
          sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", mt: 6, mb: 4, gap: "10px" }}
        >
          {currentPage > 1 && (
            <Button component={Link} href={hrefForPage(currentPage - 1)} variant="contained" sx={btnSx} aria-label="Previous page">
              Back
            </Button>
          )}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const n = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
            if (n > totalPages) return null;
            return (
              <Button
                key={n}
                component={Link}
                href={hrefForPage(n)}
                aria-current={n === currentPage ? "page" : undefined}
                variant={n === currentPage ? "contained" : "outlined"}
                sx={{
                  minWidth: "40px",
                  fontWeight: "bold",
                  borderRadius: "10%",
                  backgroundColor: n === currentPage ? "#f013e5" : "rgba(255,255,255,0.05)",
                  color: n === currentPage ? "#fff" : "#f013e5",
                  borderColor: "#f013e5",
                }}
              >
                {n}
              </Button>
            );
          })}
          {currentPage < totalPages && (
            <Button component={Link} href={hrefForPage(currentPage + 1)} variant="contained" sx={btnSx} aria-label="Next page">
              Next
            </Button>
          )}
        </Box>
      )}
    </>
  );
};

const btnSx = {
  backgroundColor: "#f013e5",
  color: "#fff",
  fontWeight: "bold",
  borderRadius: "20px",
  padding: "6px 16px",
  "&:hover": { backgroundColor: "#e91ec4" },
};

export default VideoCardGrid;

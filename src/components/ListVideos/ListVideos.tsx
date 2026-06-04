import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { getVideosPaginated, searchVideosPaginated, getVideosByCategoryPaginated, SupabaseVideo } from "@/api/videoSupabaseService";
import { Skeleton, Box, Button, Typography } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import HeartBrokenIcon from "@mui/icons-material/HeartBroken";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FooterComponent from "../footer/Footer";
import TopVideosSlider from "../TopVideosSlider/TopVideosSlider";
import Image from "next/image";
import { getVisitorId } from "@/api/visitorIdHelper";
import Script from "next/script";
import { styles } from "./styles";

interface VideoGridProps {
  category?: string;
  searchQuery?: string;
}

// Helpers
const buildSlug = (title: string): string =>
  title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

/** ISO 8601 duration for schema.org, e.g. PT4M35S */
const toISODuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `PT${m}M${s}S`;
};

const BASE_URL = "https://novapornx.com";

const VideoGrid: React.FC<VideoGridProps> = ({ category, searchQuery }) => {
  const [videoL, setVideoL] = useState<SupabaseVideo[]>([]);
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const [loadingPreviews, setLoadingPreviews] = useState<{ [key: string]: boolean }>({});
  const [currentPreview, setCurrentPreview] = useState<{ [key: string]: number }>({});
  const [totalCount, setTotalCount] = useState<number>(0);
  const [votedVideos, setVotedVideos] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();
  const videosPerPage = 24;
  const totalPages = Math.ceil(totalCount / videosPerPage);

  // ─── Canonical & pagination meta ─────────────────────────────────────────
  const buildPageUrl = (page: number) =>
    page === 1 ? BASE_URL : `${BASE_URL}?page=${page}`;

  const canonicalUrl = buildPageUrl(currentPage);
  const prevUrl = currentPage > 1 ? buildPageUrl(currentPage - 1) : null;
  const nextUrl = currentPage < totalPages ? buildPageUrl(currentPage + 1) : null;

  // ─── Sync page with URL ───────────────────────────────────────────────────
  useEffect(() => {
    if (!router.isReady) return;
    const pageQuery = router.query.page;
    if (pageQuery && typeof pageQuery === "string") {
      const n = parseInt(pageQuery, 10);
      if (!isNaN(n) && n > 0) setCurrentPage(n);
    }
  }, [router.isReady, router.query.page]);

  const handlePageChange = (pageNum: number) => {
    setCurrentPage(pageNum);
    router.push(
      { pathname: router.pathname, query: { ...router.query, page: pageNum } },
      undefined,
      { shallow: true }
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── Load videos ──────────────────────────────────────────────────────────
  const loadVideos = async (page: number) => {
    try {
      let result;
      if (category) {
        result = await getVideosByCategoryPaginated(category, videosPerPage, page);
      } else if (searchQuery) {
        result = await searchVideosPaginated(searchQuery, videosPerPage, page);
      } else {
        result = await getVideosPaginated(videosPerPage, page);
      }
      setVideoL(result.items || []);
      setTotalCount(result.totalCount || 0);
    } catch (error) {
      console.error("Error loading videos:", error);
    }
  };

  useEffect(() => {
    loadVideos(currentPage);
  }, [currentPage, category, searchQuery]); // ✅ fixed dependencies

  // ─── Voted state from localStorage ───────────────────────────────────────
  useEffect(() => {
    if (!videoL.length) return;
    const newVoted = new Set<string>();
    videoL.forEach((v) => {
      if (localStorage.getItem(`voted_${v.uuid}`)) newVoted.add(v.uuid);
    });
    setVotedVideos(newVoted);
  }, [videoL]);

  // ─── Preview image cycling ────────────────────────────────────────────────
  useEffect(() => {
    if (!hoveredVideo) return;
    const video = videoL.find((v) => v.uuid === hoveredVideo);
    const previewSource = video?.preview_url || video?.preview;
    if (
      previewSource &&
      !previewSource.endsWith(".mp4") &&
      !previewSource.endsWith(".webm")
    ) {
      const imgs = previewSource.split(",").map((u) => u.trim()).filter(Boolean);
      if (imgs.length > 1) {
        const interval = setInterval(() => {
          setCurrentPreview((prev) => ({
            ...prev,
            [hoveredVideo]: ((prev[hoveredVideo] || 0) + 1) % imgs.length,
          }));
        }, 1000);
        return () => clearInterval(interval);
      }
    }
  }, [hoveredVideo, videoL]);

  // ─── Rating handler ───────────────────────────────────────────────────────
  const handleRating = async (
    e: React.MouseEvent,
    uuid: string,
    type: "likes" | "dislikes",
    currentValue: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (votedVideos.has(uuid)) {
      alert("You have already voted on this video.");
      return;
    }
    try {
      const visitorId = getVisitorId();
      setVideoL((prev) =>
        prev.map((v) =>
          v.uuid === uuid ? { ...v, [type]: (v[type] || 0) + 1 } : v
        )
      );
      const newVoted = new Set(votedVideos);
      newVoted.add(uuid);
      setVotedVideos(newVoted);
      localStorage.setItem(`voted_${uuid}`, type);
      const { registerVote } = await import("@/api/videoSupabaseService");
      await registerVote(uuid, visitorId, type, currentValue);
    } catch (error: any) {
      console.error(`Error updating ${type}:`, error);
      if (error.message === "Already voted") {
        alert("You have already reacted to this video.");
      }
    }
  };

  // ─── JSON-LD: ItemList of VideoObjects ────────────────────────────────────
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": category
      ? `${category} HD Porn Videos – Page ${currentPage}`
      : searchQuery
        ? `Search results for "${searchQuery}" – Page ${currentPage}`
        : `Free HD Porn Videos – Page ${currentPage}`,
    "url": canonicalUrl,
    "numberOfItems": videoL.length,
    "itemListElement": videoL.map((video, index) => {
      const title = video.titulo || video.title || "video";
      const slug = buildSlug(title);
      const videoUrl = `${BASE_URL}/video/${video.uuid}-${slug}`;
      return {
        "@type": "ListItem",
        "position": (currentPage - 1) * videosPerPage + index + 1,
        "item": {
          "@type": "VideoObject",
          "name": title,
          "description": title,
          "thumbnailUrl": video.imagen_url || video.img_src || "",
          "contentUrl": videoUrl,
          "url": videoUrl,
          ...(video.created_at ? { "uploadDate": video.created_at } : {}),
          ...(video.duracion_segundos && video.duracion_segundos > 0
            ? { "duration": toISODuration(video.duracion_segundos) }
            : {}),
          "interactionStatistic": [
            {
              "@type": "InteractionCounter",
              "interactionType": "https://schema.org/WatchAction",
              "userInteractionCount": video.views || 0,
            },
            {
              "@type": "InteractionCounter",
              "interactionType": "https://schema.org/LikeAction",
              "userInteractionCount": video.likes || 0,
            },
          ],
        },
      };
    }),
  };

  // ─── BreadcrumbList schema ────────────────────────────────────────────────
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": BASE_URL,
      },
      ...(category
        ? [{ "@type": "ListItem", "position": 2, "name": category, "item": `${BASE_URL}/category/${buildSlug(category)}` }]
        : []),
      ...(searchQuery
        ? [{ "@type": "ListItem", "position": 2, "name": `Search: ${searchQuery}`, "item": `${BASE_URL}/search?q=${encodeURIComponent(searchQuery)}` }]
        : []),
    ],
  };

  return (
    <>
      {/* ─── SEO Head ───────────────────────────────────────────────────────── */}
      <Head>
        <link rel="canonical" href={canonicalUrl} />
        {prevUrl && <link rel="prev" href={prevUrl} />}
        {nextUrl && <link rel="next" href={nextUrl} />}

        {/* JSON-LD: ItemList + VideoObjects */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
        {/* JSON-LD: Breadcrumbs */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </Head>

      <div>
        <Script src="https://a.magsrv.com/ad-provider.js" strategy="afterInteractive" />
        <ins className="eas6a97888e31" data-zoneid="5941690" />
        <Script id="magsrv-ad">
          {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
        </Script>

        <div style={styles.container}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                md: "repeat(4, 1fr)",
                lg: "repeat(5, 1fr)",
                xl: "repeat(6, 1fr)",
              },
              gap: { xs: "6px", sm: "10px", md: "15px" },
              padding: { xs: "6px", sm: "10px", md: "15px" },
            }}
          >
            {videoL.length === 0
              ? Array(15)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    style={{
                      ...styles.videoCard,
                      backgroundColor: "rgba(240, 236, 236, 0.1)",
                      minHeight: "220px",
                    }}
                  >
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={150}
                      sx={{ bgcolor: "rgba(255,255,255,0.05)" }}
                    />
                    <Skeleton
                      variant="text"
                      width="90%"
                      style={{ marginTop: "10px", marginLeft: "10px" }}
                    />
                    <Skeleton
                      variant="text"
                      width="60%"
                      style={{ marginTop: "5px", marginLeft: "10px" }}
                    />
                  </div>
                ))
              : videoL.map((video: SupabaseVideo, index: number) => {
                const previewUrl = video.preview_url || video.preview;
                const thumbnails =
                  previewUrl &&
                    !previewUrl.endsWith(".mp4") &&
                    !previewUrl.endsWith(".webm")
                    ? previewUrl
                      .split(",")
                      .map((u) => u.trim())
                      .filter(Boolean)
                    : [];

                const isHovered = hoveredVideo === video.uuid;
                const isVideoPreview =
                  previewUrl &&
                  (previewUrl.endsWith(".mp4") || previewUrl.endsWith(".webm"));

                const currentImg =
                  isHovered && thumbnails.length > 0
                    ? thumbnails[currentPreview[video.uuid] || 0]
                    : video.imagen_url || video.img_src;

                const videoTitle = video.titulo || video.title || "video";
                const slug = buildSlug(videoTitle);
                const videoUrl = `/video/${video.uuid}-${slug}`;

                // ── Per-card VideoObject JSON-LD ──────────────────────────
                const videoSchema = {
                  "@context": "https://schema.org",
                  "@type": "VideoObject",
                  "name": videoTitle,
                  "description": videoTitle,
                  "thumbnailUrl": video.imagen_url || video.img_src || "",
                  "contentUrl": `${BASE_URL}${videoUrl}`,
                  "url": `${BASE_URL}${videoUrl}`,
                  ...(video.created_at ? { "uploadDate": video.created_at } : {}),
                  ...(video.duracion_segundos && video.duracion_segundos > 0
                    ? { "duration": toISODuration(video.duracion_segundos) }
                    : {}),
                  "interactionStatistic": [
                    {
                      "@type": "InteractionCounter",
                      "interactionType": "https://schema.org/WatchAction",
                      "userInteractionCount": video.views || 0,
                    },
                    {
                      "@type": "InteractionCounter",
                      "interactionType": "https://schema.org/LikeAction",
                      "userInteractionCount": video.likes || 0,
                    },
                  ],
                };

                return (
                  <React.Fragment key={video.uuid || video.id_post}>
                    {/* Per-video JSON-LD */}
                    <script
                      type="application/ld+json"
                      dangerouslySetInnerHTML={{
                        __html: JSON.stringify(videoSchema),
                      }}
                    />

                    {/* ── Video card ── */}
                    <Link href={videoUrl} passHref legacyBehavior>
                      <Box
                        component="a"
                        sx={{ ...styles.videoCardSx, textDecoration: "none" }}
                        onMouseEnter={() => {
                          setHoveredVideo(video.uuid);
                          setLoadingPreviews((prev) => ({ ...prev, [video.uuid]: true }));
                          setCurrentPreview((prev) => ({ ...prev, [video.uuid]: 0 }));
                        }}
                        onMouseLeave={() => {
                          setHoveredVideo(null);
                          setLoadingPreviews((prev) => ({ ...prev, [video.uuid]: false }));
                        }}
                        onTouchStart={() => {
                          setHoveredVideo(video.uuid);
                          setLoadingPreviews((prev) => ({ ...prev, [video.uuid]: true }));
                        }}
                        onPointerEnter={() => {
                          setHoveredVideo(video.uuid);
                          setLoadingPreviews((prev) => ({ ...prev, [video.uuid]: true }));
                        }}
                      >
                        {/* Thumbnail */}
                        <div style={styles.thumbnailContainer}>
                          {isHovered && isVideoPreview ? (
                            <video
                              src={`/api/media?uuid=${video.uuid}&type=preview`}
                              autoPlay
                              muted
                              loop
                              playsInline
                              preload="auto"
                              onLoadedData={() =>
                                setLoadingPreviews((prev) => ({
                                  ...prev,
                                  [video.uuid]: false,
                                }))
                              }
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "2px",
                              }}
                            />
                          ) : (
                            <Image
                              priority={index < 6} // ✅ only above-the-fold images get priority
                              height={200}
                              width={300}
                              src={
                                currentImg ||
                                video.imagen_url ||
                                video.img_src ||
                                "/assets/placeholder.png"
                              }
                              // ✅ Descriptive alt, no keyword stuffing
                              alt={`${videoTitle} – free HD video`}
                              style={styles.thumbnail}
                              unoptimized={true}
                              onLoad={() => {
                                if (isHovered) {
                                  setLoadingPreviews((prev) => ({
                                    ...prev,
                                    [video.uuid]: false,
                                  }));
                                }
                              }}
                            />
                          )}

                          {isHovered && loadingPreviews[video.uuid] && (
                            <Box
                              sx={{
                                position: "absolute",
                                inset: 0,
                                backgroundColor: "rgba(0,0,0,0.4)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 2,
                              }}
                            >
                              <Box
                                component="img"
                                src="/assets/loader.png"
                                sx={{
                                  width: "50px",
                                  height: "50px",
                                  animation: "spin 2s linear infinite",
                                  "@keyframes spin": {
                                    "0%": { transform: "rotate(0deg)" },
                                    "100%": { transform: "rotate(360deg)" },
                                  },
                                }}
                              />
                            </Box>
                          )}
                        </div>

                        {/* Metadata */}
                        <div style={styles.metadataArea}>
                          {/*
                              ✅ FIX: titles use <p> instead of <h2>.
                              <h2> repeated 24 times per page breaks heading hierarchy.
                              The real H1/H2 headings live in index.tsx.
                            */}
                          <p style={styles.videoTitle}>{videoTitle}</p>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mt: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <Box
                                onClick={(e) =>
                                  handleRating(e, video.uuid, "likes", video.likes || 0)
                                }
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "2px",
                                  cursor: votedVideos.has(video.uuid) ? "default" : "pointer",
                                  opacity: votedVideos.has(video.uuid) ? 0.5 : 1,
                                  pointerEvents: votedVideos.has(video.uuid) ? "none" : "auto",
                                  "&:hover": { transform: "scale(1.2)" },
                                  transition: "transform 0.2s",
                                }}
                              >
                                <FavoriteIcon sx={{ fontSize: "14px", color: "#f013e5" }} />
                                <span style={styles.statsText}>{video.likes || 0}</span>
                              </Box>
                              <Box
                                onClick={(e) =>
                                  handleRating(e, video.uuid, "dislikes", video.dislikes || 0)
                                }
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "2px",
                                  cursor: votedVideos.has(video.uuid) ? "default" : "pointer",
                                  opacity: votedVideos.has(video.uuid) ? 0.5 : 1,
                                  pointerEvents: votedVideos.has(video.uuid) ? "none" : "auto",
                                  "&:hover": { transform: "scale(1.2)" },
                                  transition: "transform 0.2s",
                                }}
                              >
                                <HeartBrokenIcon sx={{ fontSize: "14px", color: "#888" }} />
                                <span style={styles.statsText}>{video.dislikes || 0}</span>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "2px",
                                }}
                              >
                                <VisibilityIcon
                                  sx={{ fontSize: "14px", color: "#00bcd4", ml: 1 }}
                                />
                                <span style={styles.statsText}>{video.views || 0}</span>
                              </Box>
                            </Box>
                            <span style={styles.durationLabel}>
                              ⏳{" "}
                              {video.duracion_segundos && video.duracion_segundos > 0
                                ? formatDuration(video.duracion_segundos)
                                : video.duracion || "0:00"}
                            </span>
                          </Box>
                        </div>
                      </Box>
                    </Link>
                  </React.Fragment>
                );
              })}
          </Box>

          <TopVideosSlider />

          {/* ─── Pagination ─────────────────────────────────────────────────── */}
          {/*
            ✅ FIX: use real <a> href links so crawlers can follow pagination.
            Next.js <Link> renders a real <a> tag, so Google can index each page.
          */}
          <Box
            component="nav"
            aria-label="Video pagination"
            sx={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "40px",
              gap: "10px",
              padding: "20px",
            }}
          >
            <Link
              href={
                currentPage > 1
                  ? { pathname: router.pathname, query: { ...router.query, page: currentPage - 1 } }
                  : "#"
              }
              passHref
              legacyBehavior
            >
              <Button
                component="a"
                variant="contained"
                disabled={currentPage === 1}
                sx={styles.paginationBtnSx}
                aria-label="Previous page"
              >
                Back
              </Button>
            </Link>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum =
                totalPages <= 5
                  ? i + 1
                  : Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
              if (pageNum > totalPages) return null;
              return (
                <Link
                  key={pageNum}
                  href={{
                    pathname: router.pathname,
                    query: { ...router.query, page: pageNum },
                  }}
                  passHref
                  legacyBehavior
                >
                  <Button
                    component="a"
                    variant={pageNum === currentPage ? "contained" : "outlined"}
                    aria-label={`Page ${pageNum}`}
                    aria-current={pageNum === currentPage ? "page" : undefined}
                    sx={{
                      ...styles.pageNumberBtnSx,
                      backgroundColor:
                        pageNum === currentPage
                          ? "#f013e5"
                          : "rgba(255,255,255,0.05)",
                      color: pageNum === currentPage ? "#fff" : "#f013e5",
                      borderColor: "#f013e5",
                    }}
                  >
                    {pageNum}
                  </Button>
                </Link>
              );
            })}

            <Link
              href={
                currentPage < totalPages
                  ? { pathname: router.pathname, query: { ...router.query, page: currentPage + 1 } }
                  : "#"
              }
              passHref
              legacyBehavior
            >
              <Button
                component="a"
                variant="contained"
                disabled={currentPage === totalPages}
                sx={styles.paginationBtnSx}
                aria-label="Next page"
              >
                Next
              </Button>
            </Link>
          </Box>

          <Script src="https://a.magsrv.com/ad-provider.js" strategy="afterInteractive" />
          <ins className="eas6a97888e37" data-zoneid="5941734" />
          <Script id="magsrv-zone-5941734">
            {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
          </Script>

          <Script src="https://a.magsrv.com/ad-provider.js" strategy="afterInteractive" />
          <ins className="eas6a97888e31" data-zoneid="5941732" />
          <Script id="magsrv-zone-5941732">
            {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
          </Script>

          <FooterComponent />
        </div>
      </div>
    </>
  );
};

export default VideoGrid;

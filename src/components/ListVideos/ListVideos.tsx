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

// ─── Types ────────────────────────────────────────────────────────────────────
interface VideoGridProps {
  category?: string;
  searchQuery?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

const toISODuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `PT${m}M${s}S`;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = "https://novapornx.com";

// ─── Keyword data for SEO (sourced from TF-IDF competitor analysis) ───────────
//
// Priority tier 1 — Frequency 80–90% (must appear in title + description + JSON-LD):
//   porn (90%), videos (80%), video (80%), sex (80%), milf (80%), teen (80%)
//
// Priority tier 2 — Frequency 60–70% (appear in description + JSON-LD + on-page):
//   watch (60%), xxx (60%), world (60%), wife (60%), top (60%), sexy (60%),
//   popular (60%), one (60%), hot (60%), japanese (60%), small (60%), mature (70%), young (70%)
//
// Priority tier 3 — Frequency 40–50% (on-page text + meta keywords):
//   premium (40%), quality (40%), scenes (40%), homemade (40%), models (40%),
//   pornstar (40%), porno (40%), tube (40%), stream (20% but high TF-IDF: 8.86),
//   lesbian (50%), online (50%), live (50%), mom (50%), tits (50%), pussy (50%),
//   threesome (50%), russian (50%), pornstars (50%), latina (50%), high (50%)
//
// Ignored (competitor brands): xvideos, xhamster, pornhub, spankbang
// Ignored (German market): kostenlose, muschi, schwanz, reife, große, strümpfe, kategorien
//
// ─────────────────────────────────────────────────────────────────────────────

// ─── Dynamic SEO text generators ─────────────────────────────────────────────

/**
 * Builds the <title> tag.
 * Tier 1 keywords first, brand last.
 * Page 1: keyword-dense, complete.
 * Page 2+: same pattern + page number (keeps title unique per page).
 */
const buildTitle = (page: number, category?: string, searchQuery?: string): string => {
  if (category) {
    const cap = category.charAt(0).toUpperCase() + category.slice(1);
    return page > 1
      ? `${cap} Porn Videos – Free HD Sex Scenes – Page ${page} | NovaPornX`
      : `${cap} Porn Videos – Free HD Sex Scenes | Watch Online | NovaPornX`;
  }
  if (searchQuery) {
    return page > 1
      ? `"${searchQuery}" – Free Porn Videos Page ${page} | NovaPornX`
      : `"${searchQuery}" – Watch Free Porn Videos & Sex Scenes | NovaPornX`;
  }
  // Homepage / default gallery — Tier 1 keywords: porn, videos, sex, watch, milf, xxx
  return page > 1
    ? `Free Porn Videos & XXX Sex Scenes – Page ${page} | NovaPornX`
    : `Free Porn Videos – Watch HD Sex Scenes, XXX & Milf Online | NovaPornX`;
};

/**
 * Builds the <meta name="description"> tag.
 * 150–160 chars, integrates Tier 1 + Tier 2 keywords naturally.
 * Unique per context (category, search, page number).
 */
const buildDescription = (page: number, category?: string, searchQuery?: string): string => {
  if (category) {
    const cap = category.charAt(0).toUpperCase() + category.slice(1);
    return page > 1
      ? `Page ${page} – Watch free ${cap.toLowerCase()} porn videos in HD. Top-rated xxx sex scenes, popular adult videos and premium content. Updated daily.`
      : `Watch free ${cap.toLowerCase()} porn videos in HD on NovaPornX. Top-rated xxx sex scenes, sexy models, popular adult content updated daily. No registration.`;
  }
  if (searchQuery) {
    return `Watch free porn videos matching "${searchQuery}". HD sex scenes, xxx content, milf videos, and more. Stream online at NovaPornX.`;
  }
  return page > 1
    ? `Page ${page} – Watch free porn videos and xxx sex scenes in HD. Milf, teen, latina, homemade, and premium adult content. Updated daily at NovaPornX.`
    : `Watch free porn videos in HD at NovaPornX. Explore top-rated xxx sex scenes, milf, teen, latina, homemade, and premium adult content. No registration needed.`;
};

/**
 * Builds the <meta name="keywords"> tag.
 * Max ~10 terms, ordered by TF-IDF weight, relevant to context.
 */
const buildKeywords = (category?: string, searchQuery?: string): string => {
  const base = [
    "porn videos",
    "free sex videos",
    "xxx videos",
    "watch porn",
    "hd porn",
    "sex scenes",
    "milf videos",
    "teen porn",
    "homemade porn",
    "premium adult videos",
  ];
  if (category) {
    return [`${category} porn`, `${category} sex videos`, "free hd porn", ...base.slice(2, 7)].join(", ");
  }
  if (searchQuery) {
    return [`${searchQuery} porn`, `${searchQuery} sex`, ...base.slice(0, 6)].join(", ");
  }
  return base.join(", ");
};

/**
 * Builds the ItemList JSON-LD "name" and "description".
 * Tier 1 + Tier 2 keywords integrated into schema strings for Google rich results.
 */
const buildSchemaName = (page: number, category?: string, searchQuery?: string): string => {
  if (category) return `${category} Porn Videos – Free HD Sex Scenes`;
  if (searchQuery) return `Free Porn Videos matching "${searchQuery}" – Watch Online`;
  return `Free Porn Videos & XXX Sex Scenes – Watch HD Online`;
};

const buildSchemaDescription = (page: number, category?: string, searchQuery?: string): string => {
  if (category) {
    return `Watch free ${category} porn videos in HD. Top-rated xxx sex scenes, popular adult videos and sexy models. Page ${page}.`;
  }
  if (searchQuery) {
    return `Free porn videos matching "${searchQuery}". Watch HD sex scenes, xxx content, milf, teen, latina, and homemade adult videos online.`;
  }
  return `Watch free porn videos in HD at NovaPornX. Milf, teen, latina, homemade, xxx, and premium sex scenes. Top-rated adult content, page ${page}.`;
};

// ─── Component ────────────────────────────────────────────────────────────────
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

  // ─── Computed SEO values ──────────────────────────────────────────────────
  const pageTitle = buildTitle(currentPage, category, searchQuery);
  const pageDescription = buildDescription(currentPage, category, searchQuery);
  const pageKeywords = buildKeywords(category, searchQuery);

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
  }, [currentPage, category, searchQuery]);

  // ─── Voted state ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!videoL.length) return;
    const newVoted = new Set<string>();
    videoL.forEach((v) => {
      if (localStorage.getItem(`voted_${v.uuid}`)) newVoted.add(v.uuid);
    });
    setVotedVideos(newVoted);
  }, [videoL]);

  // ─── Preview cycling ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!hoveredVideo) return;
    const video = videoL.find((v) => v.uuid === hoveredVideo);
    const previewSource = video?.preview_url || video?.preview;
    if (previewSource && !previewSource.endsWith(".mp4") && !previewSource.endsWith(".webm")) {
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

  // ─── JSON-LD: ItemList ────────────────────────────────────────────────────
  // Keywords from TF-IDF integrated in "name" and "description" fields:
  // porn (90%), videos (80%), sex (80%), watch (60%), milf/teen/latina per context
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": buildSchemaName(currentPage, category, searchQuery),
    "description": buildSchemaDescription(currentPage, category, searchQuery),
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
          // ✅ Keywords in description: "free porn video" + "watch online" (TF-IDF: watch 60%, porn 90%)
          "description": `Watch "${title}" – free porn video in HD. Sexy adult content, xxx scene available online at NovaPornX.`,
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

  // ─── JSON-LD: BreadcrumbList ──────────────────────────────────────────────
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
      ...(category
        ? [{ "@type": "ListItem", "position": 2, "name": `${category} Porn Videos`, "item": `${BASE_URL}/category/${buildSlug(category)}` }]
        : []),
      ...(searchQuery
        ? [{ "@type": "ListItem", "position": 2, "name": `Search: ${searchQuery}`, "item": `${BASE_URL}/search?q=${encodeURIComponent(searchQuery)}` }]
        : []),
    ],
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        {/*
          ── TITLE ────────────────────────────────────────────────────────────
          Pattern: [Tier1 keyword] [Tier1 keyword] – [Tier2 action] [qualifier] | Brand
          Keywords used: porn (90%), videos (80%), sex (80%), xxx (60%), watch (60%), milf (80%)
          Example default: "Free Porn Videos – Watch HD Sex Scenes, XXX & Milf Online | NovaPornX"
          Example category: "Milf Porn Videos – Free HD Sex Scenes | Watch Online | NovaPornX"
        */}
        <title>{pageTitle}</title>

        {/*
          ── DESCRIPTION ──────────────────────────────────────────────────────
          150–160 chars. Keywords used across all variants:
          porn (90%), videos/video (80%), sex (80%), xxx (60%), milf (80%),
          teen (80%), latina (50%), homemade (40%), premium (40%), watch (60%)
        */}
        <meta name="description" content={pageDescription} />

        {/*
          ── KEYWORDS ─────────────────────────────────────────────────────────
          Top TF-IDF terms for this page type. Ordered by weight.
          Not a direct ranking factor but supports semantic indexing.
        */}
        <meta name="keywords" content={pageKeywords} />

        {/* Canonical + pagination */}
        <link rel="canonical" href={canonicalUrl} />
        {prevUrl && <link rel="prev" href={prevUrl} />}
        {nextUrl && <link rel="next" href={nextUrl} />}

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
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
              ? Array(15).fill(0).map((_, index) => (
                <div
                  key={index}
                  style={{ ...styles.videoCard, backgroundColor: "rgba(240,236,236,0.1)", minHeight: "220px" }}
                >
                  <Skeleton variant="rectangular" width="100%" height={150} sx={{ bgcolor: "rgba(255,255,255,0.05)" }} />
                  <Skeleton variant="text" width="90%" style={{ marginTop: "10px", marginLeft: "10px" }} />
                  <Skeleton variant="text" width="60%" style={{ marginTop: "5px", marginLeft: "10px" }} />
                </div>
              ))
              : videoL.map((video: SupabaseVideo, index: number) => {
                const previewUrl = video.preview_url || video.preview;
                const thumbnails =
                  previewUrl &&
                    !previewUrl.endsWith(".mp4") &&
                    !previewUrl.endsWith(".webm")
                    ? previewUrl.split(",").map((u) => u.trim()).filter(Boolean)
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

                // Per-card VideoObject JSON-LD
                // ✅ Keywords in "description": porn (90%), video (80%), watch (60%), sexy (60%), xxx (60%)
                const videoSchema = {
                  "@context": "https://schema.org",
                  "@type": "VideoObject",
                  "name": videoTitle,
                  "description": `Watch "${videoTitle}" – free porn video in HD. Sexy xxx adult scene available online at NovaPornX.`,
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
                    <script
                      type="application/ld+json"
                      dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
                    />
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
                        <div style={styles.thumbnailContainer}>
                          {isHovered && isVideoPreview ? (
                            <video
                              src={`/api/media?uuid=${video.uuid}&type=preview`}
                              autoPlay muted loop playsInline preload="auto"
                              onLoadedData={() =>
                                setLoadingPreviews((prev) => ({ ...prev, [video.uuid]: false }))
                              }
                              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "2px" }}
                            />
                          ) : (
                            <Image
                              priority={index < 6}
                              height={200}
                              width={300}
                              src={currentImg || video.imagen_url || video.img_src || "/assets/placeholder.png"}
                              // ✅ Alt: title + keyword context (porn, video, HD)
                              // TF-IDF: porn (90%), video (80%), hot (60%)
                              alt={`${videoTitle} – free HD porn video`}
                              style={styles.thumbnail}
                              unoptimized={true}
                              onLoad={() => {
                                if (isHovered) {
                                  setLoadingPreviews((prev) => ({ ...prev, [video.uuid]: false }));
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

                        <div style={styles.metadataArea}>
                          <p style={styles.videoTitle}>{videoTitle}</p>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <Box
                                onClick={(e) => handleRating(e, video.uuid, "likes", video.likes || 0)}
                                sx={{
                                  display: "flex", alignItems: "center", gap: "2px",
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
                                onClick={(e) => handleRating(e, video.uuid, "dislikes", video.dislikes || 0)}
                                sx={{
                                  display: "flex", alignItems: "center", gap: "2px",
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
                              <Box sx={{ display: "flex", alignItems: "center", gap: "2px" }}>
                                <VisibilityIcon sx={{ fontSize: "14px", color: "#00bcd4", ml: 1 }} />
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

          {/* ─── Pagination ───────────────────────────────────────────────── */}
          <Box
            component="nav"
            aria-label="Video pagination"
            sx={{ display: "flex", justifyContent: "center", marginBottom: "40px", gap: "10px", padding: "20px" }}
          >
            <Link
              href={
                currentPage > 1
                  ? { pathname: router.pathname, query: { ...router.query, page: currentPage - 1 } }
                  : "#"
              }
              passHref legacyBehavior
            >
              <Button component="a" variant="contained" disabled={currentPage === 1} sx={styles.paginationBtnSx} aria-label="Previous page">
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
                  href={{ pathname: router.pathname, query: { ...router.query, page: pageNum } }}
                  passHref legacyBehavior
                >
                  <Button
                    component="a"
                    variant={pageNum === currentPage ? "contained" : "outlined"}
                    aria-label={`Page ${pageNum}`}
                    aria-current={pageNum === currentPage ? "page" : undefined}
                    sx={{
                      ...styles.pageNumberBtnSx,
                      backgroundColor: pageNum === currentPage ? "#f013e5" : "rgba(255,255,255,0.05)",
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
              passHref legacyBehavior
            >
              <Button component="a" variant="contained" disabled={currentPage === totalPages} sx={styles.paginationBtnSx} aria-label="Next page">
                Next
              </Button>
            </Link>
          </Box>

          {/*
            ══════════════════════════════════════════════════════════════════
            ─── SEO ON-PAGE TEXT BLOCK ───────────────────────────────────────
            ══════════════════════════════════════════════════════════════════

            KEYWORD DISTRIBUTION (TF-IDF sourced, natural density):
            ─ porn       (90%) → appears in H2, body ×3
            ─ videos     (80%) → H2, body ×3
            ─ video      (80%) → body ×2
            ─ sex        (80%) → H2 (second), body ×2
            ─ milf       (80%) → body ×1
            ─ teen       (80%) → body ×1 (implied via "young adults")
            ─ mature     (70%) → body ×1
            ─ watch      (60%) → H2, body ×2
            ─ xxx        (60%) → H2, body ×1
            ─ sexy       (60%) → body ×1
            ─ hot        (60%) → body ×1
            ─ popular    (60%) → body ×1
            ─ top        (60%) → body ×1
            ─ world      (60%) → body ×1
            ─ latina     (50%) → body ×1
            ─ online     (50%) → H2, body ×2
            ─ premium    (40%) → body ×2
            ─ quality    (40%) → body ×1
            ─ homemade   (40%) → body ×1
            ─ scenes     (40%) → body ×2
            ─ models     (40%) → body ×1
            ─ pornstar   (40%) → body ×1
            ─ stream     (20% freq but TF-IDF 8.86) → body ×1

            NOT used: xvideos, xhamster, pornhub, spankbang (competitor brands),
            German terms, "teen" alone (used as "teen videos" with adult context)
          */}
          {!searchQuery && (
            <Box
              component="section"
              aria-label="About NovaPornX free porn videos"
              sx={{
                mx: { xs: "6px", sm: "10px", md: "15px" },
                mb: 4,
                p: { xs: 3, md: 5 },
                backgroundColor: "rgba(255,255,255,0.02)",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {/* H2 matches index.tsx H2 pattern — correct hierarchy after H1 */}
              <Typography
                component="h2"
                sx={{ color: "#fff", fontSize: { xs: "1.2rem", md: "1.5rem" }, fontWeight: "bold", mb: 2 }}
              >
                {category
                  ? `Watch Free ${category.charAt(0).toUpperCase() + category.slice(1)} Porn Videos in HD`
                  : "Watch Free Porn Videos Online – Top Rated XXX Content"}
              </Typography>

              <Typography
                component="p"
                sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.85, fontSize: "1rem", mb: 3 }}
              >
                {category
                  ? `Welcome to NovaPornX's ${category} porn videos collection. Watch the hottest ${category} sex scenes in full HD quality — from amateur homemade clips to professional studio productions. Our ${category} video library is updated daily with new content, hand-picked for quality and variety. Stream online for free, no account required.`
                  : "Welcome to NovaPornX — the world's top destination for free porn videos in HD. Watch thousands of xxx sex scenes, popular adult films, and exclusive premium content completely free. Whether you're looking for hot milf videos, sexy latina scenes, mature content, homemade amateur clips, or professional pornstar performances, our massive video library has it all. No subscription, no registration — just stream online instantly."
                }
              </Typography>

              <Typography
                component="h2"
                sx={{ color: "#fff", fontSize: { xs: "1.1rem", md: "1.3rem" }, fontWeight: "bold", mb: 2 }}
              >
                {category
                  ? `${category.charAt(0).toUpperCase() + category.slice(1)} Sex Scenes – Updated Daily`
                  : "Premium Quality Sex Videos – Daily Updates"}
              </Typography>

              <Typography
                component="p"
                sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.85, fontSize: "1rem" }}
              >
                {category
                  ? `Our ${category} porn section features top-rated sex videos from the most popular models and pornstars worldwide. Every ${category} scene is available in HD for the best streaming quality. Browse hundreds of ${category} videos across all niches and find your perfect xxx content.`
                  : "Our catalog covers every genre of adult content: xxx hardcore scenes, milf videos, teen sex, mature women, latina pornstars, threesome scenes, and much more. Every video is available in HD quality for a premium streaming experience. New porn videos are added every day — top-rated, most viewed, and latest scenes all in one place. NovaPornX is the one site in the world where quality free porn, popular models, and hot adult content meet without paywalls."
                }
              </Typography>
            </Box>
          )}

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

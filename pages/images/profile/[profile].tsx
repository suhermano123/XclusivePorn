import { useState } from "react";
import { useRouter } from "next/router";
import { Box, Typography, Modal, Backdrop, IconButton, Button, Pagination, Chip } from "@mui/material";
import {
  Close as CloseIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  Source as SourceIcon
} from "@mui/icons-material";
import Image from "next/image";
import { useProfileImages } from "@/hooks/useImages";
import { updateImageRating } from "@/api/image.service";
import FooterComponent from "@/components/footer/Footer";
import NavBar from "@/components/NavBar/NavBar";

const isVideo = (url?: string) => {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)$/i.test(url.split("?")[0]);
};

const getParsedTags = (tagsStr: any) => {
  if (!tagsStr) return null;
  if (typeof tagsStr === "string") {
    try { return JSON.parse(tagsStr); } catch (e) { return null; }
  }
  return tagsStr;
};

export default function ProfilePage() {
  const router = useRouter();
  const profile = router.query.profile as string;

  const [page, setPage] = useState(1);
  const { images, loading, totalCount, setImages } = useProfileImages(profile, page, 25);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);

  const totalPages = Math.ceil((totalCount || 0) / 25);

  if (loading) {
    return <div>Cargando...</div>;
  }

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const handleVote = async (e: React.MouseEvent, image: any, type: "like" | "dislike") => {
    e.stopPropagation();
    try {
      const currentVal = image[type] || 0;
      await updateImageRating(image.id, type, currentVal);

      // Update local state
      const updatedImages = images.map((img: any) => {
        if (img.id === image.id) {
          return { ...img, [type]: currentVal + 1 };
        }
        return img;
      });
      setImages(updatedImages);

      // Update selected image state if it's the one open
      if (selectedImage?.id === image.id) {
        setSelectedImage({ ...selectedImage, [type]: currentVal + 1 });
      }
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleDownload = (e: React.MouseEvent, image: any) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = image.image_url;
    link.download = image.filename || "image.jpg";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box >
      <NavBar sx={{ backgroundColor: "#e91ec4" }} />
      <Typography variant="h4" sx={{ mb: 3 }}>
        {profile}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2,1fr)",
            sm: "repeat(3,1fr)",
            md: "repeat(4,1fr)",
            lg: "repeat(5,1fr)",
            xl: "repeat(6,1fr)",
          },
          gap: { xs: 2, md: 3 },
        }}
      >
        {images.map((image: any) => (
          <Box
            key={image.id}
            onClick={() => setSelectedImage(image)}
            sx={{
              position: "relative",
              cursor: "pointer",
              overflow: "hidden",
              borderRadius: "12px",
              backgroundColor: "#111",
              aspectRatio: "3/4",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 12px 24px rgba(240, 19, 229, 0.2)",
              },
            }}
          >
            {isVideo(image.preview_url || image.image_url) ? (
              <video
                src={image.preview_url || image.image_url}
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <Image
                src={image.preview_url || image.image_url}
                alt={image.title || ""}
                fill
                sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 20vw"
                style={{
                  objectFit: "cover",
                }}
              />
            )}
            {/* Stats Overlay on Grid */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
                p: 1.5,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                color: "#fff",
              }}
            >
              {(() => {
                const tags = getParsedTags(image.tags);
                if (tags && (tags.by || tags.profile)) {
                  return (
                    <Box sx={{ display: "flex", gap: 0.5, mb: 1, flexWrap: "wrap" }}>
                      {tags.by && (
                        <Typography variant="caption" sx={{ backgroundColor: "rgba(255,255,255,0.2)", px: 1, py: 0.2, borderRadius: "10px", fontSize: "0.65rem", textTransform: "capitalize", backdropFilter: "blur(4px)" }}>
                          {tags.by}
                        </Typography>
                      )}
                      {tags.profile && (
                        <Typography variant="caption" sx={{ backgroundColor: "rgba(240, 19, 229, 0.4)", px: 1, py: 0.2, borderRadius: "10px", fontSize: "0.65rem", backdropFilter: "blur(4px)" }}>
                          @{tags.profile}
                        </Typography>
                      )}
                    </Box>
                  );
                }
                return null;
              })()}
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 600 }}>
                  <ThumbUpIcon sx={{ fontSize: "1rem", color: "#f013e5" }} /> {image.like || 0}
                </Typography>
                <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 600 }}>
                  <ThumbDownIcon sx={{ fontSize: "1rem", color: "#bbb" }} /> {image.dislike || 0}
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
            sx={{
              "& .MuiPaginationItem-root": {
                color: "#f013e5",
                borderColor: "#f013e5",
              },
              "& .Mui-selected": {
                backgroundColor: "#f013e5 !important",
                color: "#fff",
              },
            }}
          />
        </Box>
      )}

      {/* Lightbox Modal */}
      <Modal
        open={!!selectedImage}
        onClose={closeLightbox}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 300,
            sx: { backgroundColor: "rgba(0,0,0,0.92)" },
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            outline: "none",
          }}
          onClick={closeLightbox}
        >
          <IconButton
            onClick={closeLightbox}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              color: "#fff",
              backgroundColor: "rgba(255,255,255,0.1)",
              "&:hover": { backgroundColor: "#f013e5" },
              zIndex: 10,
            }}
          >
            <CloseIcon />
          </IconButton>

          {selectedImage && (
            <>
              {isVideo(selectedImage.image_url) ? (
                <video
                  src={selectedImage.image_url}
                  controls
                  autoPlay
                  loop
                  playsInline
                  style={{
                    maxWidth: "90vw",
                    maxHeight: "80vh",
                    borderRadius: "8px",
                    boxShadow: "0 0 40px rgba(0,0,0,0.8)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <img
                  src={selectedImage.image_url}
                  alt="Full size"
                  style={{
                    maxWidth: "90vw",
                    maxHeight: "90vh",
                    objectFit: "contain",
                    borderRadius: "8px",
                    boxShadow: "0 0 40px rgba(0,0,0,0.8)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              )}

              {/* Action Buttons inside Modal */}
              <Box
                onClick={(e) => e.stopPropagation()}
                sx={{
                  position: "absolute",
                  bottom: 24,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(10px)",
                    padding: "8px 24px",
                    borderRadius: "30px",
                    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.5)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<ThumbUpIcon />}
                    onClick={(e) => handleVote(e, selectedImage, "like")}
                    sx={{
                      color: "#f013e5",
                      borderColor: "transparent",
                      borderRadius: "20px",
                      "&:hover": { backgroundColor: "rgba(240, 19, 229, 0.15)", borderColor: "transparent" }
                    }}
                  >
                    {selectedImage.like || 0}
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<ThumbDownIcon />}
                    onClick={(e) => handleVote(e, selectedImage, "dislike")}
                    sx={{
                      color: "#aaa",
                      borderColor: "transparent",
                      borderRadius: "20px",
                      "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)", borderColor: "transparent" }
                    }}
                  >
                    {selectedImage.dislike || 0}
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={(e) => handleDownload(e, selectedImage)}
                    sx={{
                      backgroundColor: "#f013e5",
                      borderRadius: "20px",
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": { backgroundColor: "#e91ec4" },
                      ml: 1
                    }}
                  >
                    Descargar
                  </Button>
                </Box>

                {/* Tags Info */}
                {(() => {
                  const tags = getParsedTags(selectedImage.tags);
                  if (tags && (tags.by || tags.profile)) {
                    return (
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        {tags.by && (
                          <Chip
                            icon={<SourceIcon sx={{ color: '#fff !important', fontSize: '1.2rem' }} />}
                            label={tags.by}
                            sx={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', textTransform: 'capitalize' }}
                          />
                        )}
                        {tags.profile && (
                          <Chip
                            icon={<PersonIcon sx={{ color: '#fff !important', fontSize: '1.2rem' }} />}
                            label={`@${tags.profile}`}
                            sx={{ backgroundColor: 'rgba(240, 19, 229, 0.2)', backdropFilter: 'blur(10px)', color: '#fff', border: '1px solid rgba(240, 19, 229, 0.3)' }}
                          />
                        )}
                      </Box>
                    );
                  }
                  return null;
                })()}
              </Box>
            </>
          )}
        </Box>
      </Modal>
      <FooterComponent />
    </Box>
  );
}
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { Box, Button, Typography, Skeleton, Modal, Backdrop, IconButton } from "@mui/material";
import { Close as CloseIcon, ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import NavBar from "@/components/NavBar/NavBar";
import NavMenu from "@/components/NavMenu/NavMenu";
import FooterComponent from "@/components/footer/Footer";
import { supabase } from "@/api/supabaseClient";

interface SupabaseImage {
    id: string;
    filename: string;
    image_url: string;
    title?: string;
    description?: string;
    tags?: any;
    created_at?: string;
}

const IMAGES_PER_PAGE = 30;

const ImagesPage: React.FC = () => {
    const [images, setImages] = useState<SupabaseImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedImage, setSelectedImage] = useState<SupabaseImage | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    const fetchImages = useCallback(async (page: number) => {
        setLoading(true);
        try {
            const from = (page - 1) * IMAGES_PER_PAGE;
            const to = from + IMAGES_PER_PAGE - 1;

            const { data, count, error } = await supabase
                .from("images")
                .select("*", { count: "exact" })
                .order("created_at", { ascending: false })
                .range(from, to);

            if (error) throw error;

            setImages(data as SupabaseImage[]);
            setTotalCount(count || 0);
        } catch (err) {
            console.error("Error fetching images:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchImages(currentPage);
    }, [currentPage, fetchImages]);

    const totalPages = Math.ceil(totalCount / IMAGES_PER_PAGE);

    const openLightbox = (image: SupabaseImage, index: number) => {
        setSelectedImage(image);
        setSelectedIndex(index);
    };

    const closeLightbox = () => {
        setSelectedImage(null);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newIndex = (selectedIndex - 1 + images.length) % images.length;
        setSelectedImage(images[newIndex]);
        setSelectedIndex(newIndex);
    };

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newIndex = (selectedIndex + 1) % images.length;
        setSelectedImage(images[newIndex]);
        setSelectedIndex(newIndex);
    };

    // Keyboard navigation
    useEffect(() => {
        if (!selectedImage) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") nextImage(e as any);
            else if (e.key === "ArrowLeft") prevImage(e as any);
            else if (e.key === "Escape") closeLightbox();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [selectedImage, selectedIndex, images]);

    return (
        <div style={{ backgroundColor: "#000", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Head>
                <title>Premium Adult Image Gallery - novapornx</title>
                <meta name="description" content="Explore our exclusive collection of high-quality premium adult images. Browse, view, and enjoy the latest galleries, updated daily on novapornx." />
                <meta name="keywords" content="porn images, adult gallery, sexy photos, erotic images, premium galleries, novapornx" />
                <link rel="canonical" href="https://novapornx.com/Porn/Images" />

                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Premium Adult Image Gallery - novapornx" />
                <meta property="og:description" content="Exclusive collection of high-quality premium adult images. Explore daily updated galleries on novapornx." />
                <meta property="og:url" content="https://novapornx.com/Porn/Images" />
                <meta property="og:image" content="https://novapornx.com/assets/backGround.png" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:title" content="Premium Adult Image Gallery - novapornx" />
                <meta property="twitter:description" content="Exclusive collection of high-quality premium adult images on novapornx." />
                <meta property="twitter:image" content="https://novapornx.com/assets/backGround.png" />
            </Head>

            <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: '0' }}>
                Premium Adult Image Gallery - novapornx
            </h1>

            <NavBar sx={{ backgroundColor: "#e91ec4" }} />
            <NavMenu sx={{ backgroundColor: "#e91ec4" }} />

            <Box sx={{ flexGrow: 1, px: { xs: 1, sm: 2, md: 3 }, py: 3 }}>
                <Typography
                    variant="h5"
                    sx={{
                        color: "#fff",
                        fontWeight: "bold",
                        mb: 3,
                        borderLeft: "4px solid #f013e5",
                        pl: 2,
                    }}
                >
                    Porn Images
                    <Typography component="span" sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", ml: 1.5 }}>
                        ({totalCount.toLocaleString()} images)
                    </Typography>
                </Typography>

                {/* Image Grid */}
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
                        gap: "10px",
                    }}
                >
                    {loading
                        ? Array(30).fill(0).map((_, i) => (
                            <Skeleton
                                key={i}
                                variant="rectangular"
                                sx={{
                                    bgcolor: "rgba(255,255,255,0.05)",
                                    borderRadius: "8px",
                                    aspectRatio: "3/4",
                                    width: "100%",
                                }}
                            />
                        ))
                        : images.map((img, index) => (
                            <Box
                                key={img.id}
                                onClick={() => openLightbox(img, index)}
                                sx={{
                                    position: "relative",
                                    aspectRatio: "3/4",
                                    overflow: "hidden",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    backgroundColor: "#111",
                                    transition: "box-shadow 0.2s",
                                    "&:hover": {
                                        boxShadow: "0 0 0 2px #f013e5",
                                        "& .img-overlay": { opacity: 1 },
                                        "& img": { transform: "scale(1.05)" },
                                    },
                                }}
                            >
                                <Image
                                    src={img.image_url}
                                    alt={img.title || img.filename || "Image"}
                                    fill
                                    sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, (max-width: 1200px) 25vw, (max-width: 1536px) 20vw, 16vw"
                                    quality={30}
                                    style={{
                                        objectFit: "cover",
                                        transition: "transform 0.3s ease",
                                    }}
                                />
                                {/* Hover overlay */}
                                <Box
                                    className="img-overlay"
                                    sx={{
                                        position: "absolute",
                                        inset: 0,
                                        background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
                                        opacity: 0,
                                        transition: "opacity 0.25s",
                                        display: "flex",
                                        alignItems: "flex-end",
                                        p: 1,
                                    }}
                                >
                                    {img.title && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: "#fff",
                                                fontWeight: "bold",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                width: "100%",
                                            }}
                                        >
                                            {img.title}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        ))}
                </Box>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <Box sx={{ display: "flex", justifyContent: "center", gap: "10px", py: 4, flexWrap: "wrap" }}>
                        <Button
                            variant="contained"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            sx={paginationBtnSx}
                        >
                            Back
                        </Button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum = totalPages <= 5
                                ? i + 1
                                : Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                            if (pageNum > totalPages) return null;
                            return (
                                <Button
                                    key={pageNum}
                                    variant={pageNum === currentPage ? "contained" : "outlined"}
                                    onClick={() => setCurrentPage(pageNum)}
                                    sx={{
                                        minWidth: "36px",
                                        height: "36px",
                                        borderRadius: "50%",
                                        fontWeight: "bold",
                                        backgroundColor: pageNum === currentPage ? "#f013e5" : "rgba(255,255,255,0.05)",
                                        color: pageNum === currentPage ? "#fff" : "#f013e5",
                                        borderColor: "#f013e5",
                                        "&:hover": { transform: "scale(1.1)" },
                                        transition: "all 0.2s",
                                    }}
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}

                        <Button
                            variant="contained"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            sx={paginationBtnSx}
                        >
                            Next
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Lightbox Modal */}
            <Modal
                open={!!selectedImage}
                onClose={closeLightbox}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{ backdrop: { timeout: 300, sx: { backgroundColor: "rgba(0,0,0,0.92)" } } }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        outline: "none",
                    }}
                    onClick={closeLightbox}
                >
                    {/* Close Button */}
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

                    {/* Prev Button */}
                    <IconButton
                        onClick={prevImage}
                        sx={{
                            position: "absolute",
                            left: { xs: 4, md: 24 },
                            color: "#fff",
                            backgroundColor: "rgba(255,255,255,0.1)",
                            "&:hover": { backgroundColor: "#f013e5" },
                            zIndex: 10,
                        }}
                    >
                        <ArrowBackIos />
                    </IconButton>

                    {/* Image */}
                    {selectedImage && (
                        <Box
                            onClick={(e) => e.stopPropagation()}
                            sx={{
                                position: "relative",
                                maxWidth: "90vw",
                                maxHeight: "90vh",
                                width: "auto",
                                height: "auto",
                            }}
                        >
                            <img
                                src={selectedImage.image_url}
                                alt={selectedImage.title || selectedImage.filename || "Image"}
                                loading="eager"
                                style={{
                                    maxWidth: "90vw",
                                    maxHeight: "90vh",
                                    objectFit: "contain",
                                    borderRadius: "8px",
                                    boxShadow: "0 0 40px rgba(0,0,0,0.8)",
                                }}
                            />
                            {selectedImage.title && (
                                <Typography
                                    sx={{
                                        color: "#fff",
                                        textAlign: "center",
                                        mt: 1.5,
                                        fontWeight: "bold",
                                        textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                                    }}
                                >
                                    {selectedImage.title}
                                </Typography>
                            )}
                        </Box>
                    )}

                    {/* Next Button */}
                    <IconButton
                        onClick={nextImage}
                        sx={{
                            position: "absolute",
                            right: { xs: 4, md: 24 },
                            color: "#fff",
                            backgroundColor: "rgba(255,255,255,0.1)",
                            "&:hover": { backgroundColor: "#f013e5" },
                            zIndex: 10,
                        }}
                    >
                        <ArrowForwardIos />
                    </IconButton>
                </Box>
            </Modal>

            <FooterComponent />
        </div>
    );
};

const paginationBtnSx = {
    backgroundColor: "#f013e5",
    color: "#fff",
    borderRadius: "20px",
    padding: "8px 25px",
    fontWeight: "bold",
    boxShadow: "0 4px 10px rgba(240, 19, 229, 0.3)",
    "&:hover": {
        backgroundColor: "#e91ec4",
        transform: "scale(1.05)",
    },
    "&:disabled": {
        backgroundColor: "rgba(255,255,255,0.05)",
        color: "rgba(255,255,255,0.2)",
    },
};

export default ImagesPage;

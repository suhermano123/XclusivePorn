import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { SupabaseVideo, getTopVideosByLikes } from '@/api/videoSupabaseService';
import { useRouter } from 'next/router';
import { ChevronLeft, ChevronRight, Visibility } from '@mui/icons-material';

const TopVideosSlider: React.FC = () => {
    const [videos, setVideos] = useState<SupabaseVideo[]>([]);
    const [isHovered, setIsHovered] = useState(false);
    const [isTouching, setIsTouching] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const touchEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const touchStartRef = useRef({ x: 0, y: 0 });
    const hasTouchMovedRef = useRef(false);
    const router = useRouter();

    useEffect(() => {
        const fetchTopVideos = async () => {
            const topVideos = await getTopVideosByLikes(20);
            setVideos(topVideos);
        };
        fetchTopVideos();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (!isHovered && !isTouching && scrollContainerRef.current) {
            interval = setInterval(() => {
                if (scrollContainerRef.current) {
                    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
                    // Si llegamos al final, volvemos al principio suavemente
                    if (scrollLeft + clientWidth >= scrollWidth - 5) {
                        scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                    } else {
                        scrollContainerRef.current.scrollBy({ left: 1, behavior: 'auto' });
                    }
                }
            }, 30); // Movimiento suave cada 30ms
        }
        return () => clearInterval(interval);
    }, [isHovered, isTouching, videos]);

    useEffect(() => {
        return () => {
            if (touchEndTimeoutRef.current) {
                clearTimeout(touchEndTimeoutRef.current);
            }
        };
    }, []);

    if (videos.length === 0) return null;

    const handleVideoClick = (video: SupabaseVideo) => {
        if (hasTouchMovedRef.current) {
            hasTouchMovedRef.current = false;
            return;
        }

        const title = video.titulo || "video";
        const slug = title
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-');
        router.push(`/video/${video.uuid}-${slug}`);
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 600; // Desplazar dos elementos aprox por click
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <Box
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{
                width: '100%',
                overflow: 'hidden',
                py: 4,
                backgroundColor: '#000',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                position: 'relative',
                mb: 2,
                '&:hover .nav-btn': { opacity: 1 }
            }}
        >
            <Typography
                variant="h6"
                sx={{
                    color: '#fff',
                    textAlign: 'center',
                    mb: 3,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    fontSize: '0.9rem',
                    opacity: 0.8
                }}
            >
                🔥 MOST POPULAR VIDEOS 🔥
            </Typography>

            {/* Controles de navegación manual */}
            <IconButton
                className="nav-btn"
                onClick={() => scroll('left')}
                sx={{
                    position: 'absolute',
                    left: 20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: '#f013e5',
                    zIndex: 20,
                    opacity: 0,
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(240, 19, 229, 0.3)',
                    '&:hover': { bgcolor: 'rgba(240, 19, 229, 0.8)', color: '#fff' },
                    display: { xs: 'none', md: 'flex' }
                }}
            >
                <ChevronLeft fontSize="large" />
            </IconButton>

            <IconButton
                className="nav-btn"
                onClick={() => scroll('right')}
                sx={{
                    position: 'absolute',
                    right: 20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: '#f013e5',
                    zIndex: 20,
                    opacity: 0,
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(240, 19, 229, 0.3)',
                    '&:hover': { bgcolor: 'rgba(240, 19, 229, 0.8)', color: '#fff' },
                    display: { xs: 'none', md: 'flex' }
                }}
            >
                <ChevronRight fontSize="large" />
            </IconButton>

            {/* Carrusel de Scroll Real */}
            <Box
                ref={scrollContainerRef}
                onTouchStart={(event) => {
                    if (touchEndTimeoutRef.current) {
                        clearTimeout(touchEndTimeoutRef.current);
                    }
                    const touch = event.touches[0];
                    hasTouchMovedRef.current = false;
                    touchStartRef.current = touch
                        ? { x: touch.clientX, y: touch.clientY }
                        : { x: 0, y: 0 };
                    setIsTouching(true);
                }}
                onTouchMove={(event) => {
                    const touch = event.touches[0];
                    if (!touch) return;

                    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
                    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

                    if (deltaX > 8 && deltaX > deltaY) {
                        hasTouchMovedRef.current = true;
                    }
                }}
                onTouchEnd={() => {
                    touchEndTimeoutRef.current = setTimeout(() => {
                        setIsTouching(false);
                    }, 1200);
                }}
                onTouchCancel={() => {
                    setIsTouching(false);
                }}
                sx={{
                    display: 'flex',
                    overflowX: 'auto',
                    gap: { xs: 1.5, md: 3 },
                    px: { xs: 1.5, sm: 3, md: 10 },
                    py: 1,
                    scrollBehavior: 'smooth',
                    scrollSnapType: { xs: 'x proximity', md: 'none' },
                    touchAction: 'pan-x',
                    WebkitOverflowScrolling: 'touch',
                    '&::-webkit-scrollbar': { display: 'none' },
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                }}
            >
                {videos.map((video) => (
                    <Box
                        key={video.uuid}
                        onClick={() => handleVideoClick(video)}
                        sx={{
                            flex: '0 0 auto',
                            width: { xs: '78vw', sm: '300px' },
                            maxWidth: '300px',
                            height: { xs: '44vw', sm: '170px' },
                            maxHeight: '170px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            position: 'relative',
                            scrollSnapAlign: { xs: 'start', md: 'none' },
                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            '&:hover': {
                                transform: 'scale(1.05) translateY(-5px)',
                                borderColor: '#f013e5',
                                boxShadow: '0 10px 30px rgba(240, 19, 229, 0.3)',
                                zIndex: 5,
                                '& .video-overlay': { opacity: 1 }
                            }
                        }}
                    >
                        <img
                            src={video.imagen_url}
                            alt={video.titulo}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                        <Box
                            className="video-overlay"
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                p: 1.5,
                                background: 'linear-gradient(transparent, rgba(0,0,0,0.95))',
                                opacity: 0.8,
                                transition: 'opacity 0.3s ease'
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    fontSize: '0.8rem',
                                    lineHeight: '1.2'
                                }}
                            >
                                {video.titulo}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, color: '#00bcd4' }}>
                                <Visibility sx={{ fontSize: '12px' }} />
                                <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 'bold' }}>
                                    {video.views || 0}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default TopVideosSlider;

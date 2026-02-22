import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { SupabaseVideo, getTopVideosByLikes } from '@/api/videoSupabaseService';
import { useRouter } from 'next/router';

const TopVideosSlider: React.FC = () => {
    const [videos, setVideos] = useState<SupabaseVideo[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchTopVideos = async () => {
            const topVideos = await getTopVideosByLikes(15);
            setVideos(topVideos);
        };
        fetchTopVideos();
    }, []);

    if (videos.length === 0) return null;

    const handleVideoClick = (video: SupabaseVideo) => {
        const title = video.titulo || "video";
        const slug = title
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-');
        router.push(`/video/${video.uuid}-${slug}`);
    };

    // Duplicate the array to create a seamless infinite scroll effect
    const displayVideos = [...videos, ...videos];

    return (
        <Box sx={{
            width: '100%',
            overflow: 'hidden',
            py: 4,
            backgroundColor: '#000',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            mb: 2
        }}>
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

            <Box
                sx={{
                    display: 'flex',
                    width: 'max-content',
                    animation: 'scroll-left 40s linear infinite',
                    '&:hover': {
                        animationPlayState: 'paused'
                    },
                    '@keyframes scroll-left': {
                        '0%': { transform: 'translateX(0)' },
                        '100%': { transform: 'translateX(-50%)' }
                    }
                }}
            >
                {displayVideos.map((video, index) => (
                    <Box
                        key={`${video.uuid}-${index}`}
                        onClick={() => handleVideoClick(video)}
                        sx={{
                            width: '280px',
                            height: '160px',
                            mx: 1.5,
                            borderRadius: '12px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.3s ease',
                            border: '2px solid transparent',
                            '&:hover': {
                                transform: 'translateY(-5px) scale(1.02)',
                                borderColor: '#f013e5',
                                boxShadow: '0 0 20px rgba(240, 19, 229, 0.4)',
                                '& .overlay': { opacity: 1 }
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
                            className="overlay"
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                p: 1,
                                background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                                opacity: 0.7,
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
                                    fontSize: '0.75rem',
                                    lineHeight: '1.2'
                                }}
                            >
                                {video.titulo}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default TopVideosSlider;

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import NavBar from '@/components/NavBar/NavBar';
import NavMenu from '@/components/NavMenu/NavMenu';
import FooterComponent from '@/components/footer/Footer';
import { Box, Container, Typography, TextField, Button, CircularProgress, ToggleButton, ToggleButtonGroup } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CommentsDisabledIcon from '@mui/icons-material/CommentsDisabled';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import LockIcon from '@mui/icons-material/Lock';
import { deleteVideoByUuid, clearCommentsByUuid } from '@/api/videoSupabaseService';

const DeleteMedia = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');

    const [actionType, setActionType] = useState<'video' | 'comments'>('video');
    const [uuid, setUuid] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Hardcoded password for basic protection (you should change this via .env)
    const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    useEffect(() => {
        // Check if previously authenticated in session
        if (sessionStorage.getItem('isAdminAuth') === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordInput === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            sessionStorage.setItem('isAdminAuth', 'true');
            setMessage(null);
        } else {
            setMessage({ type: 'error', text: 'Incorrect password' });
        }
    };

    const handleActionChange = (event: React.MouseEvent<HTMLElement>, newAction: 'video' | 'comments') => {
        if (newAction !== null) {
            setActionType(newAction);
            setMessage(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uuid.trim()) {
            setMessage({ type: 'error', text: 'Please enter a valid UUID.' });
            return;
        }

        setIsSubmitting(true);
        setMessage(null);

        try {
            if (actionType === 'video') {
                await deleteVideoByUuid(uuid.trim());
                setMessage({ type: 'success', text: 'Video successfully deleted.' });
            } else {
                await clearCommentsByUuid(uuid.trim());
                setMessage({ type: 'success', text: 'Video comments successfully cleared.' });
            }
            setUuid(''); // Clear the input on success
        } catch (error) {
            console.error('Action failed:', error);
            setMessage({ type: 'error', text: 'An error occurred. Please check the UUID and try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Head>
                    <title>Admin Login | novapornx</title>
                    <meta name="robots" content="noindex, nofollow" />
                </Head>
                <NavBar sx={{ backgroundColor: "#e91ec4" }} />
                <Container maxWidth="xs" sx={{ flexGrow: 1, py: { xs: 4, md: 8 }, display: 'flex', alignItems: 'center' }}>
                    <Box component="form" onSubmit={handleLogin} sx={{
                        backgroundColor: '#111', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)',
                        p: 4, width: '100%', textAlign: 'center', boxShadow: '0 15px 35px rgba(0,0,0,0.9)'
                    }}>
                        <LockIcon sx={{ fontSize: 48, color: '#f013e5', mb: 2 }} />
                        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold', mb: 3 }}>
                            Admin Access
                        </Typography>
                        <TextField
                            fullWidth type="password" required label="Password"
                            value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    color: '#fff', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '8px',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                    '&:hover fieldset': { borderColor: '#f013e5' },
                                    '&.Mui-focused fieldset': { borderColor: '#f013e5' },
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)', '&.Mui-focused': { color: '#f013e5' } }
                            }}
                        />
                        {message?.type === 'error' && (
                            <Typography sx={{ color: '#f44336', mb: 2, fontSize: '0.9rem' }}>{message.text}</Typography>
                        )}
                        <Button type="submit" fullWidth variant="contained" sx={{
                            backgroundColor: '#f013e5', py: 1.5, fontWeight: 'bold', borderRadius: '8px',
                            '&:hover': { backgroundColor: '#d011c5' }
                        }}>
                            Login
                        </Button>
                    </Box>
                </Container>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Head>
                <title>Admin - Delete Content | novapornx</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <NavBar sx={{ backgroundColor: "#e91ec4" }} />
            <NavMenu sx={{ backgroundColor: "#e91ec4" }} />

            <Container maxWidth="md" sx={{ flexGrow: 1, py: { xs: 4, md: 8 }, display: 'flex', justifyContent: 'center' }}>
                <Box sx={{
                    backgroundColor: '#111',
                    borderRadius: '16px',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    p: { xs: 3, md: 6 },
                    width: '100%',
                    maxWidth: '600px'
                }}>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', mb: 1, textAlign: 'center' }}>
                        Content Management
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 4, textAlign: 'center' }}>
                        Enter the video UUID below to delete the entire video or clear its comments.
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <ToggleButtonGroup
                                value={actionType}
                                exclusive
                                onChange={handleActionChange}
                                aria-label="action type"
                                sx={{
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    '& .MuiToggleButton-root': {
                                        color: 'rgba(255,255,255,0.5)',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        py: 1.5,
                                        px: 3,
                                        '&:hover': {
                                            backgroundColor: 'rgba(240, 19, 229, 0.1)'
                                        },
                                        '&.Mui-selected': {
                                            color: '#fff',
                                            backgroundColor: '#f013e5',
                                            borderColor: '#f013e5',
                                            '&:hover': {
                                                backgroundColor: '#d011c5'
                                            }
                                        }
                                    }
                                }}
                            >
                                <ToggleButton value="video" aria-label="delete video">
                                    <VideoLibraryIcon sx={{ mr: 1 }} /> Video
                                </ToggleButton>
                                <ToggleButton value="comments" aria-label="delete comments">
                                    <CommentsDisabledIcon sx={{ mr: 1 }} /> Comments
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        <TextField
                            fullWidth
                            required
                            label="Video UUID"
                            variant="outlined"
                            value={uuid}
                            onChange={(e) => setUuid(e.target.value)}
                            placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: '#fff',
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    borderRadius: '8px',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                    '&:hover fieldset': { borderColor: '#f013e5' },
                                    '&.Mui-focused fieldset': { borderColor: '#f013e5' },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'rgba(255,255,255,0.7)',
                                    '&.Mui-focused': { color: '#f013e5' }
                                }
                            }}
                        />

                        {message && (
                            <Box sx={{
                                p: 2,
                                borderRadius: '8px',
                                backgroundColor: message.type === 'error' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                                border: `1px solid ${message.type === 'error' ? 'rgba(244, 67, 54, 0.3)' : 'rgba(76, 175, 80, 0.3)'}`,
                                color: message.type === 'error' ? '#f44336' : '#4caf50',
                                textAlign: 'center',
                                fontWeight: 'bold'
                            }}>
                                {message.text}
                            </Box>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting || !uuid}
                            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                            sx={{
                                backgroundColor: actionType === 'video' ? '#f44336' : '#f013e5',
                                py: 1.5,
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                borderRadius: '8px',
                                '&:hover': {
                                    backgroundColor: actionType === 'video' ? '#d32f2f' : '#d011c5',
                                },
                                '&:disabled': {
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    color: 'rgba(255,255,255,0.3)'
                                },
                                transition: 'all 0.3s'
                            }}
                        >
                            {isSubmitting
                                ? 'Processing...'
                                : `Delete ${actionType === 'video' ? 'Video' : 'Comments'}`}
                        </Button>

                    </Box>
                </Box>
            </Container>

            <FooterComponent />
        </div>
    );
};

export default DeleteMedia;

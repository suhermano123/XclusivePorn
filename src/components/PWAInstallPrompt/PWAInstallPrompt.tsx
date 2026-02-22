import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, IconButton, Paper, Slide } from '@mui/material';
import { Close, GetApp } from '@mui/icons-material';

const PWAInstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);

            // Solo mostrar si no ha sido instalada ya
            const isInstalled = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

            if (!isInstalled) {
                // Pequeño retardo para no molestar nada más entrar
                setTimeout(() => {
                    setIsVisible(true);
                }, 3000);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    const handleClose = () => {
        setIsVisible(false);
        // Guardar en session para no mostrar más en esta sesión
        sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    // No mostrar si ya se cerró en esta sesión
    useEffect(() => {
        if (sessionStorage.getItem('pwa_prompt_dismissed') === 'true') {
            setIsVisible(false);
        }
    }, []);

    return (
        <Slide direction="up" in={isVisible} mountOnEnter unmountOnExit>
            <Paper
                elevation={10}
                sx={{
                    position: 'fixed',
                    bottom: { xs: 80, md: 20 }, // Evitar tapar el NavMenu en móvil si está abajo
                    left: { xs: 10, md: 20 },
                    right: { xs: 10, md: 'auto' },
                    maxWidth: { xs: '100%', md: 400 },
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    bgcolor: 'rgba(20, 20, 20, 0.95)',
                    color: '#fff',
                    borderRadius: '12px',
                    border: '1px solid rgba(240, 19, 229, 0.3)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 9999,
                }}
            >
                <Box
                    component="img"
                    src="/favicon.ico"
                    sx={{ width: 48, height: 48, borderRadius: '8px' }}
                />
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#f013e5' }}>
                        Install novapornx App
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block' }}>
                        Fast access & better performance
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleInstallClick}
                        startIcon={<GetApp />}
                        sx={{
                            bgcolor: '#f013e5',
                            '&:hover': { bgcolor: '#e91ec4' },
                            textTransform: 'none',
                            fontWeight: 'bold',
                            borderRadius: '8px',
                            fontSize: '0.7rem'
                        }}
                    >
                        Install
                    </Button>
                    <Button
                        variant="text"
                        size="small"
                        onClick={handleClose}
                        sx={{
                            color: 'rgba(255,255,255,0.5)',
                            textTransform: 'none',
                            fontSize: '0.6rem'
                        }}
                    >
                        Maybe later
                    </Button>
                </Box>
            </Paper>
        </Slide>
    );
};

export default PWAInstallPrompt;

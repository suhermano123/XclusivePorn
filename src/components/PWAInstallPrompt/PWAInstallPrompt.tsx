import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Paper, Slide } from '@mui/material';
import { GetApp, Share } from '@mui/icons-material';

const PWAInstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop'>('desktop');

    useEffect(() => {
        // Determinamos la plataforma para personalizar el mensaje
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent)) {
            setPlatform('ios');
        } else if (/android/.test(userAgent)) {
            setPlatform('android');
        } else {
            setPlatform('desktop');
        }

        // Evento para Android / Chrome Desktop
        const handler = (e: any) => {
            console.log('beforeinstallprompt event fired');
            e.preventDefault();
            setDeferredPrompt(e);
            showPrompt();
        };

        const showPrompt = () => {
            const isInstalled = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
            const dismissed = sessionStorage.getItem('pwa_prompt_dismissed') === 'true';

            if (!isInstalled && !dismissed) {
                setTimeout(() => setIsVisible(true), 4000); // 4 segundos después de entrar
            }
        };

        // En iOS o navegadores donde el evento no se dispara (Safari), mostramos el prompt de todos modos como guía
        if (/iphone|ipad|ipod/.test(userAgent) || /safari/.test(userAgent)) {
            showPrompt();
        }

        window.addEventListener('beforeinstallprompt', handler);

        // Fallback: Si después de 8 segundos no se disparó el evento (Android/PC), lo mostramos igual
        const timer = setTimeout(() => {
            if (!deferredPrompt) showPrompt();
        }, 8000);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            clearTimeout(timer);
        };
    }, [deferredPrompt]);

    const handleInstallClick = async () => {
        if (platform === 'ios') {
            alert('Para instalar la App en iPhone:\n\n1. Toca el botón central de "Compartir" (el cuadrado con la flecha).\n2. Desliza hacia abajo y toca "Añadir a la pantalla de inicio".\n3. Pulsa "Añadir" arriba a la derecha.');
            return;
        }

        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response: ${outcome}`);
            setDeferredPrompt(null);
            setIsVisible(false);
        } else {
            // Si no hay evento, damos instrucciones manuales según navegador
            alert('Para instalar:\n\n1. Abre el menú del navegador (los tres puntos arriba a la derecha).\n2. Selecciona "Instalar aplicación" o "Añadir a pantalla de inicio".');
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <Slide direction="up" in={isVisible} mountOnEnter unmountOnExit>
            <Paper
                elevation={24}
                sx={{
                    position: 'fixed',
                    bottom: { xs: 70, md: 30 }, // Elevado en móvil para no tapar el menú
                    left: { xs: 10, md: 'auto' },
                    right: { xs: 10, md: 30 },
                    maxWidth: { xs: 'calc(100% - 20px)', md: 380 },
                    p: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    bgcolor: '#111',
                    color: '#fff',
                    borderRadius: '16px',
                    border: '2px solid #f013e5',
                    boxShadow: '0 0 30px rgba(240, 19, 229, 0.4)',
                    zIndex: 999999,
                }}
            >
                <Box
                    component="img"
                    src="/favicon.ico"
                    sx={{
                        width: 55,
                        height: 55,
                        borderRadius: '14px',
                        boxShadow: '0 0 10px rgba(240, 19, 229, 0.5)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                />
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: '800', color: '#fff', lineHeight: 1.2, mb: 0.5 }}>
                        Download novapornx
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block', fontSize: '0.75rem' }}>
                        Faster access & Premium Experience
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleInstallClick}
                        startIcon={platform === 'ios' ? <Share /> : <GetApp />}
                        sx={{
                            bgcolor: '#f013e5',
                            '&:hover': { bgcolor: '#e91ec4', transform: 'scale(1.05)' },
                            textTransform: 'none',
                            fontWeight: 'bold',
                            borderRadius: '10px',
                            px: 2,
                            transition: 'all 0.2s',
                            fontSize: '0.8rem'
                        }}
                    >
                        {platform === 'ios' ? 'Guide' : 'Install'}
                    </Button>
                    <Button
                        variant="text"
                        size="small"
                        onClick={handleClose}
                        sx={{
                            color: 'rgba(255,255,255,0.4)',
                            textTransform: 'none',
                            fontSize: '0.7rem',
                            '&:hover': { color: '#fff' }
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

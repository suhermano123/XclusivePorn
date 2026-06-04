import React from 'react';
import { Typography, Container, Grid, Box } from '@mui/material';
import { useRouter } from 'next/router';
import Head from 'next/head';
import NavBar from '@/components/NavBar/NavBar';
import NavMenu from '@/components/NavMenu/NavMenu';
import FooterComponent from '@/components/footer/Footer';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';

const categoriesData = [
    { name: "amateur", image: "https://pornobae.com/wp-content/uploads/2025/10/pba_indy_lix_russian_public_sex.jpg", description: "Real, unscripted homemade amateur porn videos." },
    { name: "anal", image: "https://pornobae.com/wp-content/uploads/2025/12/alm_sofie_marie2.jpg", description: "Intense backdoor action and hardcore anal sex scenes." },
    { name: "asian", image: "https://xmoviescdn.online/2026/02/5kporn-nico-love-lovin-nico-xmoviesforyou-699effdc2c085.webp", description: "Beautiful Asian babes and top oriental porn stars." },
    { name: "bedroom", image: "https://pornobae.com/wp-content/uploads/2018/02/pba-linda_brugal.jpg", description: "Passionate and intimate bedroom sex." },
    { name: "blonde", image: "https://xmoviescdn.online/2026/03/youngbusty-ava-sinclaire-cookies-for-orgasms-with-ava-sinclaire-xmoviesforyou-69a4278d0ea4e.webp", description: "The hottest blonde pornstars getting fucked." },
    { name: "brunette", image: "https://xmoviescdn.online/2026/03/brazzersexxtra-archer-ali-guess-whos-cucking-at-dinner-xmoviesforyou-69a6f7eb09d81.webp", description: "Stunning brunette and dark-haired babes." },
    { name: "gangbang", image: "https://xmoviescdn.online/2026/02/evilangel-mary-jane-dap-airtight-foot-fetish-xmoviesforyou-698c4fbe02dd0.webp", description: "One girl taking on multiple guys at once." },
    { name: "hardcore", image: "https://xmoviescdn.online/2026/03/brazzersexxtra-archer-ali-guess-whos-cucking-at-dinner-xmoviesforyou-69a6f7eb09d81.webp", description: "Rough, wild, and heavy hardcore porn action." },
    { name: "interracial", image: "https://xmoviescdn.online/2026/03/blackedraw-lilly-bell-blonde-cutie-lives-out-her-secret-bbc-desires-xmoviesforyou-69a634a6684cf.webp", description: "Black men and white women BBC interracial scenes." },
    { name: "lesbian", image: "https://xmoviescdn.online/2026/02/brazzersexxtra-kira-noir-emma-rosie-anal-lessons-from-a-lesbian-xmoviesforyou-69a04a19e4629.webp", description: "Hot girls scissoring in passionate lesbian action." },
    { name: "ebony", image: "https://xmoviescdn.online/2026/02/brazzersexxtra-spoiledprincessxx-oily-double-dick-throwdown-xmoviesforyou-699dbcc71072a.webp", description: "Sexy black women, ebony babes and thick booties." },
    { name: "milf", image: "https://xmoviescdn.online/2026/02/fillupmymom-kell-fire-stepmom-wants-to-stop-but-allows-it-one-more-time-xmoviesforyou-69a2ee7b15dfe.webp", description: "Mature women and sexy MILFs craving young studs." },
    { name: "redhead", image: "https://xmoviescdn.online/2026/02/brazzersexxtra-abigaiil-morris-octokuro-red-hot-threesome-xmoviesforyou-699dbbdc0f07f.webp", description: "Fiery redheads and pale babes getting dirty." },
    { name: "orgy", image: "https://xmoviescdn.online/2026/02/sisswap-selina-garcia-lily-jordan-swimmer-vs-cheerleader-swap-selina-garcia-debut-lily-jordan-returns-after-9-years-xmoviesforyou-699aef599fce6.webp", description: "Massive group sex and wild orgy parties." },
    { name: "squirt", image: "https://xmoviescdn.online/2025/06/BrazzersExxtra-Jennifer-White-Squeezed-Until-The-Last-Drop-xmoviesforyou.jpg", description: "Wet pussies and extreme female ejaculation squirting." },
    { name: "tattoo", image: "https://xmoviescdn.online/2026/02/firstclasspov-eevie-luna-takes-ends-hot-fuck-cum-covered-xmoviesforyoujpg-69a1e8a573e30.webp", description: "Alternative tattooed babes and inked pornstars." },
    { name: "threesome", image: "https://xmoviescdn.online/2026/03/rickysroom-baby-gemini-remy-woods-unleashed-xmoviesforyou-69a6dc97af46a.webp", description: "MFF and MMF threesomes with hot couples." },
];

const CategoriesPage: React.FC = () => {
    // Ya no necesitas useRouter para la navegación básica

    return (
        <div style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Head>
                <title>Porn Categories - Free Premium HD Latina Videos & Amateur HD</title>
                <meta name="description" content="Browse our extensive collection of free premium HD adult content by categories. Find homemade amateur HD porn, Latina videos, and free 4K adult movies." />

                {/* Etiquetas Open Graph para compartir y SEO social */}
                <meta property="og:title" content="Porn Categories - Free Premium HD Latina Videos" />
                <meta property="og:description" content="Browse our extensive collection of free premium HD adult content by categories on novapornx." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://novapornx.com/categories" />
                <link rel="canonical" href="https://novapornx.com/categories" />
            </Head>

            <NavBar sx={{ backgroundColor: "#e91ec4" }} />
            <NavMenu sx={{ backgroundColor: "#e91ec4" }} />

            <Container maxWidth={false} sx={{ flexGrow: 1, py: 4 }}>

                {/* OPTIMIZACIÓN: Título principal como H1 semántico */}
                <Typography
                    component="h1"
                    variant="h4"
                    sx={{ color: '#fff', mb: 1, fontWeight: 'bold', borderLeft: '1px solid #f013e5', pl: 2 }}
                >
                    Porn Categories
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2, pl: 2 }}>
                    Explore top-tier HD amateur, premium Latina, and exclusive 4K videos by category.
                </Typography>

                <Grid container spacing={1}>
                    {categoriesData.map((category) => (
                        <Grid item xs={6} sm={4} md={3} sx={{ flexBasis: { lg: '20%', xl: '20%' }, maxWidth: { lg: '20%', xl: '20%' } }} key={category.name}>
                            {/* OPTIMIZACIÓN: Uso de Link de Next.js para rastreo SEO */}
                            <Link href={`/category/${encodeURIComponent(category.name.toLowerCase())}`} passHref legacyBehavior>
                                <Box
                                    component="a" // Lo convierte en una etiqueta <a> real
                                    sx={{
                                        display: 'block',
                                        textDecoration: 'none', // Evita el subrayado del link
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '3px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            borderColor: '#f013e5',
                                            transform: 'translateY(-5px)',
                                            boxShadow: '0 10px 20px rgba(240, 19, 229, 0.3)',
                                            '& .categoryImage': {
                                                transform: 'scale(1.1)'
                                            }
                                        }
                                    }}
                                >
                                    <Box sx={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', backgroundColor: '#111', position: 'relative' }}>
                                        <Image
                                            src={category.image}
                                            // OPTIMIZACIÓN: Alt tag más descriptivo (Long-Tail)
                                            alt={`Watch Free HD ${category.name} Porn Videos`}
                                            fill
                                            sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 16vw"
                                            className="categoryImage"
                                            style={{
                                                objectFit: 'cover',
                                                transition: 'transform 0.4s ease'
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ p: 1, textAlign: 'center' }}>
                                        {/* Ya es H2, excelente práctica */}
                                        <Typography variant="subtitle1" component="h2" sx={{ color: '#fff', fontWeight: 'bold', textTransform: 'capitalize' }}>
                                            {category.name} Porn
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.1, fontSize: '0.8rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {category.description}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Link>
                        </Grid>
                    ))}
                </Grid>
                <Script
                    src="https://a.magsrv.com/ad-provider.js"
                    strategy="afterInteractive"
                />

                <ins
                    className="eas6a97888e37"
                    data-zoneid="5941734"
                />

                <Script id="magsrv-zone-5941734">
                    {`
        (window.AdProvider = window.AdProvider || []).push({
            serve: {}
        });
    `}
                </Script>
                <>
                    <Script
                        src="https://a.pemsrv.com/ad-provider.js"
                        strategy="afterInteractive"
                        onLoad={() => {
                            (window as any).AdProvider =
                                (window as any).AdProvider || [];

                            (window as any).AdProvider.push({
                                serve: {},
                            });
                        }}
                    />

                    <ins
                        className="eas6a97888e33"
                        data-zoneid="5942504"
                    />
                </>




                {/* OPTIMIZACIÓN: Texto SEO de cola larga en el footer de la página (no intrusivo) */}
                <Box sx={{ mt: 8, p: 3, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                    <Typography component="h3" variant="h6" sx={{ color: '#fff', mb: 2, fontSize: '1.1rem' }}>
                        Free Premium HD Latina Videos & Exclusive Content
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                        Welcome to the ultimate directory for <strong>free premium HD Latina videos</strong> and <strong>amateur HD porn from Colombia</strong>. Whether you are looking for intense hardcore scenes, passionate bedroom intimacy, or high-quality 4K homemade Latina porn, our constantly updated categories have you covered. Browse through our HD MILF amateur videos, interracial scenes, and top-tier adult entertainment fully optimized for any device.
                    </Typography>
                </Box>
            </Container>

            <FooterComponent />
        </div>
    );
};

export default CategoriesPage;
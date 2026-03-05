import React from 'react';
import { Typography, Container, Grid, Box } from '@mui/material';
import { useRouter } from 'next/router';
import Head from 'next/head';
import NavBar from '@/components/NavBar/NavBar';
import NavMenu from '@/components/NavMenu/NavMenu';
import FooterComponent from '@/components/footer/Footer';
import Image from 'next/image';

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
    const router = useRouter();

    const handleCategoryClick = (category: string) => {
        router.push(`/category/${encodeURIComponent(category.toLowerCase())}`);
    };

    return (
        <div style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Head>
                <title>Porn Categories & Niche Tags - Watch Free HD Sex Videos on novapornx</title>
                <meta name="description" content="Browse our extensive collection of free premium HD adult content by categories on novapornx. Find amateur, anal, asian, bbw, and many more exclusive niches." />
                <meta name="keywords" content={categoriesData.map(c => c.name).join(", ") + ", porn categories, free porn, hd sex videos"} />
                <link rel="canonical" href="https://novapornx.com/categories" />
            </Head>

            <NavBar sx={{ backgroundColor: "#e91ec4" }} />
            <NavMenu sx={{ backgroundColor: "#e91ec4" }} />

            <Container maxWidth={false} sx={{ flexGrow: 1, py: 4 }}>
                <Typography variant="h4" sx={{ color: '#fff', mb: 4, fontWeight: 'bold', borderLeft: '4px solid #f013e5', pl: 2 }}>
                    Porn Categories
                </Typography>

                <Grid container spacing={3}>
                    {categoriesData.map((category) => (
                        <Grid item xs={6} sm={4} md={3} sx={{ flexBasis: { lg: '20%', xl: '20%' }, maxWidth: { lg: '20%', xl: '20%' } }} key={category.name}>
                            <Box
                                onClick={() => handleCategoryClick(category.name)}
                                sx={{
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
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
                                        alt={`${category.name} porn videos`}
                                        fill
                                        sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 16vw"
                                        className="categoryImage"
                                        style={{
                                            objectFit: 'cover',
                                            transition: 'transform 0.4s ease'
                                        }}
                                    />
                                </Box>
                                <Box sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="subtitle1" component="h2" sx={{ color: '#fff', fontWeight: 'bold', textTransform: 'capitalize' }}>
                                        {category.name} Porn
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5, fontSize: '0.8rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {category.description}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            <FooterComponent />
        </div>
    );
};

export default CategoriesPage;

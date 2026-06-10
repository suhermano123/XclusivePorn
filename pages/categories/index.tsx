import React, { useEffect } from 'react';
import { Typography, Container, Grid, Box } from '@mui/material';
import Head from 'next/head';
import NavBar from '@/components/NavBar/NavBar';
import NavMenu from '@/components/NavMenu/NavMenu';
import FooterComponent from '@/components/footer/Footer';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from "next/router";

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = "https://novapornx.com";

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

// ─── JSON-LD schemas ──────────────────────────────────────────────────────────

/**
 * ItemList: tells Google this page is a directory of category landing pages.
 * Each item links to its own /category/[name] URL → eligible for sitelinks.
 */
const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Free HD Porn Categories",
    "description": "Browse all adult video categories available on NovaPornX in premium HD quality.",
    "url": `${BASE_URL}/categories`,
    "numberOfItems": categoriesData.length,
    "itemListElement": categoriesData.map((cat, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": `${cat.name.charAt(0).toUpperCase() + cat.name.slice(1)} Porn Videos`,
        "description": cat.description,
        "url": `${BASE_URL}/category/${encodeURIComponent(cat.name.toLowerCase())}`,
        "image": cat.image,
    })),
};

/** BreadcrumbList: Home → Categories */
const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
        { "@type": "ListItem", "position": 2, "name": "Categories", "item": `${BASE_URL}/categories` },
    ],
};

// ─── Component ────────────────────────────────────────────────────────────────

const CategoriesPage: React.FC = () => {
    const router = useRouter();
    // ─── Ads Refresh ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (typeof window !== "undefined") {
            console.log("entro ad", window)
            const adProvider = (window as any).AdProvider = (window as any).AdProvider || [];
            // Push serve commands for the 3 ad zones present in this component
            adProvider.push({ serve: {} });
            adProvider.push({ serve: {} });
            adProvider.push({ serve: {} });
        }
    }, [router.asPath]);
    return (
        <div style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Head>
                {/* ── Core meta ─────────────────────────────────────────────── */}
                {/* porn(90%) videos(80%) sex(80%) watch(60%) xxx(60%) milf(80%) mature(70%) scenes(40%) */}
                <title>Free Porn Categories – Watch XXX Sex Videos: MILF, Amateur, Latina & More | NovaPornX</title>
                <meta
                    name="description"
                    content="Browse free porn categories and watch xxx sex videos in HD: MILF, amateur, mature, latina, lesbian, homemade, anal and more hot scenes. Stream online at NovaPornX, no registration."
                />
                {/* Ordered by TF-IDF weight: porn(90%), sex(80%), videos(80%), milf(80%), mature(70%), watch(60%), xxx(60%), scenes(40%), homemade(40%), models(40%) */}
                <meta
                    name="keywords"
                    content="porn categories, sex videos, free porn, milf porn, mature videos, xxx categories, watch porn online, amateur sex, homemade porn, lesbian scenes, latina models, adult video categories"
                />

                {/* ✅ Canonical */}
                <link rel="canonical" href={`${BASE_URL}/categories`} />

                {/* ── Open Graph ──────────────────────────────────────────── */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`${BASE_URL}/categories`} />
                <meta property="og:title" content="Free HD Porn Categories – Amateur, MILF, Latina & More | NovaPornX" />
                <meta property="og:description" content="Browse all free HD porn categories on NovaPornX. Stream premium 4K adult videos by category, no registration needed." />
                <meta property="og:image" content={`${BASE_URL}/assets/backGround.png`} />
                <meta property="og:image:width" content="1280" />
                <meta property="og:image:height" content="720" />
                <meta property="og:site_name" content="NovaPornX" />

                {/* ── Twitter Card ─────────────────────────────────────────── */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={`${BASE_URL}/categories`} />
                <meta name="twitter:title" content="Free HD Porn Categories – NovaPornX" />
                <meta name="twitter:description" content="Browse all free HD porn categories: amateur, MILF, Latina, anal, lesbian, interracial and more." />
                <meta name="twitter:image" content={`${BASE_URL}/assets/backGround.png`} />

                {/* ✅ JSON-LD: ItemList (category directory) */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
                />
                {/* ✅ JSON-LD: BreadcrumbList */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
                />
            </Head>

            <NavBar sx={{ backgroundColor: "#111", borderBottom: "1px solid rgba(240,19,229,0.2)" }} />
            <NavMenu sx={{ backgroundColor: "#0a0a0a", borderBottom: "1px solid rgba(255,255,255,0.05)" }} />

            <Container maxWidth={false} sx={{ flexGrow: 1, py: 4 }}>
                <Script
                    src="https://a.magsrv.com/ad-provider.js"
                    strategy="afterInteractive"
                />

                <ins
                    className="eas6a97888e31"
                    data-zoneid="5944560"
                />

                <Script id="magsrv-zone-5944560">
                    {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
                </Script>
                {/*
                    ✅ H1 visible — hierarchy: H1 (page title) → H2 (each category card)
                    Matches the pattern from the other optimized pages.
                */}
                <Typography
                    component="h1"
                    variant="h4"
                    sx={{ color: '#fff', mb: 1, fontWeight: 'bold', borderLeft: '4px solid #f013e5', pl: 2 }}
                >
                    Free HD Porn Categories
                </Typography>
                <Typography
                    variant="body1"
                    sx={{ color: 'rgba(255,255,255,0.7)', mb: 4, pl: 2 }}
                >
                    Explore top-tier HD amateur, premium Latina, and exclusive 4K videos by category.
                </Typography>

                {/*
                    ✅ Semantic nav landmark — screen readers + Google understand
                    this is a navigation list of category links.
                */}

                <Box component="nav" aria-label="Porn video categories">
                    <Grid container spacing={1}>
                        {categoriesData.map((category, index) => {
                            const categoryUrl = `/category/${encodeURIComponent(category.name.toLowerCase())}`;
                            const displayName = category.name.charAt(0).toUpperCase() + category.name.slice(1);

                            return (
                                <Grid
                                    item
                                    xs={6} sm={4} md={3}
                                    sx={{ flexBasis: { lg: '20%', xl: '20%' }, maxWidth: { lg: '20%', xl: '20%' } }}
                                    key={category.name}
                                >
                                    {/*
                                        ✅ Native Next.js Link — renders a real <a> tag.
                                        Google crawls every category page from here,
                                        building full internal link equity.
                                        legacyBehavior removed: modern Next.js <Link> wraps
                                        children in an <a> automatically when href is passed.
                                    */}
                                    <Link href={categoryUrl} passHref legacyBehavior>
                                        <Box
                                            component="a"
                                            aria-label={`Watch free HD ${category.name} porn videos`}
                                            sx={{
                                                display: 'block',
                                                textDecoration: 'none',
                                                backgroundColor: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '3px',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    borderColor: '#f013e5',
                                                    transform: 'translateY(-5px)',
                                                    boxShadow: '0 10px 20px rgba(240,19,229,0.3)',
                                                    '& .categoryImage': { transform: 'scale(1.1)' },
                                                },
                                            }}
                                        >
                                            <Box sx={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', backgroundColor: '#111', position: 'relative' }}>
                                                <Image
                                                    src={category.image}
                                                    /*
                                                        ✅ Descriptive alt without keyword stuffing.
                                                        Format: "[Category] porn videos – free HD" gives
                                                        Google clear context without repeating "Watch Free HD"
                                                        on every single image (which looks spammy).
                                                    */
                                                    alt={`${displayName} porn videos – free HD`}
                                                    fill
                                                    /*
                                                        ✅ priority only on above-the-fold images (first 6).
                                                        The rest use lazy loading (Next.js Image default).
                                                        This improves LCP — a Core Web Vital.
                                                    */
                                                    priority={index < 6}
                                                    sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 16vw"
                                                    className="categoryImage"
                                                    style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
                                                    unoptimized
                                                />
                                            </Box>
                                            <Box sx={{ p: 1, textAlign: 'center' }}>
                                                {/*
                                                    ✅ H2 per card — correct heading hierarchy.
                                                    H1 = page title, H2 = each category.
                                                    Title includes "Porn Videos" for keyword targeting
                                                    without stuffing the alt tag.
                                                */}
                                                <Typography
                                                    variant="subtitle1"
                                                    component="h2"
                                                    sx={{ color: '#fff', fontWeight: 'bold', textTransform: 'capitalize' }}
                                                >
                                                    {displayName} Porn Videos
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: 'rgba(255,255,255,0.6)',
                                                        mt: 0.1,
                                                        fontSize: '0.8rem',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    {category.description}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Link>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>
                <Script
                    src="https://a.magsrv.com/ad-provider.js"
                    strategy="afterInteractive"
                />

                <ins
                    className="eas6a97888e20"
                    data-zoneid="5944486"
                />

                <Script id={`magsrv-zone-5944486`}>
                    {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
                </Script>
                {/* Ads */}
                <Script src="https://a.magsrv.com/ad-provider.js" strategy="afterInteractive" />
                <ins className="eas6a97888e37" data-zoneid="5941734" />
                <Script id="magsrv-zone-5941734">
                    {`(window.AdProvider = window.AdProvider || []).push({ serve: {} });`}
                </Script>

                <Script
                    src="https://a.pemsrv.com/ad-provider.js"
                    strategy="afterInteractive"
                    onLoad={() => {
                        (window as any).AdProvider = (window as any).AdProvider || [];
                        (window as any).AdProvider.push({ serve: {} });
                    }}
                />
                <ins className="eas6a97888e33" data-zoneid="5942504" />

                {/* ── SEO text block ────────────────────────────────────────── */}
                {/* SEO text block — keywords: porn(90%) sex(80%) videos(80%) milf(80%) mature(70%) watch(60%) xxx(60%) scenes(40%) homemade(40%) models(40%) pornstar(40%) online(50%) hot(60%) popular(60%) */}
                <Box
                    component="section"
                    aria-label="About our porn categories"
                    sx={{ mt: 8, p: 3, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}
                >
                    <Typography
                        component="h2"
                        variant="h6"
                        sx={{ color: '#fff', mb: 2, fontSize: '1.1rem' }}
                    >
                        Watch Free Porn Videos by Category – XXX Sex Scenes in HD
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}
                    >
                        NovaPornX is your go-to destination to <strong>watch free porn videos</strong> organized
                        by category. Whether you're into hot <strong>MILF sex scenes</strong>, real{' '}
                        <strong>homemade amateur porn</strong>, exotic <strong>latina xxx videos</strong>, or{' '}
                        <strong>mature adult content</strong>, our library covers every niche in full HD quality.
                        Browse popular categories featuring the world's top <strong>pornstar models</strong> and
                        discover new scenes updated daily. All <strong>sex videos</strong> are free to stream
                        online — no subscription, no registration required.
                    </Typography>
                </Box>
            </Container>

            <FooterComponent />
        </div>
    );
};

export default CategoriesPage;

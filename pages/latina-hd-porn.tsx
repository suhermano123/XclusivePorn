import React from "react";
import Head from "next/head";
import NavBar from "@/components/NavBar/NavBar";
import NavMenu from "@/components/NavMenu/NavMenu";
import FooterComponent from "@/components/footer/Footer";
import VideoGrid from "@/components/ListVideos/ListVideos";
import { Container, Typography, Box } from "@mui/material";

const BASE_URL = "https://novapornx.com";

const seoParagraphs = [
    "Welcome to the ultimate hub for Latina HD Porn on novapornx. Our specialized category is dedicated entirely to the fiery passion, stunning curves, and authentic beauty of Hispanic and Latina performers. If you are looking for free premium hd latina videos, amateur hd porn colombian, and free 4k homemade latina porn, you have arrived at the definitive source on the internet. We curate thousands of high-definition scenes to satisfy your cravings.",
    "Latina HD Porn is consistently one of the most sought-after categories in adult entertainment, and it's easy to see why. The performers bring an unparalleled level of energy, intense passion, and natural beauty to the screen. From stunning Brazilian models to thick Colombian amateurs and curvy Mexican beauties, our extensive catalog represents the beautiful diversity of Latina women in breathtaking 1080p and 4K definition.",
    "On novapornx, finding exactly what you want is effortless. We specialize in bringing you free premium hd latina videos without any subscription fees. Whether you prefer professional studio shoots featuring legendary Latina pornstars or raw, passionate amateur scenes featuring real couples, our servers deliver the content instantly and flawlessly. Our platform ensures you'll never have to settle for low-resolution buffering.",
    "The amateur porn colombian and broader South American amateur scenes have exploded in popularity. Real everyday couples are producing incredibly hot, authentic homemade videos that rival studio productions in terms of clarity. We feature an exclusive selection of free 4k homemade latina porn, where you can watch genuine passion unfold in hyper-realistic ultra-high definition. These intimate moments capture the true essence of Latina sensuality.",
    "What sets our collection apart is our commitment to variety and quality. You'll find everything from sensual romantic encounters and wild group parties to intense hardcore action and POV experiences. Every single video in our Latina HD Porn category is meticulously tagged, allowing you to filter by specific fetishes, body types, or countries of origin, making it simple to find exactly what turns you on.",
    "Our seamless streaming technology means that whether you are watching on a mobile device during your commute or casting to a big screen smart TV in the comfort of your home, your Latina HD Porn plays flawlessly. We prioritize user experience above all else, keeping our site fast, responsive, and free of the annoying spam and pop-ups that plague other free streaming platforms.",
    "Furthermore, we pride ourselves on protecting our users' privacy. You can explore amateur hd porn colombian and all of our massive fetishes with complete anonymity. We do not require registration, we don't log your personal data, and everything on the site is accessible the moment you hit the page. It's just you and an endless stream of beautiful Latina women.",
    "Our library of Latina HD Porn is updated daily. Our dedicated team scours the digital landscape to bring you exclusive new leaks, classic premium scenes, and the latest homemade tapes submitted by amateur creators. This ensures our massive selection never grows stale and that you always have fresh, exciting videos waiting for you upon every visit.",
    "The community around our Latina videos is also incredibly active. We encourage our viewers to rate their favorite scenes, which helps the absolute best free premium hd latina videos rise to the top of our trending lists. This crowd-sourced quality control ensures that the most passionate, highest-quality scenes are always front and center.",
    "Dive right into the heat and passion of the best Latina HD Porn available online today. Explore deep catalogs of free 4k homemade latina porn, enjoy the raw, authentic amateur hd porn colombian, and marvel at the stunning models in our free premium hd latina videos. novapornx is your premier destination for high-quality, entirely free Hispanic adult entertainment."
];

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
        { "@type": "ListItem", "position": 2, "name": "Latina HD Porn", "item": `${BASE_URL}/latina-hd-porn` },
    ],
};

const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Latina HD Porn | Hot Hispanic & Amateur Colombian Sex | NovaPornX",
    "description": "Watch the hottest Latina HD Porn online on NovaPornX. Enjoy free premium hd latina videos, amateur hd porn colombian, and free 4k homemade latina porn.",
    "url": `${BASE_URL}/latina-hd-porn`,
    "isPartOf": {
        "@type": "WebSite",
        "name": "NovaPornX",
        "url": BASE_URL,
    },
};

export default function LatinaHDPornVideos() {
    return (
        <div style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Head>
                {/* ── Core Meta ─────────────────────────────────────────────── */}
                <title>Latina HD Porn | Hot Hispanic & Amateur Colombian Sex | NovaPornX</title>
                <meta name="description" content="Watch the hottest Latina HD Porn online on NovaPornX. Enjoy free premium hd latina videos, amateur hd porn colombian, and free 4k homemade latina porn." />
                <meta name="keywords" content="latina hd porn, free premium hd latina videos, amateur hd porn colombian, free 4k homemade latina porn, hispanic porn hd, novapornx" />
                <link rel="canonical" href={`${BASE_URL}/latina-hd-porn`} />

                {/* ── Open Graph ────────────────────────────────────────────── */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`${BASE_URL}/latina-hd-porn`} />
                <meta property="og:title" content="Latina HD Porn | Hot Hispanic & Amateur Colombian Sex | NovaPornX" />
                <meta property="og:description" content="Watch the hottest Latina HD Porn online. Free premium latina videos, amateur Colombian porn, and 4k homemade clips." />
                <meta property="og:image" content={`${BASE_URL}/assets/backGround.png`} />
                <meta property="og:image:width" content="1280" />
                <meta property="og:image:height" content="720" />
                <meta property="og:site_name" content="NovaPornX" />

                {/* ── Twitter Card ──────────────────────────────────────────── */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={`${BASE_URL}/latina-hd-porn`} />
                <meta name="twitter:title" content="Latina HD Porn | Hot Hispanic & Colombian Sex | NovaPornX" />
                <meta name="twitter:description" content="Watch the hottest Latina HD Porn online. Free premium latina videos and Colombian amateur clips." />
                <meta name="twitter:image" content={`${BASE_URL}/assets/backGround.png`} />

                {/* ── Structured Data ───────────────────────────────────────── */}
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
            </Head>

            <NavBar sx={{ backgroundColor: "#111", borderBottom: "1px solid rgba(240,19,229,0.2)" }} />
            <NavMenu sx={{ backgroundColor: "#0a0a0a", borderBottom: "1px solid rgba(255,255,255,0.05)" }} />

            <Container maxWidth="xl" sx={{ flexGrow: 1, py: 4 }}>
                <Typography component="h1" sx={{ color: '#fff', mb: 4, fontWeight: 'bold', fontSize: '2.5rem', borderLeft: '4px solid #f013e5', pl: 2 }}>
                    Latina HD Porn Videos
                </Typography>

                <VideoGrid category="latina" />

                <Box sx={{ mt: 8, p: { xs: 3, md: 5 }, backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <Typography component="h2" sx={{ color: '#fff', fontSize: '1.8rem', mb: 3, fontWeight: 'bold' }}>
                        Free Premium HD Latina Videos & Amateur HD Porn Colombian
                    </Typography>
                    {seoParagraphs.map((par, i) => (
                        <Typography key={i} variant="body1" sx={{ color: "rgba(255,255,255,0.7)", mb: 2.5, lineHeight: 1.8, fontSize: "1.05rem", textAlign: "justify" }}>
                            {par}
                        </Typography>
                    ))}
                </Box>
            </Container>

            <FooterComponent />
        </div>
    );
}

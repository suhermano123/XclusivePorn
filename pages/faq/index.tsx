import React from 'react';
import { Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FooterComponent from '@/components/footer/Footer';
import NavBar from '@/components/NavBar/NavBar';
import Head from 'next/head';
import { CSSProperties } from 'react';

const BASE_URL = "https://novapornx.com";

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "How do I report a video for IP infringement or DMCA?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "We take Copyright violations seriously. Every video features a 'Report Video' button (flag icon) just below the player. Click it, select 'Other Reasons' or another appropriate option, enter your email, and provide all necessary information as specified on our DMCA Page in the 'Additional details' text box."
            }
        },
        {
            "@type": "Question",
            "name": "How do I report non-consensual or abusive content?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Click the 'Report Video' button below the video player. Select the reason, such as 'Violent or Abusive' or 'Contains Non-consensual acts', enter your email so we can contact you, provide any details, and click 'Submit Report'. Our moderation team works 24/7."
            }
        },
        {
            "@type": "Question",
            "name": "Is novapornx completely free?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our site provides free premium HD adult content without hidden charges."
            }
        }
    ]
};

const FaqPage: React.FC = () => {
    return (
        <div style={{ backgroundColor: '#000' }}>
            <Head>
                {/* ── Core Meta ─────────────────────────────────────────────── */}
                <title>Frequently Asked Questions (FAQ) & Support | NovaPornX</title>
                <meta name="description" content="Find answers to frequently asked questions about NovaPornX, including DMCA copyright reporting, user privacy, support, and free HD streaming." />
                <meta name="keywords" content="novapornx faq, help, support, free porn stream, report video, dmca claim" />
                <link rel="canonical" href={`${BASE_URL}/faq`} />

                {/* ── Open Graph ────────────────────────────────────────────── */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`${BASE_URL}/faq`} />
                <meta property="og:title" content="Frequently Asked Questions (FAQ) & Support | NovaPornX" />
                <meta property="og:description" content="Find answers to frequently asked questions about NovaPornX, support, free HD streaming, and content reporting." />
                <meta property="og:image" content={`${BASE_URL}/assets/backGround.png`} />
                <meta property="og:image:width" content="1280" />
                <meta property="og:image:height" content="720" />
                <meta property="og:site_name" content="NovaPornX" />

                {/* ── Twitter Card ──────────────────────────────────────────── */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={`${BASE_URL}/faq`} />
                <meta name="twitter:title" content="Frequently Asked Questions (FAQ) | NovaPornX" />
                <meta name="twitter:description" content="Find answers to frequently asked questions about NovaPornX, support, and video reporting." />
                <meta name="twitter:image" content={`${BASE_URL}/assets/backGround.png`} />

                {/* ── Structured Data ───────────────────────────────────────── */}
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            </Head>
            <NavBar sx={{ backgroundColor: "#111", borderBottom: "1px solid rgba(240,19,229,0.2)" }} />
            <div style={styles.faqContainer}>
                <div style={styles.faqContent}>
                    <Typography component="h1" variant="h5" style={styles.title}>
                        Frequently Asked Questions
                    </Typography>

                    <Accordion sx={styles.accordion}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />} sx={styles.accordionSummary}>
                            <Typography variant="h6" sx={styles.question}>How do I report a video for IP infringement or DMCA?</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={styles.accordionDetails}>
                            <Typography variant="body1" sx={styles.answer}>
                                We take Copyright violations seriously. Every video features a "Report Video" button (flag icon) just below the player.
                                Click it, select "Other Reasons" or another appropriate option, enter your email, and provide all necessary information as specified on our <a href="/DMCA/Dmca" style={{ color: '#f013e5', textDecoration: 'none' }}>DMCA Page</a> in the "Additional details" text box.
                            </Typography>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion sx={styles.accordion}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />} sx={styles.accordionSummary}>
                            <Typography variant="h6" sx={styles.question}>How do I report non-consensual or abusive content?</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={styles.accordionDetails}>
                            <Typography variant="body1" sx={styles.answer}>
                                Click the "Report Video" button below the video player. Select the reason, such as "Violent or Abusive" or "Contains Non-consensual acts", enter your email so we can contact you, provide any details, and click "Submit Report". Our moderation team works 24/7.
                            </Typography>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion sx={styles.accordion}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />} sx={styles.accordionSummary}>
                            <Typography variant="h6" sx={styles.question}>Is novapornx completely free?</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={styles.accordionDetails}>
                            <Typography variant="body1" sx={styles.answer}>
                                Yes, our site provides free premium HD adult content without hidden charges.
                            </Typography>
                        </AccordionDetails>
                    </Accordion>

                </div>
            </div>
            <FooterComponent />
        </div>
    );
};

const styles: { [key: string]: CSSProperties | any } = {
    faqContainer: {
        backgroundColor: '#000',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
    },
    faqContent: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '900px',
        width: '100%',
        boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.5)',
        color: '#fff',
    },
    title: {
        fontWeight: 'bold',
        fontSize: '24px',
        marginBottom: '32px',
        textAlign: 'center',
        color: '#f013e5',
    },
    accordion: {
        backgroundColor: 'transparent',
        boxShadow: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        '&:before': {
            display: 'none',
        },
        color: '#fff',
    },
    accordionSummary: {
        padding: 0,
        '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.02)',
        }
    },
    question: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#fff',
    },
    accordionDetails: {
        padding: '0 0 16px 0',
    },
    answer: {
        fontSize: '16px',
        color: 'rgba(255, 255, 255, 0.7)',
        lineHeight: 1.6,
    }
};

export default FaqPage;

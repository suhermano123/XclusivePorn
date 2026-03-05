import React from 'react';
import { Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FooterComponent from '@/components/footer/Footer';
import NavBar from '@/components/NavBar/NavBar';
import Head from 'next/head';
import { CSSProperties } from 'react';

const FaqPage: React.FC = () => {
    return (
        <div style={{ backgroundColor: '#000' }}>
            <Head>
                <title>Frequently Asked Questions (FAQ) - novapornx</title>
                <meta name="description" content="Frequently Asked Questions and Support for novapornx." />
            </Head>
            <NavBar sx={{ backgroundColor: "#e91ec4" }} />
            <div style={styles.faqContainer}>
                <div style={styles.faqContent}>
                    <Typography variant="h5" style={styles.title}>
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

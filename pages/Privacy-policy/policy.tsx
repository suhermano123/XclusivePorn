import React from 'react';
import { Typography } from '@mui/material';
import FooterComponent from '@/components/footer/Footer';
import NavBar from '@/components/NavBar/NavBar';
import Head from 'next/head';
import { CSSProperties } from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div style={{ backgroundColor: '#000' }}>
      <Head>
        <title>Privacy Policy - novapornx</title>
        <meta name="description" content="Privacy policy and data protection information for novapornx users." />
        <meta name="robots" content="noindex, follow" />
      </Head>
      <NavBar sx={{ backgroundColor: "#e91ec4" }} />
      <div style={styles.privacyContainer}>
        <div style={styles.privacyContent}>
          <Typography variant="h5" style={styles.title}>
            Privacy Policy
          </Typography>
          <Typography variant="body1" style={styles.text}>
            Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use novapornx.
          </Typography>
          <Typography variant="h6" style={{ ...styles.title, marginTop: '20px', fontSize: '18px', textAlign: 'left' }}>
            Information Collection
          </Typography>
          <Typography variant="body1" style={styles.text}>
            We may collect certain information automatically when you visit our site, such as your IP address, browser type, and operating system. We do not sell or share this information with third parties.
          </Typography>
          <Typography variant="h6" style={{ ...styles.title, marginTop: '20px', fontSize: '18px', textAlign: 'left' }}>
            Cookies
          </Typography>
          <Typography variant="body1" style={styles.text}>
            We use cookies to enhance your experience on our website. Cookies are small files stored on your device that help us remember your preferences and improve site functionality.
          </Typography>
          <Typography variant="h6" style={{ ...styles.title, marginTop: '20px', fontSize: '18px', textAlign: 'left' }}>
            Data Security
          </Typography>
          <Typography variant="body1" style={styles.text}>
            We implement reasonable security measures to protect your personal information from unauthorized access or disclosure. However, no internet transmission is 100% secure.
          </Typography>
          <Typography variant="h6" style={{ ...styles.title, marginTop: '20px', fontSize: '18px', textAlign: 'left' }}>
            Third-Party Links
          </Typography>
          <Typography variant="body1" style={styles.text}>
            Our website may contain links to third-party sites. We are not responsible for the privacy practices or content of those websites.
          </Typography>
        </div>
      </div>
      <FooterComponent />
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  privacyContainer: {
    backgroundColor: '#000',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  privacyContent: {
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
    marginBottom: '24px',
    textAlign: 'center',
    color: '#f013e5',
  },
  text: {
    fontSize: '16px',
    lineHeight: '1.8',
    marginBottom: '20px',
    textAlign: 'justify',
    color: 'rgba(255, 255, 255, 0.8)',
  },
};

export default PrivacyPolicyPage;

import React from 'react';
import { Typography } from '@mui/material';
import FooterComponent from '@/components/footer/Footer';
import NavBar from '@/components/NavBar/NavBar';
import Head from 'next/head';
import { CSSProperties } from 'react';

const TermsUsePage: React.FC = () => {
  return (
    <div style={{ backgroundColor: '#000' }}>
      <Head>
        <title>Terms of Use - novapornx</title>
        <meta name="description" content="Terms and conditions for using novapornx services." />
        <meta name="robots" content="noindex, follow" />
      </Head>
      <NavBar sx={{ backgroundColor: "#e91ec4" }} />
      <div style={styles.termsContainer}>
        <div style={styles.termsContent}>
          <Typography variant="h5" style={styles.title}>
            Terms of Use
          </Typography>
          <Typography variant="body1" style={styles.text}>
            Welcome to novapornx. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions of use.
          </Typography>
          <Typography variant="h6" style={{ ...styles.title, marginTop: '20px', fontSize: '18px', textAlign: 'left' }}>
            1. Acceptance of Terms
          </Typography>
          <Typography variant="body1" style={styles.text}>
            Your access to and use of novapornx is subject exclusively to these Terms and Conditions. You will not use the website for any purpose that is unlawful or prohibited by these Terms and Conditions.
          </Typography>
          <Typography variant="h6" style={{ ...styles.title, marginTop: '20px', fontSize: '18px', textAlign: 'left' }}>
            2. Age Restriction
          </Typography>
          <Typography variant="body1" style={styles.text}>
            You must be at least 18 years of age, or the age of majority in your jurisdiction, to access and use this website. By using this site, you represent that you meet these age requirements.
          </Typography>
          <Typography variant="h6" style={{ ...styles.title, marginTop: '20px', fontSize: '18px', textAlign: 'left' }}>
            3. User Conduct
          </Typography>
          <Typography variant="body1" style={styles.text}>
            Users are responsible for their own conduct and any data, text, information, usernames, graphics, photos, profiles, audio and video clips, links that they submit, post, and display on the service.
          </Typography>
          <Typography variant="h6" style={{ ...styles.title, marginTop: '20px', fontSize: '18px', textAlign: 'left' }}>
            4. Changes to Website
          </Typography>
          <Typography variant="body1" style={styles.text}>
            novapornx reserves the right to change or remove (temporarily or permanently) the website or any part of it without notice and you confirm that novapornx shall not be liable to you for any such change or removal.
          </Typography>
        </div>
      </div>
      <FooterComponent />
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  termsContainer: {
    backgroundColor: '#000',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  termsContent: {
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

export default TermsUsePage;

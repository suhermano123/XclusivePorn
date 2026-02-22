import React from 'react';
import { Typography, Button } from '@mui/material';
import FooterComponent from '@/components/footer/Footer';
import NavBar from '@/components/NavBar/NavBar';
import Head from 'next/head';
import { CSSProperties } from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div>
      <Head>
        <title>Privacy Policy - novapornx</title>
        <meta name="description" content="Privacy policy regarding user data and collection practices at novapornx." />
        <meta name="robots" content="noindex, follow" />
      </Head>
      <NavBar sx={{ backgroundColor: "#E91E63" }} />
      <div style={styles.privacyContainer}>
        <div style={styles.privacyContent}>
          <Typography variant="h5" style={styles.title}>
            Privacy Policy
          </Typography>
          <Typography variant="body1" style={styles.text}>
            This document details important information regarding the use and disclosure of User Data collected on Pornobae.com.
            <br />
            <br />
            The security of your Data is very important to Pornobae.com and as such we take all appropriate steps to limit the risk that it may be lost, damaged or misused.
            <br />
            <br />
            This site expressly and strictly limits its viewing privileges to adults 18 years of age and over or having attained the age of majority in their community. All persons who do not meet its criteria are strictly forbidden from accessing or viewing the contents of this Site. We do not knowingly seek or collect any personal information or data from persons who have not attained the age of majority.
          </Typography>

          <Typography variant="h5" style={styles.title}>
            DATA COLLECTED:
          </Typography>
          <Typography variant="body1" style={styles.text}>
            <strong>Personal Information:</strong> Visitors can watch videos without any information being collected and processed. However, the visitor’s IP address will be recorded in the event that there is any misappropriation of information and/or content.
            <br />
            <br />
            <strong>Cookies:</strong> When you visit Pornobae.com, we may send one or more cookies to your computer that uniquely identifies your browser session. Pornobae.com uses both session cookies and persistent cookies. If you remove your persistent cookie, some of the site’s features may not function properly.
            <br />
            <br />
            <strong>Log File Information:</strong> When you visit Pornobae.com, our servers may automatically record certain information that your web browser sends such as your web request, IP address, browser type, browser language, referring URL, platform type, domain names and the date and time of your request.
            <br />
            <br />
            <strong>Emails:</strong> If you contact us, we may keep a record of that correspondence.
          </Typography>

          <Typography variant="h5" style={styles.title}>
            DISCLOSURE OF INFORMATION:
          </Typography>
          <Typography variant="body1" style={styles.text}>
            If under duty to do so, Pornobae.com may release data to comply with any legal obligation, or in order to enforce our Terms of Service and other agreements; or to protect the rights, property or safety of Pornobae.com or our subscribers or others. This includes exchanging information with other companies and organizations including the police and governmental authorities for the purposes of protection against fraud or any other kind of illegal activity whether or not identified in the Terms of Service. It is Pornobae’s policy, whenever possible and legally permissible, to promptly notify you upon an obligation to supply data to any third party.
            <br />
            <br />
            We do not share your personally identifiable information (such as name or email address) with other, third-party companies for their commercial or marketing use without your consent or except as part of a specific program or feature for which you will have the ability to opt-in or opt-out.
          </Typography>

          <Typography variant="h5" style={styles.title}>
            SECURITY:
          </Typography>
          <Typography variant="body1" style={styles.text}>
            Unfortunately, the transmission of information via the Internet is not completely secure. Pornobae.com uses commercially reasonable physical, managerial and technical safeguards to preserve the integrity and security of your personal information. We cannot, however, ensure or warrant the security of any information you transmit to Pornobae.com and you do so at your own risk.
          </Typography>
        </div>
      </div>
      <FooterComponent />
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  privacyContainer: {
    backgroundImage: 'url("https://cdn2.imgpog.com/67b1697889411a038f23f488.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Oscurece la imagen de fondo
  },
  privacyContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Fondo blanco semi-transparente para mejorar la legibilidad
    borderRadius: '8px',
    padding: '30px',
    maxWidth: '800px',
    width: '100%',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
  },
  title: {
    fontWeight: 'bold',
    fontSize: '20px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  text: {
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '15px',
    textAlign: 'justify',
  },
};

export default PrivacyPolicyPage;

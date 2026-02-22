import React from 'react';
import { Typography } from '@mui/material';
import FooterComponent from '@/components/footer/Footer';
import NavBar from '@/components/NavBar/NavBar';
import Head from 'next/head';
import { CSSProperties } from 'react';

const DmcaPage: React.FC = () => {
  return (
    <div style={{ backgroundColor: '#000' }}>
      <Head>
        <title>DMCA Policy - novapornx</title>
        <meta name="description" content="Legal disclaimer and DMCA copyright infringement notice for novapornx." />
        <meta name="robots" content="noindex, follow" />
      </Head>
      <NavBar sx={{ backgroundColor: "#e91ec4" }} />
      <div style={styles.dmcaContainer}>
        <div style={styles.dmcaContent}>
          <Typography variant="h5" style={styles.title}>
            Legal Disclaimer
          </Typography>
          <Typography variant="body1" style={styles.text}>
            novapornx is an online service provider as defined in the Digital Millennium Copyright Act.
            We provide legal copyright owners with the ability to self-publish on the internet by uploading, storing and displaying various types of media.
            We do not monitor, screen or otherwise review the media which is uploaded to our servers by users of the service.
          </Typography>
          <Typography variant="body1" style={styles.text}>
            We take copyright violation very seriously and will vigorously protect the rights of legal copyright owners.
            If you are the copyright owner of content which appears on the novapornx website and you did not authorize the use of the content you must notify us in writing in order for us to identify the allegedly infringing content and take action.
          </Typography>
          <Typography variant="h6" style={{ ...styles.title, marginTop: '20px', fontSize: '18px' }}>
            DMCA Notice of Alleged Infringement
          </Typography>
          <Typography variant="body1" style={styles.text}>
            To file a notice of infringement with us, you must provide a written communication (by email) that sets forth the items specified below:
          </Typography>
          <Typography variant="body1" style={styles.text}>
            1. A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.<br />
            2. Identification of the copyrighted work claimed to have been infringed.<br />
            3. Identification of the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed.<br />
            4. Information reasonably sufficient to permit the service provider to contact the complaining party (address, phone number, email).<br />
            5. A statement that the complaining party has a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner.<br />
            6. A statement that the information in the notification is accurate, and under penalty of perjury, that the complaining party is authorized to act on behalf of the owner.
          </Typography>
        </div>
      </div>
      <FooterComponent />
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  dmcaContainer: {
    backgroundColor: '#000',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  dmcaContent: {
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

export default DmcaPage;

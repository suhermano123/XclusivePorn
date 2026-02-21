import React from 'react';
import { Typography, Button } from '@mui/material';
import FooterComponent from '@/components/footer/Footer';
import NavBar from '@/components/NavBar/NavBar';
import { CSSProperties } from 'react';

const TermsUsePage: React.FC = () => {
  return (
    <div>
      <NavBar sx={{ backgroundColor: "#E91E63" }} />
      <div style={styles.termsContainer}>
        <div style={styles.termsContent}>
          <Typography variant="h5" style={styles.title}>
            ACCEPTANCE
          </Typography>
          <Typography variant="body1" style={styles.text}>
            By using and/or visiting the novapornx.com, you agree to the terms and conditions contained herein and the terms and conditions of novapornx privacy policy incorporated herein, and all future amendments and modifications (collectively referred to as the “Agreement”). By entering, you agree to be bound by these terms and conditions. If you do not agree to be bound the terms and conditions contained herein, then do not use novapornx.com.
            <br />
            <br />
            The terms and conditions of this Agreement are subject to change by novapornx at any time in its sole discretion and you agree be bound by all modifications, changes and/or revisions. If you do not accept to be bound by any and all modifications, changes and/or revisions of this agreement, you may not use novapornx.com.
            <br />
            <br />
            The terms and conditions contained herein apply to all users of novapornx and you are only authorized to use novapornx.com if you agree to abide by all applicable laws and be legally bound by the terms and conditions of this Agreement.
          </Typography>

          <Typography variant="h5" style={styles.title}>
            DESCRIPTION
          </Typography>
          <Typography variant="body1" style={styles.text}>
            The website allows for sharing and general viewing various types of content allowing users to share and view visual depictions of adult content, including sexually explicit images. novapornx allows its users to view the Content and Website subject to the terms and conditions of this Agreement.
            <br />
            <br />
            The website may also contain certain links to third party websites which are in no way owned or controlled by novapornx. novapornx assumes no responsibility for the content, privacy policies, practices of any and all third party websites. novapornx cannot censor or edit the content of third party sites. You acknowledge that novapornx will not be liable for any and all liability arising for your use of any third-party website.
          </Typography>

          <Typography variant="h5" style={styles.title}>
            ACCESS
          </Typography>
          <Typography variant="body1" style={styles.text}>
            In order to use this website, you affirm that you are at least eighteen (18) years of age and/or over the age of majority in the jurisdiction you reside and from which you access the website where the age of majority is greater than eighteen (18) years of age. If you are under the age of 18 and/or under the age of majority in the jurisdiction you reside and from which you access the website, then you are not permitted to use the website.
            <br />
            <br />
            We will not reproduce, plagiarize, distribute or communicate publicly movies or scenes that can be copyrighted. novapornx doesn’t host any content. All novapornx does is use link or embed content that was uploaded to popular Online Video hosting. All popular Online Video hosting users signed a contract with the sites when they set up their accounts which force them not to upload illegal content. By clicking on any Links to videos while surfing on novapornx you watch content hosted on third parties and novapornx can’t take the responsibility for any content hosted on other sites.
            <br />
            <br />
            All brands and logos referenced herein are trademarks of their rightful owners and are used only in reference to them and with a view to appointment or comment, in accordance with article 32 LPI.
            <br />
            <br />
            We are not responsible for the abuse you can make of the content of our site.
            <br />
            <br />
            In no event or circumstance will the owner or employees be held responsible directly or indirectly for the illegal use of the information contained in Pornobae.com. We are not responsible for improper use or misinterpretation made of the information and services included. We also disclaim any responsibility for the content you may access through our links.
            <br />
            <br />
            If in your country, this type of site is prohibited, you and you alone are responsible for entering Pornobae.com. If you decide to stay in Pornobae.com, it means that you have read, understood and agree to the terms of this page.
          </Typography>
        </div>
      </div>
      <FooterComponent />
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  termsContainer: {
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
  termsContent: {
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

export default TermsUsePage;

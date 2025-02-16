import React from 'react';
import { Typography, Button } from '@mui/material';
import FooterComponent from '@/components/footer/Footer';
import NavBar from '@/components/NavBar/NavBar';

const DmcaPage: React.FC = () => {
  return (
    <div>
      <NavBar sx={{ backgroundColor: "#E91E63" }} />
    <div style={styles.dmcaContainer}>
      <div style={styles.dmcaContent}>
        <Typography variant="h5" style={styles.title}>
          Legal Disclaimer
        </Typography>
        <Typography variant="body1" style={styles.text}>
          The owners and operators of Pornobae.com are not the producers (as that term is defined in 18 U.S.C. Section 2257) of any of the visual content contained in the site.
          <br />
          <br />
          The owners and operators of Pornobae.com are not U.S. citizens. Pornobae.com doesn’t host any content.
          <br />
          <br />
          All Pornobae does is use link or embed content that was uploaded to popular Online Video hosting. All popular Online Video hosting users signed a contract with the sites when they set up their accounts which force them not to upload illegal content. By clicking on any Links to videos while surfing on Pornobae you watch content hosted on third parties and Pornobae can’t take the responsibility for any content hosted on other sites.
          <br />
          <br />
          We do not upload any videos nor do we know who and where videos are coming from. We do not promote any illegal conduct of any kind. Links to the videos are submitted by users and managed by users.
          <br />
          <br />
          All content has been exclusively drawn from public Web sites, so this material is considered free distribution. In no article mentions the legal prohibition of free material so that this page does not infringe any law. Anyone has any questions or problems with this, please contact: info@pornobae.com
          <br />
          <br />
          So, Copyright owners should not complaint to our website, owner should go to the actual video Host or video providers.
          <br />
          <br />
          All brands and logos referenced herein are trademarks of their rightful owners and are used only in reference to them and with a view to appointment or comment, in accordance with article 32 LPI.
          <br />
          <br />
          <Typography variant="h5" style={styles.title}>
            DMCA Notice of Copyright Infringement
          </Typography>
          <br />
          <Typography variant="body1" style={styles.text}>
            Pornobae is an online service provider as defined in the Digital Millennium Copyright Act.
            <br />
            <br />
            We provide legal copyright owners with the ability to self-publish on the Internet by uploading, storing and displaying various types of media. We do not actively monitor, screen or otherwise review the media which is uploaded to our servers by users of the service.
            <br />
            <br />
            We take copyright violation very seriously and will vigorously protect the rights of legal copyright owners.
            <br />
            <br />
            If you are the copyright owner of content which appears on the Pornobae website and you did not authorize the use of the content you must notify us in writing in order for us to identify the allegedly infringing content and take action. We will be unable to take any action if you do not provide us with the required information, so please fill out all fields accurately and completely. You may make a written notice via e-mail, facsimile or postal mail to our DMCA Agent as listed below. Your written notice must include the following:
            <br />
            <br />
            Specific identification of the copyrighted work which you are alleging to have been infringed. If you are alleging infringement of multiple copyrighted works with a single notification you must submit a representative list which specifically identifies each of the works that you allege are being infringed.
            <br />
            <br />
            Specific identification of the location and description of the material that is claimed to be infringing or to be the subject of infringing activity with enough detailed information to permit us to locate the material. You should include the specific URL or URLs of the web pages where the allegedly infringing material is located.
            <br />
            <br />
            Information reasonably sufficient to allow us to contact the complaining party which may include a name, address, telephone number and electronic mail address and signature at which the complaining party may be contacted.
            <br />
            <br />
            A statement that the complaining party has a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent or the law.
            <br />
            <br />
            A statement that the information in the notification is accurate, and under penalty of perjury that the complaining party is authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.
            <br />
            <br />
            Please mail to our DMCA agent at info@pornobae.com
          </Typography>
        </Typography>
      </div>
      
    </div>
    <FooterComponent />
    </div>
  );
};

const styles = {
  dmcaContainer: {
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
  dmcaContent: {
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

export default DmcaPage;

import React from 'react';
import { Typography, Button } from '@mui/material';
import FooterComponent from '@/components/footer/Footer';
import NavBar from '@/components/NavBar/NavBar';
import useDynamoDB from '@/hooks/UseDynamoDB';
import { CSSProperties } from 'react';

const DmcaPage: React.FC = () => {
    

    
  return (
    <div>
      <NavBar sx={{ backgroundColor: "#e91ec4" }} />
    <div style={styles.dmcaContainer}>
      <div style={styles.dmcaContent}>
       
      </div>
      
    </div>
    <FooterComponent />
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  dmcaContainer: {
    backgroundImage: 'url("/assets/bg7.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: 'rgba(20, 50, 10, 0.6)', // Oscurece la imagen de fondo
  },
  dmcaContent: {
    backgroundColor: 'rgba(156, 29, 156, 0.7)', // Fondo blanco semi-transparente para mejorar la legibilidad
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

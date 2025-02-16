import React from 'react';
import { Button, Typography, Link } from '@mui/material';
import { useRouter } from 'next/router'; // Importa useRouter de Next.js

const FooterComponent: React.FC = () => {
  const router = useRouter(); // Utilizamos useRouter para navegar

  // Función para manejar las redirecciones
  const handleRedirect = (path: string) => {
    router.push(path);
  };

  return (
    <footer
      style={{
        backgroundColor: '#e91ec4',
        color: 'white',
        textAlign: 'center',
        padding: '20px 10px',
        width: '100%',
        position: 'relative', // Asegura que el footer quede dentro del flujo normal de la página
      }}
    >
      <Typography variant="body2" color="inherit" paragraph>
        {'© '} {new Date().getFullYear()} XclusivePorn All rights reserved.
      </Typography>
      
      {/* Enlaces en la parte inferior */}
      <Typography variant="body2" color="inherit" paragraph>
        <Link
          href="#"
          color="inherit"
          style={{ margin: '0 15px' }}
          onClick={() => handleRedirect('/DMCA/Dmca')}
        >
          DMCA
        </Link>
        <Link
          href="#"
          color="inherit"
          style={{ margin: '0 15px' }}
          onClick={() => handleRedirect('/terms-of-use')}
        >
          Terms of Use
        </Link>
        <Link
          href="#"
          color="inherit"
          style={{ margin: '0 15px' }}
          onClick={() => handleRedirect('/privacy-policy')}
        >
          Privacy Policy
        </Link>
        <Link
          href="#"
          color="inherit"
          style={{ margin: '0 15px' }}
          onClick={() => handleRedirect('/faq')}
        >
          FAQ
        </Link>
      </Typography>

      {/* Disclaimer */}
      <Typography variant="body2" color="inherit" paragraph>
        This site does not store any files on your servers. PornoBae only indexes and links to content provided by other non-affiliated sites. All models appearing on this website are 18 years or older.
      </Typography>

      {/* Contact Us Button */}
    </footer>
  );
};

export default FooterComponent;

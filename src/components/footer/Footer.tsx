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
    <div>
    <div style={{
      width: '100%',
      height: '100px',  // Ajusta la altura según el espacio necesario para el anuncio
      backgroundColor: '#f1f1f1',  // Color de fondo para resaltar el área del anuncio
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '20px',  // Espacio entre el NavMenu y el anuncio
    }}>
      <Typography variant="h6" style={{ textAlign: 'center', color: '#333' }}>
      <script type="text/javascript">
var juicy_tags = ['a', 'img'];
</script>
<script type="text/javascript" src="https://js.juicyads.com/jp.php?c=44540333s284u4r2o2a463c484&u=http%3A%2F%2Fwww.juicyads.rocks"></script>
      </Typography>
    </div>
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
          onClick={() => handleRedirect('/TERMS/TermsUse')}
        >
          Terms of Use
        </Link>
        <Link
          href="#"
          color="inherit"
          style={{ margin: '0 15px' }}
          onClick={() => handleRedirect('/Privacy-policy/policy')}
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
    </div>
  );
};

export default FooterComponent;

import * as React from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { useRouter } from 'next/router'; // Importa el hook useRouter
import { Typography } from '@mui/material';

export default function NavMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter(); // Inicializa el hook useRouter

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  const handleUploadClick = () => {
    router.push('/UploadVideo'); // Redirige a la ruta de subida de videos
  };

  return (
    <div>
      <Grid container sx={{ justifyContent: 'center' }}>
        <Grid item>
          <Tooltip disableFocusListener title="Add">
            <Button style={{color: 'white'}}>Channels</Button>
          </Tooltip>
        </Grid>
        <Grid item>
          <Tooltip disableHoverListener title="Add">
            <Button style={{color: 'white'}}>Tags</Button>
          </Tooltip>
        </Grid>
        <Grid item>
          <Tooltip disableFocusListener disableTouchListener title="Add">
            <Button style={{color: 'white'}}>Porn Stars</Button>
          </Tooltip>
        </Grid>
        <Grid item>
          <ClickAwayListener onClickAway={handleTooltipClose}>
            <div>
              <Tooltip
                onClose={handleTooltipClose}
                open={open}
                disableFocusListener
                disableHoverListener
                disableTouchListener
                title="Add"
                slotProps={{
                  popper: {
                    disablePortal: true,
                  },
                }}
              >
                <Button style={{color: 'white'}} onClick={handleUploadClick}>Upload Video</Button>
              </Tooltip>
            </div>
          </ClickAwayListener>
        </Grid>
      </Grid>

      {/* Espacio para anuncios debajo del NavMenu */}
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
          Anuncio Aquí
        </Typography>
      </div>
    </div>
  );
}

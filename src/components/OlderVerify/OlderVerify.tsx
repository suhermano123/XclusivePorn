import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useRouter } from 'next/router';

const AgeVerification: React.FC = () => {
  const [open, setOpen] = useState(true); // Mantiene el estado de si el modal está abierto
  const router = useRouter();

  // Función para manejar el clic en "Yes"
  const handleYes = () => {
    setOpen(false); // Cierra el modal
  };

  // Función para manejar el clic en "No"
  const handleNo = () => {
    router.push('https://www.youtube.com'); // Redirige a YouTube
  };

  return (
    <Dialog open={open} onClose={handleNo}>
      <DialogTitle>¿Eres mayor de 18 años?</DialogTitle>
      <DialogContent>
        <p>Por favor, confirma si eres mayor de 18 años para continuar.</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleYes} color="primary">
          Sí
        </Button>
        <Button onClick={handleNo} color="secondary">
          No
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AgeVerification;

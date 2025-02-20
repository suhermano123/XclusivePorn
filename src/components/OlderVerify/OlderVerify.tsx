import React, { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Box } from "@mui/material";
import { useRouter } from "next/router";

const AgeVerification: React.FC = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Verificar en localStorage si el usuario ya aceptó
  useEffect(() => {
    const isAdult = localStorage.getItem("isAdult");
    if (!isAdult) {
      setOpen(true); // Si no hay registro en localStorage, mostrar modal
    }
  }, []);

  const handleYes = () => {
    localStorage.setItem("isAdult", "true"); // Guardar preferencia en localStorage
    setOpen(false); // Cierra el modal
  };

  const handleNo = () => {
    router.push("https://www.youtube.com"); // Redirigir si no es mayor de edad
  };

  return (
    <Dialog
      open={open}
      onClose={handleNo}
      fullScreen
      sx={{
        "& .MuiDialog-paper": {
          background: "none",
          boxShadow: "none",
        },
      }}
    >
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          backgroundImage: "url('/assets/backGround.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Capa oscura para mejorar contraste */}
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          }}
        />

        {/* Contenido del modal */}
        <Box
          sx={{
            position: "relative",
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(8px)",
            padding: "24px",
            borderRadius: "12px",
            textAlign: "center",
            color: "#fff",
            maxWidth: "400px",
          }}
        >
          <DialogTitle sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            Are you over 18 years old?
          </DialogTitle>
          <DialogContent>
            <p>Please confirm if you are over 18 years old to continue.</p>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center" }}>
            <Button onClick={handleYes} variant="contained" color="success">
              Sí
            </Button>
            <Button onClick={handleNo} variant="contained" color="error">
              No
            </Button>
          </DialogActions>
        </Box>
      </Box>
    </Dialog>
  );
};

export default AgeVerification;

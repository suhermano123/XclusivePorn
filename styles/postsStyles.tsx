import { CSSProperties } from "react";

export const PostStyles: { [key: string]: CSSProperties } = {
    Container: {
      backgroundImage: 'url("/assets/bg7.jpg")',
      backgroundSize: "cover",
      backgroundPosition: "center",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      backgroundColor: "rgba(20, 50, 10, 0.6)", // Oscurece la imagen de fondo
    },
    Content: {
      backgroundColor: "rgba(156, 29, 156, 0.7)", // Fondo semi-transparente
      borderRadius: "8px",
      maxWidth: "80%",
      width: "100%",
      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
      marginTop: "-170px", // Ajuste para que no esté muy lejos del top
      padding: "20px",
    },
    title: {
      fontWeight: "bold",
      fontSize: "20px",
      marginBottom: "20px",
      textAlign: "center",
    },
    text: {
      fontSize: "16px",
      lineHeight: "1.6",
      marginBottom: "15px",
      textAlign: "justify",
    },
    ContentPost: {
        backgroundColor: "rgba(156, 29, 156, 0.7)", // Fondo semi-transparente
        borderRadius: "8px",
        maxWidth: "80%",
        width: "100%",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
        marginTop: "0px", // Ajuste para que no esté muy lejos del top
        padding: "20px",
      },
  };
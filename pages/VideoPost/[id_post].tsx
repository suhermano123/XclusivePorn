import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PostVideo } from "@/api/types/PostTypes";
import { Container, Typography, Box, Button } from "@mui/material";
import { RootState } from "@/redux/store";
import NavBar from "@/components/NavBar/NavBar";
import NavMenu from "@/components/NavMenu/NavMenu";
import FooterComponent from "@/components/footer/Footer";
import Image from "next/image";
import FavoriteIcon from "@mui/icons-material/Favorite";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import DownloadIcon from "@mui/icons-material/Download";



const VideoDetail = () => {
  const router = useRouter();
  const { id_post } = router.query;

  const movies = useSelector((state: RootState) => state.postVideos.movies);
  const [movie, setMovie] = useState<PostVideo | null>(null);

  useEffect(() => {
    if (id_post && movies.length > 0) {
      const foundMovie = movies.find((m) => m.id_post.S === id_post);
      if (foundMovie) setMovie(foundMovie);
    }
  }, [id_post, movies]);

  if (!movie)
    return (
      <Typography align="center" sx={{ my: 4, color: "white" }}>
        Cargando...
      </Typography>
    );

  const downloadLinks = movie.downloads.S.split(",").map((link) => link.trim());

  return (
    <>
      <NavBar sx={{ backgroundColor: "#e91ec4" }} />
      <NavMenu />

      <Container maxWidth="xl" sx={styles.container}>
        <Box sx={styles.postContainer}>
          {/* 📌 Título */}
          <Typography variant="h4" sx={styles.title}>
            {movie.tittle.S}
          </Typography>

          {/* 📌 Imagen Destacada */}
          <Box sx={styles.imageWrapper}>
            <Image
              src={movie.img_thumb.S}
              alt={movie.tittle.S}
              width={550}
              height={600}
              layout="intrinsic"
              style={{
                borderRadius: "12px",
                boxShadow: "0px 4px 12px rgba(255, 255, 255, 0.2)",
              }}
            />
          </Box>

          {/* 📌 Información del Video */}
          <Typography variant="body1" sx={styles.description}>
            {movie.description.S}
          </Typography>

          {/* 📌 Imagen Extra */}
          <Box sx={styles.imageWrapper}>
            <Image
              src={movie.images.S}
              alt={movie.tittle.S}
              width={900}
              height={1150}
              style={{
                borderRadius: "8px",
                boxShadow: "0px 4px 12px rgba(255, 255, 255, 0.2)",
              }}
            />
          </Box>

          {/* 📌 Botones de Descarga */}
          <Box sx={styles.downloadButtons}>
            <Typography variant="body1" sx={styles.description}>
              <Button
                variant="contained"
                color="secondary"
                sx={{
                  marginLeft: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
                onClick={() => window.open(movie.trailer.S, "_blank")}
              >
                <FavoriteIcon />
                Watch Trailer
              </Button>
            </Typography>
            {downloadLinks.map((link, index) => {
              // Verificar si es el último elemento y si termina con una coma
              const isLast = index === downloadLinks.length - 1;
              if (isLast && link.trim().endsWith(",")) return null;

              const isK2s = link.includes("k2s.cc");
              const isRapidGator = link.includes("rg.to");
              const qualityMatch = link.match(/(1080p|2160p|SD)/);
              const quality = qualityMatch ? qualityMatch[0] : "Desconocida";

              return (
                <div key={index}>
                  
                  <Button
                    variant="contained"
                    color={isK2s ? "primary" : "secondary"}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={styles.button}
                  >
                    <DownloadIcon sx={{ color: "white", fontSize: 30 }} />
                    {isK2s
                      ? "Keep2Share"
                      : isRapidGator
                      ? "RapidGator"
                      : "Otro"}{" "}
                    - {quality}
                  </Button>
                </div>
              );
            })}
             <Typography variant="body1" sx={styles.description}>
              <Button
                variant="contained"
                color="secondary"
                sx={{
                  marginLeft: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
                onClick={() => window.open("https://anydebrid.com/", "_blank")}
              >
                <RocketLaunchIcon sx={{ color: "white", fontSize: 30 }} />
                Download for free Keep2Share and other servers
              </Button>
            </Typography>
          </Box>
        </Box>
      </Container>

      <FooterComponent />
    </>
  );
};

// 🎨 Estilos
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    paddingY: 4,
  },
  postContainer: {
    backgroundColor: "#1E1E1E",
    color: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0px 4px 12px rgba(255, 255, 255, 0.2)",
    textAlign: "center",
    maxWidth: "900px",
    width: "100%",
  },
  title: {
    textAlign: "center",
    fontWeight: "bold",
    mb: 2,
  },
  imageWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    mb: 3,
    cursor: "pointer",
  },
  description: {
    fontSize: "18px",
    lineHeight: "1.6",
    textAlign: "justify",
    my: 2,
  },
  downloadButtons: {
    mt: 4,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },
  button: {
    borderRadius: "8px",
    textTransform: "none",
    fontSize: "16px",
    width: "250px",
  },
};

export default VideoDetail;

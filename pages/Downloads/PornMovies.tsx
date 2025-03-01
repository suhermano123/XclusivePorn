import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router"; 
import { Card, CardContent, CardMedia, Typography, Container, Grid, Pagination } from "@mui/material";
import FooterComponent from "@/components/footer/Footer";
import NavBar from "@/components/NavBar/NavBar";
import useDynamoDB from "@/hooks/UseDynamoDB";
import { PostVideo } from "@/api/types/PostTypes";
import NavMenu from "@/components/NavMenu/NavMenu";
import { addPostVideos } from "@/redux/PostVideoSlice";
import { useDispatch, useSelector } from "react-redux"; 
import { RootState } from "@/redux/store"; // Asegúrate de importar el tipo RootState

const PornMovies = () => {
  const { GetItems } = useDynamoDB("post_videos");
  const dispatch = useDispatch();
  const router = useRouter();

  // 🔹 Obtener datos de Redux
  const reduxMovies = useSelector((state: RootState) => state.postVideos.movies);
  const [movies, setMovies] = useState<any[]>(reduxMovies || []);
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 12;

  useEffect(() => {
    if (reduxMovies.length > 0) {
      setMovies(reduxMovies);
    } else {
      GetItems().then((tables) => {
        setMovies(tables || []);
        dispatch(addPostVideos(tables || []));
      });
    }
  }, [reduxMovies, GetItems, dispatch]);

  // Calcular los videos a mostrar en la página actual
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = movies.slice(indexOfFirstVideo, indexOfLastVideo);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  return (
    <div style={{ backgroundColor: "#0a0a0a", minHeight: "100vh", color: "white" }}>
      <NavBar sx={{ backgroundColor: "#e91ec4" }} />
      <NavMenu />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4} justifyContent="center">
          {currentVideos.map((movie, index) => (
            <Grid item key={index} xs={12} sm={6} md={4} lg={4}>
              <Card
                sx={{
                  maxWidth: 345,
                  boxShadow: 10,
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "all 0.3s ease-in-out",
                  backgroundColor: "#282828",
                  color: "white",
                  "&:hover": {
                    boxShadow: "0px 0px 15px rgba(240, 15, 199, 0.8)",
                    transform: "scale(1.05)",
                  },
                }}
                onClick={() => router.push(`/VideoPost/${movie.id_post.S}`)}
              >
                <CardMedia>
                  <Image
                    src={movie.img_thumb.S}
                    alt={movie.tittle.S}
                    width={345}
                    height={200}
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "5px",
                    }}
                  />
                </CardMedia>
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div" sx={{ color: "white" }}>
                    {movie.tittle.S}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#ccc" }}>
                    {movie.description.S.length > 180
                      ? `${movie.description.S.substring(0, 180)}...`
                      : movie.description.S}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Paginador */}
        <Pagination
          count={Math.ceil(movies.length / videosPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="secondary"
          sx={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
            "& .MuiPaginationItem-icon": { color: "white" },
            "& .MuiPaginationItem-text": { color: "rgba(255, 255, 255, 0.6)" },
            "& .MuiPaginationItem-root.Mui-selected": { color: "white" },
          }}
        />
      </Container>

      <FooterComponent />
    </div>
  );
};

export default PornMovies;

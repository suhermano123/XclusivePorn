import Head from "next/head";
import { useRouter } from "next/router";
import ImageGrid from "@/components/images/ImageGrid";
import { Box, Button, Typography, Container } from "@mui/material";
import NavBar from "@/components/NavBar/NavBar";
import FooterComponent from "@/components/footer/Footer";

export default function ImagesPage() {
  const router = useRouter();
  const page = Number(router.query.page || 1);

  const canonicalUrl = page > 1
    ? `https://xclusiveporn.com/images?page=${page}`
    : `https://xclusiveporn.com/images`;

  const title = page > 1
    ? `Free Porn Pictures & Sex Images - Page ${page} | XclusivePorn`
    : `Free Porn Pictures & Sex Images Gallery | XclusivePorn`;

  const description = page > 1
    ? `Page ${page} of free high-quality porn pictures and sex images at XclusivePorn. Browse amateur galleries, nude models and exclusive adult photos updated daily.`
    : `Explore thousands of free high-quality porn pictures, sex images, and amateur galleries at XclusivePorn. Daily updated free adult photos, nudes, and babes.`;

  return (
    <Box sx={{ backgroundColor: "#0f0f0f", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="free porn pictures, sex images, nude galleries, free adult photos, nudes, babes, xxx images, adult pictures, porn pics, hd porn images" />
        <link rel="canonical" href={canonicalUrl} />

        {/* Paginación para Google */}
        {page > 1 && <link rel="prev" href={page === 2 ? "https://xclusiveporn.com/images" : `https://xclusiveporn.com/images?page=${page - 1}`} />}
        <link rel="next" href={`https://xclusiveporn.com/images?page=${page + 1}`} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="XclusivePorn" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />

        {/* No indexar páginas de paginación profunda */}
        {page > 10 && <meta name="robots" content="noindex, follow" />}
      </Head>

      <NavBar sx={{ backgroundColor: "#e91ec4" }} />

      <Box component="main" sx={{ flexGrow: 1, pt: { xs: 8, md: 10 }, pb: 6 }}>
        <Container maxWidth="xl">
          <Typography
            variant="h1"
            component="h1"
            sx={{
              color: "#fff",
              fontSize: { xs: "1.8rem", md: "2.5rem" },
              fontWeight: "bold",
              mb: 1,
              textAlign: "center"
            }}
          >
            {page > 1 ? `Free Porn Pictures & Sex Images — Page ${page}` : "Free Porn Pictures & Sex Images"}
          </Typography>
          <Typography
            variant="body1"
            component="p"
            sx={{
              color: "rgba(255,255,255,0.7)",
              mb: 4,
              textAlign: "center",
              maxWidth: "800px",
              mx: "auto"
            }}
          >
            Browse our extensive collection of high-quality free adult photos, featuring top models, amateurs, and exclusive galleries updated daily.
          </Typography>

          <ImageGrid page={page} />

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              mt: 6,
            }}
          >
            <Button
              variant="outlined"
              disabled={page <= 1}
              onClick={() => router.push(page === 2 ? "/images" : `/images?page=${page - 1}`)}
              sx={{
                color: "#f013e5",
                borderColor: "#f013e5",
                fontWeight: "bold",
                borderRadius: "20px",
                padding: "8px 24px",
                "&:hover": { backgroundColor: "rgba(240, 19, 229, 0.1)", borderColor: "#e91ec4" },
                "&.Mui-disabled": { borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" }
              }}
            >
              Previous Page
            </Button>

            <Button
              variant="contained"
              onClick={() => router.push(`/images?page=${page + 1}`)}
              sx={{
                backgroundColor: "#f013e5",
                fontWeight: "bold",
                borderRadius: "20px",
                padding: "8px 24px",
                "&:hover": { backgroundColor: "#e91ec4" }
              }}
            >
              Next Page
            </Button>
          </Box>
        </Container>
      </Box>

      <FooterComponent />
    </Box>
  );
}
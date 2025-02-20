import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { FormControl, useFormControlContext } from "@mui/base/FormControl";
import { Input, inputClasses } from "@mui/base/Input";
import { styled } from "@mui/system";
import { v4 as uuidv4 } from "uuid";
import clsx from "clsx";
import useDynamoDB from "@/hooks/UseDynamoDB";
import NavBar from "@/components/NavBar/NavBar";
import NavMenu from "@/components/NavMenu/NavMenu";
import FooterComponent from "@/components/footer/Footer";

export default function UploadVideo() {
  const { putItem } = useDynamoDB("list_videos");
  const id = uuidv4();

  // Estado para almacenar los valores de los inputs
  const [formData, setFormData] = React.useState({
    videoName: "",
    videoUrl: "",
    videoDownload: "",
    videoOfficialPhoto: "",
    videoThumbs: "",
    tags: "",
    videoTime: "",
    videoDescription: ""
  });

  // Estados para loader y snackbar
  const [isLoading, setIsLoading] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<
    "success" | "error"
  >("success");

  // Manejo de cierre del snackbar
  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  // Función genérica para actualizar el estado de cada input
  const handleInputChange =
    (field: keyof typeof formData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  // Función para enviar los datos a DynamoDB
  const handleSubmit = async () => {
    setIsLoading(true);
    const item = {
      id_video: { S: id },
      video_name: { S: formData.videoName },
      video_embed_url: { S: formData.videoUrl },
      video_download: { S: formData.videoDownload },
      oficial_thumb: { S: formData.videoOfficialPhoto },
      video_thumsnail: { S: formData.videoThumbs },
      video_tags: { S: formData.tags },
      video_likes: { S: '0' },
      video_comments: { S: '' },
      video_time: {S: formData.videoTime},
      video_description: {S: formData.videoDescription}
    };

    try {
      await putItem(item);
      setSnackbarMessage("Agregado correctamente");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      // Reinicia los valores del formulario
      setFormData({
        videoName: "",
        videoUrl: "",
        videoDownload: "",
        videoOfficialPhoto: "",
        videoThumbs: "",
        tags: "",
        videoTime: "",
        videoDescription: ""
      });
    } catch (error) {
      console.error("Error al enviar datos:", error);
      setSnackbarMessage("Error al agregar el video");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <NavBar  sx={{ backgroundColor: '#E91E63' }}/>
    <NavMenu  sx={{ backgroundColor: '#E91E63' }}/>
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#000000",
        backgroundImage: "url('/assets/bg.jpg')", // Ruta de la imagen
        backgroundSize: "cover", // Hace que la imagen cubra todo el fondo
        backgroundPosition: "center",
        position: "relative", // Necesario para posicionar el filtro de oscuridad
      }}
    >
      {/* Capa oscura encima de la imagen */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(10, 0, 0, 0.5)", // Fondo oscuro con opacidad
          zIndex: -1, // Asegura que la capa de oscuridad esté detrás del Card
        }}
      />
      
      <Card
        sx={{
          maxWidth: 500,
          width: "100%",
          p: 2,
          backgroundColor: "rgba(255, 255, 255, 0.8)", // Blanco transparente
          borderRadius: "16px", // Bordes redondeados
          boxShadow: "0px 4px 10px rgba(0,0,0,0.2)", // Suave sombra
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              alignItems: "center", // Centra los inputs dentro del Card
            }}
          >
            <FormControl defaultValue="" required>
              <Label>Video Name</Label>
              <StyledInput
                placeholder="Write the video name"
                value={formData.videoName}
                onChange={handleInputChange("videoName")}
              />
            </FormControl>
            <FormControl defaultValue="" required>
              <Label>Video Url</Label>
              <StyledInput
                placeholder="Write the video url"
                value={formData.videoUrl}
                onChange={handleInputChange("videoUrl")}
              />
            </FormControl>
            <FormControl defaultValue="" required>
              <Label>Video Download</Label>
              <StyledInput
                placeholder="Write the video download link"
                value={formData.videoDownload}
                onChange={handleInputChange("videoDownload")}
              />
            </FormControl>
            <FormControl defaultValue="" required>
              <Label>Video Official Photo</Label>
              <StyledInput
                placeholder="Write the images link"
                value={formData.videoOfficialPhoto}
                onChange={handleInputChange("videoOfficialPhoto")}
              />
            </FormControl>
            <FormControl defaultValue="" required>
              <Label>Video Thumbs</Label>
              <StyledInput
                placeholder="Write the images video"
                value={formData.videoThumbs}
                onChange={handleInputChange("videoThumbs")}
              />
            </FormControl>
            <FormControl defaultValue="" required>
              <Label>Video Tags</Label>
              <StyledInput
                placeholder="Write the tags"
                value={formData.tags}
                onChange={handleInputChange("tags")}
              />
            </FormControl>
            <FormControl defaultValue="" required>
              <Label>Video Time</Label>
              <StyledInput
                placeholder="Write the time video"
                value={formData.tags}
                onChange={handleInputChange("videoTime")}
              />
            </FormControl>
            <FormControl defaultValue="" required>
              <Label>Video Description</Label>
              <StyledInput
                placeholder="Write the description"
                value={formData.tags}
                onChange={handleInputChange("videoDescription")}
              />
            </FormControl>
          </Box>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              mt: 2,
              backgroundColor: "#800080", // Morado
              "&:hover": { backgroundColor: "#660066" }, // Oscurece al pasar el mouse
              width: "50%", // Centra con los inputs
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Submit"
            )}
          </Button>
        </CardContent>
      </Card>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
    <FooterComponent />
    </>
  );
}

const StyledInput = styled(Input)(
  ({ theme }) => `
  .${inputClasses.input} {
    width: 320px;
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.5;
    padding: 8px 12px;
    border-radius: 8px;
    color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
    background: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
    border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
    box-shadow: 0 2px 2px ${
      theme.palette.mode === "dark" ? grey[900] : grey[50]
    };

    &:hover {
      border-color: ${blue[400]};
    }

    &:focus {
      outline: 0;
      border-color: ${blue[400]};
      box-shadow: 0 0 0 3px ${
        theme.palette.mode === "dark" ? blue[600] : blue[200]
      };
    }
  }
`
);

const Label = styled(
  ({
    children,
    className,
  }: {
    children?: React.ReactNode;
    className?: string;
  }) => {
    const formControlContext = useFormControlContext();
    const [dirty, setDirty] = React.useState(false);

    React.useEffect(() => {
      if (formControlContext?.filled) {
        setDirty(true);
      }
    }, [formControlContext]);

    if (formControlContext === undefined) {
      return <p>{children}</p>;
    }

    const { error, required, filled } = formControlContext;
    const showRequiredError = dirty && required && !filled;

    return (
      <p
        className={clsx(className, error || showRequiredError ? "invalid" : "")}
      >
        {children}
        {required ? " *" : ""}
      </p>
    );
  }
)`
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 0.875rem;
  margin-bottom: 4px;

  &.invalid {
    color: red;
  }
`;

const HelperText = styled((props: {}) => {
  const formControlContext = useFormControlContext();
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    if (formControlContext?.filled) {
      setDirty(true);
    }
  }, [formControlContext]);

  if (formControlContext === undefined) {
    return null;
  }

  const { required, filled } = formControlContext;
  const showRequiredError = dirty && required && !filled;

  return showRequiredError ? <p {...props}>This field is required.</p> : null;
})`
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 0.875rem;
`;

const blue = {
  100: "#DAECFF",
  200: "#b6daff",
  400: "#3399FF",
  500: "#007FFF",
  600: "#0072E5",
  900: "#003A75",
};

const grey = {
  50: "#F3F6F9",
  100: "#E5EAF2",
  200: "#DAE2ED",
  300: "#C7D0DD",
  400: "#B0B8C4",
  500: "#9DA8B7",
  600: "#6B7A90",
  700: "#434D5B",
  800: "#303740",
  900: "#1C2025",
};

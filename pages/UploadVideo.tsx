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
import { Switch, Typography } from "@mui/material";
import CustomInput from "@/components/input/CustomInput";

export default function UploadVideo() {
  const { putItem } = useDynamoDB("list_videos");
  const { putItem: putItemPosting } = useDynamoDB("post_videos");
  const id = uuidv4();

  const images = [
    
    "/assets/backGround2.png",
  ]; // Agrega más imágenes según necesites

  const [currentImage, setCurrentImage] = React.useState(images[0]);

  React.useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % images.length; // Avanza cíclicamente en el array
      setCurrentImage(images[index]);
    }, 5000); // Cambia cada 5 segundos

    return () => clearInterval(interval); // Limpia el intervalo cuando el componente se desmonta
  }, []);

  // Estado para almacenar los valores de los inputs
  const [formData, setFormData] = React.useState({
    videoName: "",
    videoUrl: "",
    videoDownload: "",
    videoOfficialPhoto: "",
    videoThumbs: "",
    tags: "",
    videoTime: "",
    videoDescription: "",
  });
  const [extraFormVisible, setExtraFormVisible] = React.useState(false);
  const [extraFormData, setExtraFormData] = React.useState({
    extraField1: "",
    extraField2: "",
    extraField3: "",
    trailer: "",
    extraField4: "",
    extraField5: "",
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

  const handleInputChangeTwo = (field: string, setter: any) => (event: any) => {
    setter((prev: any) => ({ ...prev, [field]: event.target.value }));
  };

  // Función para enviar los datos a DynamoDB
  const handleSubmit = async () => {
    setIsLoading(true);
    let item;

    try {
      if (extraFormVisible) {
        const formattedDownloads =
          extraFormData.extraField5
            .split(/\s+/) // Separar por espacios o saltos de línea
            .filter((link) => link.trim() !== "") // Eliminar elementos vacíos
            .join(",") + ","; // Unir con comas y agregar una al final

        const item = {
          id_post: { S: id },
          tittle: { S: extraFormData.extraField1 },
          img_thumb: { S: extraFormData.extraField2 },
          images: { S: extraFormData.extraField3 },
          trailer: { S: extraFormData.trailer },
          description: { S: extraFormData.extraField4 },
          downloads: { S: formattedDownloads }, // Enlaces formateados
        };
        await putItemPosting(item);
      } else {
        item = {
          id_video: { S: id },
          video_name: { S: formData.videoName },
          video_embed_url: { S: formData.videoUrl },
          video_download: { S: formData.videoDownload },
          oficial_thumb: { S: formData.videoOfficialPhoto },
          video_thumsnail: { S: formData.videoThumbs },
          video_tags: { S: formData.tags },
          video_likes: { S: "0" },
          video_comments: { S: "" },
          video_time: { S: formData.videoTime },
          video_description: { S: formData.videoDescription },
        };

        await putItem(item);
      }

      setSnackbarMessage("Agregado correctamente");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setTimeout(() => {
        setFormData({
          videoName: "",
          videoUrl: "",
          videoDownload: "",
          videoOfficialPhoto: "",
          videoThumbs: "",
          tags: "",
          videoTime: "",
          videoDescription: "",
        });

        setExtraFormData({
          extraField1: "",
          extraField2: "",
          extraField3: "",
          trailer: "",
          extraField4: "",
          extraField5: "",
        });
      }, 100);
      // Reinicia los valores del formulario
    } catch (error) {
      console.error("Error al enviar datos:", error);
      setSnackbarMessage("Error al agregar el video");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };
  console.log(extraFormData);

  function handleReset() {
    setFormData({
      videoName: "",
      videoUrl: "",
      videoDownload: "",
      videoOfficialPhoto: "",
      videoThumbs: "",
      tags: "",
      videoTime: "",
      videoDescription: "",
    });

    setExtraFormData({
      extraField1: "",
      extraField2: "",
      extraField3: "",
      trailer: "",
      extraField4: "",
      extraField5: "",
    });
  }
  console.log("dat", extraFormData);
  return (
    <>
      <NavBar sx={{ backgroundColor: "#e91ec4" }} />
      <NavMenu sx={{ backgroundColor: "#e91ec4" }} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#000000",
          backgroundImage: `url(${currentImage})`, // Imagen dinámica
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
            backgroundColor: "rgba(231, 20, 20, 0.5)", // Oscurece la imagen
            zIndex: -1,
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
          <Typography>Upload Posting Video</Typography>
          <Switch
            checked={extraFormVisible}
            onChange={() => setExtraFormVisible(!extraFormVisible)}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "#800080", // Color del interruptor cuando está activado
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "#800080", // Color de la pista cuando está activado
              },
              "&:hover .MuiSwitch-switchBase.Mui-checked": {
                color: "#660066", // Color en hover
              },
              "&:hover .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "#660066", // Color de la pista en hover
              },
            }}
          />
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "center", // Centra los inputs dentro del Card
              }}
            >
              {extraFormVisible ? (
                <>
                  <FormControl defaultValue="" required>
                    <Label>Movie Name</Label>
                    <CustomInput
                      placeholder="Title"
                      value={extraFormData.extraField1}
                      onChange={handleInputChangeTwo(
                        "extraField1",
                        setExtraFormData
                      )}
                    />
                  </FormControl>

                  <FormControl defaultValue="" required>
                    <Label>Movie oficial image</Label>
                    <CustomInput
                      placeholder="Thumb"
                      value={extraFormData.extraField2}
                      onChange={handleInputChangeTwo(
                        "extraField2",
                        setExtraFormData
                      )}
                    />
                  </FormControl>

                  <FormControl defaultValue="" required>
                    <Label>Movie images</Label>
                    <CustomInput
                      placeholder="Thumbs"
                      value={extraFormData.extraField3}
                      onChange={handleInputChangeTwo(
                        "extraField3",
                        setExtraFormData
                      )}
                    />
                  </FormControl>

                  <FormControl>
                    <Label>Movie trailer</Label>
                    <CustomInput
                      placeholder="Trailer"
                      value={extraFormData.trailer}
                      onChange={handleInputChangeTwo(
                        "trailer",
                        setExtraFormData
                      )}
                    />
                  </FormControl>

                  <FormControl>
                    <Label>Movie description</Label>
                    <CustomInput
                      placeholder="Description"
                      value={extraFormData.extraField4}
                      onChange={handleInputChangeTwo(
                        "extraField4",
                        setExtraFormData
                      )}
                    />
                  </FormControl>

                  <FormControl defaultValue="" required>
                    <Label>Movie downloads</Label>
                    <CustomInput
                      placeholder="Downloads"
                      value={extraFormData.extraField5}
                      onChange={handleInputChangeTwo(
                        "extraField5",
                        setExtraFormData
                      )}
                    />
                  </FormControl>
                </>
              ) : (
                <>
                  <FormControl defaultValue="" required>
                    <Label>Video Name</Label>
                    <CustomInput
                      placeholder="Write the video name"
                      value={formData.videoName}
                      onChange={handleInputChange("videoName")}
                    />
                  </FormControl>
                  <FormControl defaultValue="" required>
                    <Label>Video Url</Label>
                    <CustomInput
                      placeholder="Write the video url"
                      value={formData.videoUrl}
                      onChange={handleInputChange("videoUrl")}
                    />
                  </FormControl>
                  <FormControl defaultValue="" required>
                    <Label>Video Download</Label>
                    <CustomInput
                      placeholder="Write the video download link"
                      value={formData.videoDownload}
                      onChange={handleInputChange("videoDownload")}
                    />
                  </FormControl>
                  <FormControl defaultValue="" required>
                    <Label>Video Official Photo</Label>
                    <CustomInput
                      placeholder="Write the images link"
                      value={formData.videoOfficialPhoto}
                      onChange={handleInputChange("videoOfficialPhoto")}
                    />
                  </FormControl>
                  <FormControl defaultValue="" required>
                    <Label>Video Thumbs</Label>
                    <CustomInput
                      placeholder="Write the images video"
                      value={formData.videoThumbs}
                      onChange={handleInputChange("videoThumbs")}
                    />
                  </FormControl>
                  <FormControl defaultValue="" required>
                    <Label>Video Tags</Label>
                    <CustomInput
                      placeholder="Write the tags"
                      value={formData.tags}
                      onChange={handleInputChange("tags")}
                    />
                  </FormControl>
                  <FormControl defaultValue="" required>
                    <Label>Video Time</Label>
                    <CustomInput
                      placeholder="Write the time video"
                      value={formData.tags}
                      onChange={handleInputChange("videoTime")}
                    />
                  </FormControl>
                  <FormControl defaultValue="" required>
                    <Label>Video Description</Label>
                    <CustomInput
                      placeholder="Write the description"
                      value={formData.tags}
                      onChange={handleInputChange("videoDescription")}
                    />
                  </FormControl>
                </>
              )}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleReset}
                sx={{
                  backgroundColor: "#f129f1", // Morado
                  "&:hover": { backgroundColor: "#b377b3" }, // Oscurece al pasar el mouse
                  width: "30%", // Ajusta el ancho del botón
                  marginRight: "13px",
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Clear"
                )}
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{
                  backgroundColor: "#800080", // Morado
                  "&:hover": { backgroundColor: "#660066" }, // Oscurece al pasar el mouse
                  width: "50%", // Ajusta el ancho del botón
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Submit"
                )}
              </Button>
            </Box>
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

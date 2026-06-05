import Image from "next/image";
import { Card, Typography, Box } from "@mui/material";
import { useRouter } from "next/router";

interface Props {
  profile: string;
  imageCount: number;
  thumbnail: any;
}

const isVideo = (url?: string) => {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)$/i.test(url.split("?")[0]);
};

export default function ProfileCard({
  profile,
  imageCount,
  thumbnail,
}: Props) {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(
      `/images/profile/${encodeURIComponent(profile)}`
    );
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        cursor: "pointer",
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        backgroundColor: "#111",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 16px 32px rgba(240, 19, 229, 0.25)",
        },
      }}
    >
      <Box sx={{ position: "relative", aspectRatio: "3/4", width: "100%" }}>
        {isVideo(thumbnail.preview_url || thumbnail.image_url) ? (
          <video
            src={thumbnail.preview_url || thumbnail.image_url}
            autoPlay
            loop
            muted
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <Image
            src={thumbnail.preview_url || thumbnail.image_url}
            alt={profile}
            fill
            sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 20vw"
            style={{ objectFit: "cover" }}
          />
        )}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
            p: 2,
            pt: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <Typography variant="subtitle1" sx={{ color: "#fff", fontWeight: 700, textTransform: "capitalize", lineHeight: 1.2, mb: 0.5 }}>
            {profile}
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
            {imageCount} {imageCount === 1 ? 'imagen' : 'imágenes'}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}
import { Box } from "@mui/material";
import { usePaginatedImages } from "@/hooks/useImages";
import ProfileCard from "./ImageCard";

interface Props {
  page: number;
}

export default function ImageGrid({ page }: Props) {
  const { images } = usePaginatedImages(page, 500);

  const groupedProfiles = Object.values(
    images.reduce((acc: any, image: any) => {
      let profile = "unknown";
      
      if (image.tags) {
        if (typeof image.tags === "string") {
          try {
            const parsed = JSON.parse(image.tags);
            profile = parsed.profile || profile;
          } catch (e) {}
        } else {
          profile = image.tags.profile || profile;
        }
      }
      
      if (profile === "unknown" && image.title) {
        profile = image.title;
      }

      if (!acc[profile]) {
        acc[profile] = {
          profile,
          imageCount: 0,
          thumbnail: image,
        };
      }

      acc[profile].imageCount++;

      return acc;
    }, {})
  );

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2,1fr)",
          sm: "repeat(3,1fr)",
          md: "repeat(4,1fr)",
          lg: "repeat(5,1fr)",
          xl: "repeat(6,1fr)",
        },
        gap: { xs: 2, md: 3 },
        padding: { xs: 2, md: 3 },
      }}
    >
      {groupedProfiles.map((profile: any) => (
        <ProfileCard
          key={profile.profile}
          profile={profile.profile}
          imageCount={profile.imageCount}
          thumbnail={profile.thumbnail}
        />
      ))}
    </Box>
  );
}
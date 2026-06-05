import { useEffect, useState } from "react";
import { getImagesByProfile, getImagesPaginated } from "@/api/image.service";

export const useProfileImages = (
  profile?: string,
  page: number = 1,
  pageSize: number = 25
) => {
  const [images, setImages] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const loadImages = async () => {
      try {
        setLoading(true);
        const result = await getImagesByProfile(profile, pageSize, page);

        setImages(result.items);
        setTotalCount(result.totalCount);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [profile, page, pageSize]);

  return {
    images,
    loading,
    totalCount,
    setImages,
  };
};

export const usePaginatedImages = (
  page: number,
  pageSize: number = 30
) => {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true);
        const result = await getImagesPaginated(pageSize, page);
        setImages(result.items);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [page, pageSize]);

  return {
    images,
    loading,
    setImages,
  };
};
import { supabase } from "./supabaseClient";
import { SupabaseImage } from "./types/image.types";

export const getImagesPaginated = async (
  pageSize: number,
  page: number
) => {
  const response = await fetch(
    `/api/images?page=${page}&pageSize=${pageSize}`
  );

  if (!response.ok) {
    throw new Error("Error loading images");
  }

  return response.json();
};

export const getImagesByProfile = async (
  profile: string,
  pageSize = 100,
  page = 1
) => {
  const response = await fetch(
    `/api/images?profile=${encodeURIComponent(
      profile
    )}&page=${page}&pageSize=${pageSize}`
  );

  if (!response.ok) {
    throw new Error("Error loading images");
  }

  return response.json();
};

export const updateImageRating = async (
  id: string,
  type: "like" | "dislike",
  currentValue: number
) => {
  const { data, error } = await supabase
    .from("images")
    .update({ [type]: currentValue + 1 })
    .eq("id", id)
    .select();

  if (error) throw error;
  return data?.[0];
};
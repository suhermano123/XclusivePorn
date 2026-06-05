export interface SupabaseImage {
  id: string;
  filename: string;
  image_url: string;
  title: string;
  description: string;
  tags: any; // jsonb
  created_at: string;
  preview_url: string;
  like: number;
  dislike: number;
}

export interface Image {
  id: string;
  url: string;
  title: string;
  description?: string;
  tags: string[];
  createdAt: string;
  likes: number;
  dislikes: number;
}
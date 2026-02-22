import { MetadataRoute } from "next";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BASE_URL = "https://novapornx.com";

// Helper to generate slugs consistent with the app's navigation
const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/Porn/Images`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/DMCA/Dmca`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/TERMS/TermsUse`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/Privacy-policy/policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // 2. Dynamic Video Routes
  try {
    const { data: videos, error } = await supabase
      .from('posted_videos')
      .select('uuid, titulo, created_at')
      .order('created_at', { ascending: false })
      .limit(1000); // Limit to top 1000 for performance

    if (error || !videos) {
      console.error('Error fetching videos for sitemap:', error);
      return staticRoutes;
    }

    const videoRoutes: MetadataRoute.Sitemap = videos.map((video) => {
      const slug = generateSlug(video.titulo || 'video');
      return {
        url: `${BASE_URL}/video/${video.uuid}-${slug}`,
        lastModified: video.created_at ? new Date(video.created_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      };
    });

    return [...staticRoutes, ...videoRoutes];
  } catch (err) {
    console.error('Sitemap generation failed:', err);
    return staticRoutes;
  }
}

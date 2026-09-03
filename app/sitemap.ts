import { MetadataRoute } from "next";
import { createClient } from '@supabase/supabase-js';
import { isValidEntityName } from '@/api/ssrVideos';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BASE_URL = "https://novapornx.com";

// Helper to generate slugs consistent with the app's navigation
const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const categories = [
  "amateur", "anal", "asian", "bbw", "bdsm", "bedroom", "big ass", "big tits",
  "blonde", "blowjob", "boss", "brunette", "camgirl", "casting", "cheating",
  "couple", "cowgirl", "creampie", "cumshot", "curvy", "deepthroat", "doggy style",
  "dominant", "double penetration", "ebony", "facial", "femdom", "fetish",
  "gangbang", "glamour", "handjob", "hardcore", "interracial"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static Routes
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/categories`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/Porn/Images`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    // Keyword landing pages
    { url: `${BASE_URL}/premium-hd-porn`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/free-hd-porn-videos`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/4k-porn-videos`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/latina-hd-porn`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/category/${encodeURIComponent(cat.toLowerCase())}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

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

    // 3. Performer + studio routes, derived from the catalogue metadata
    const entityRoutes: MetadataRoute.Sitemap = [];
    try {
      const { data: meta } = await supabase
        .from('posted_videos')
        .select('actresses, studio')
        .limit(5000);

      const collect = (cell: unknown, into: Set<string>) => {
        for (const raw of String(cell || '').split(',')) {
          const name = raw.trim();
          if (!name || !isValidEntityName(name)) continue;
          const slug = generateSlug(name);
          if (slug) into.add(slug);
        }
      };

      const performers = new Set<string>();
      const studios = new Set<string>();
      for (const row of meta || []) {
        collect((row as any).actresses, performers);
        collect((row as any).studio, studios);
      }

      entityRoutes.push(
        { url: `${BASE_URL}/pornstars`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
        { url: `${BASE_URL}/studios`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
        ...[...performers].map((slug) => ({
          url: `${BASE_URL}/pornstar/${slug}`,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        })),
        ...[...studios].map((slug) => ({
          url: `${BASE_URL}/studio/${slug}`,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        })),
      );
    } catch (e) {
      console.error('Sitemap: performer/studio routes failed:', e);
    }

    return [...staticRoutes, ...categoryRoutes, ...entityRoutes, ...videoRoutes];
  } catch (err) {
    console.error('Sitemap generation failed:', err);
    return [...staticRoutes, ...categoryRoutes];
  }
}

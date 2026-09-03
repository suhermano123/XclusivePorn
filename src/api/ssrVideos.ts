import type { GetServerSideProps } from "next";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseVideo } from "./videoSupabaseService";

const DEFAULT_PAGE_SIZE = 24;

const supabaseServer = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

/** Strip characters that would break a PostgREST `.or()` / `.ilike()` filter string. */
const clean = (s: string) => s.replace(/[(),*%]/g, "").trim();

/**
 * Rejects junk entries the scraper sometimes writes into the comma-separated
 * `actresses` cell — e.g. "STUDIO: BangBros" or "Not available". Without this
 * they become bogus /pornstar/ pages.
 */
export const isValidEntityName = (name: string): boolean => {
  const n = name.trim();
  if (n.length < 2) return false;
  const lower = n.toLowerCase();
  if (lower === "not available" || lower === "unknown" || lower === "n/a") return false;
  if (/^(studio|site|network|tags?|actriz|actress(es)?)\s*[:=]/i.test(n)) return false;
  return true;
};

export interface VideosPageResult {
  items: SupabaseVideo[];
  totalCount: number;
}

/**
 * Server-side equivalent of the client fetchers in videoSupabaseService — used
 * by pages' getServerSideProps so the first page of the grid is in the HTML.
 * Mirrors the filter logic of app/api/videos/route.ts.
 */
export async function fetchVideosPage(opts: {
  category?: string;
  searchQuery?: string;
  page?: number;
  pageSize?: number;
}): Promise<VideosPageResult> {
  const pageSize = opts.pageSize ?? DEFAULT_PAGE_SIZE;
  const page = Math.max(1, opts.page ?? 1);
  const from = (page - 1) * pageSize;

  let query = supabaseServer().from("posted_videos").select("*", { count: "exact" });

  if (opts.searchQuery) {
    const words = opts.searchQuery.split(/\s+/).map(clean).filter(Boolean);
    for (const word of words) {
      const lower = word.toLowerCase();
      const stem =
        lower.length > 3 && lower.endsWith("s") && !lower.endsWith("ss")
          ? word.slice(0, -1)
          : word;
      query = query.or(
        `titulo.ilike.%${stem}%,descripcion.ilike.%${stem}%,tags.ilike.%${stem}%`
      );
    }
  }

  if (opts.category) {
    query = query.ilike("tags", `%${clean(opts.category)}%`);
  }

  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  return { items: (data as SupabaseVideo[]) || [], totalCount: count || 0 };
}

/**
 * getServerSideProps factory for the keyword landing pages
 * (/premium-hd-porn, /4k-porn-videos, …). Reads ?page=N.
 */
export function landingVideosGSSP(opts: {
  category?: string;
  searchQuery?: string;
}): GetServerSideProps<{ items: SupabaseVideo[]; totalCount: number }> {
  return async ({ query, res }) => {
    const page = Math.max(1, parseInt(String(query.page ?? "1"), 10) || 1);
    const { items, totalCount } = await fetchVideosPage({ ...opts, page });
    try {
      res.setHeader(
        "Cache-Control",
        "public, s-maxage=600, stale-while-revalidate=86400"
      );
    } catch {
      /* the edge runtime may not expose res.setHeader */
    }
    return { props: { items, totalCount } };
  };
}

/** URL-safe slug, same normalisation used across the app. */
export const slugifyName = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

/** Turn a slug back into a search term ("isis-love" -> "isis love"). */
export const deslugify = (slug: string) => slug.replace(/-+/g, " ").trim();

export interface PersonPageResult extends VideosPageResult {
  /** Properly cased name as stored in the DB, or null when nothing matched. */
  displayName: string | null;
}

/**
 * Videos where `column` (comma-separated text: "actresses" or "studio")
 * contains `term`. Also recovers the canonical casing of the matched entry.
 */
export async function fetchVideosByEntity(opts: {
  column: "actresses" | "studio";
  slug: string;
  page?: number;
  pageSize?: number;
}): Promise<PersonPageResult> {
  const pageSize = opts.pageSize ?? DEFAULT_PAGE_SIZE;
  const page = Math.max(1, opts.page ?? 1);
  const from = (page - 1) * pageSize;
  const term = clean(deslugify(opts.slug));
  if (!term) return { items: [], totalCount: 0, displayName: null };

  const { data, count } = await supabaseServer()
    .from("posted_videos")
    .select("*", { count: "exact" })
    .ilike(opts.column, `%${term}%`)
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  const items = (data as SupabaseVideo[]) || [];

  // Recover canonical casing from the first row's comma-separated cell.
  let displayName: string | null = null;
  for (const row of items) {
    const cell = String((row as any)[opts.column] || "");
    const match = cell
      .split(",")
      .map((p) => p.trim())
      .find((p) => isValidEntityName(p) && slugifyName(p) === opts.slug);
    if (match) {
      displayName = match;
      break;
    }
  }
  if (!displayName && items.length > 0) {
    displayName = term.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return { items, totalCount: count || 0, displayName };
}

/** Distinct entities (with video counts) for the /pornstars and /studios indexes. */
export async function fetchEntityIndex(
  column: "actresses" | "studio",
  minCount = 1
): Promise<{ name: string; slug: string; count: number }[]> {
  const { data } = await supabaseServer()
    .from("posted_videos")
    .select(column)
    .limit(5000);

  const counts = new Map<string, { name: string; count: number }>();
  for (const row of (data as any[]) || []) {
    const cell = String(row?.[column] || "");
    for (const raw of cell.split(",")) {
      const name = raw.trim();
      if (!name || !isValidEntityName(name)) continue;
      const slug = slugifyName(name);
      if (!slug) continue;
      const prev = counts.get(slug);
      if (prev) prev.count += 1;
      else counts.set(slug, { name, count: 1 });
    }
  }

  return [...counts.entries()]
    .map(([slug, v]) => ({ slug, name: v.name, count: v.count }))
    .filter((e) => e.count >= minCount)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/**
 * Map raw R2 dev bucket URLs (pub-*.r2.dev, on older rows) to the branded custom
 * domain for that bucket. schema.org content/thumbnail URLs should be on-domain
 * and cache-friendly. Non-R2 hosts (e.g. xmoviescdn.online thumbnails) pass through.
 */
const R2_HOST_MAP: Record<string, string> = {
  "pub-8a7870d75cc841b788eafa8b0f0fbf0c.r2.dev": "cdn.novapornx.com",     // videos-play (HLS)
  "pub-c9afcfde57fd4b9fbc70f2802ea3ed05.r2.dev": "img.novapornx.com",     // video-previews (thumbs)
  "pub-15e6f7ea96c24e029fddf76d90aa3a9c.r2.dev": "preview.novapornx.com", // videos-info (preview mp4)
};

export function normalizeStreamUrl(url: string | null | undefined): string {
  if (!url) return "";
  for (const [raw, cdn] of Object.entries(R2_HOST_MAP)) {
    if (url.includes(raw)) return url.replace(`http://${raw}`, `https://${cdn}`).replace(`https://${raw}`, `https://${cdn}`);
  }
  // source-site thumbnail CDN -> same-origin proxy (next.config.ts rewrite)
  if (url.includes("xmoviescdn.online")) {
    return url.replace(/https?:\/\/xmoviescdn\.online/i, "https://novapornx.com/image-proxy");
  }
  // any other pub-*.r2.dev -> assume the HLS bucket
  return url.replace(/https?:\/\/pub-[a-z0-9]+\.r2\.dev/i, "https://cdn.novapornx.com");
}

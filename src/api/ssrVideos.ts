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

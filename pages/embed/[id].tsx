import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { createClient } from "@supabase/supabase-js";
import { normalizeStreamUrl } from "@/api/ssrVideos";
import type { SupabaseVideo } from "@/api/videoSupabaseService";

// Cloudflare Pages requires the Edge runtime for pages using getServerSideProps.
export const config = { runtime: "experimental-edge" };

const VideoPlayer = dynamic(() => import("@/components/VideoPlayer/VideoPlayer"), { ssr: false });

const BASE_URL = "https://novapornx.com";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const buildSlug = (t: string) =>
  t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-");

const toISODuration = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0 ? `PT${h}H${m}M${s}S` : `PT${m}M${s}S`;
};

/**
 * Bare, iframe-embeddable player page. Its URL is the `embedUrl` of every
 * VideoObject — Google's video crawler frames this to index the video, since
 * an HLS .m3u8 as `contentUrl` is not reliably processed.
 */
export default function EmbedPage({
  video,
  streamUrl,
  poster,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const title = video.titulo || "Video";
  const watchUrl = `${BASE_URL}/video/${video.uuid}-${buildSlug(title)}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: title,
    description:
      video.descripcion ||
      `Watch "${title}" free in HD at NovaPornX.`,
    thumbnailUrl: [poster],
    uploadDate: video.created_at || new Date().toISOString(),
    ...(video.duracion_segundos && video.duracion_segundos > 0
      ? { duration: toISODuration(video.duracion_segundos) }
      : {}),
    embedUrl: `${BASE_URL}/embed/${video.uuid}`,
    contentUrl: streamUrl,
    url: watchUrl,
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="robots" content="noindex, follow, max-video-preview:-1" />
        <link rel="canonical" href={watchUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <style>{`
          html,body{margin:0;padding:0;background:#000;height:100%;overflow:hidden}
          #wrap,#wrap>div{width:100%;height:100%}
          .video-js{width:100%!important;height:100%!important}
        `}</style>
      </Head>
      <div id="wrap">
        {/* Poster is in the SSR HTML so the crawler sees a video surface pre-JS */}
        <noscript>
          <img src={poster} alt={title} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </noscript>
        <VideoPlayer
          videoEmbedUrl={streamUrl}
          poster={poster}
          title={title}
          autoplay={false}
          muted={true}
        />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<{
  video: SupabaseVideo;
  streamUrl: string;
  poster: string;
}> = async ({ params, res }) => {
  const raw = String(params?.id ?? "");
  const uuid = raw.slice(0, 36).toLowerCase();
  if (!UUID_RE.test(uuid)) return { notFound: true };

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
  const { data: video, error } = await supabase
    .from("posted_videos")
    .select("*")
    .eq("uuid", uuid)
    .single();

  if (error || !video) return { notFound: true };

  const streamUrl = normalizeStreamUrl(
    video.video_stream_url || `${BASE_URL}/api/media?uuid=${video.uuid}&type=stream`
  );
  const poster = normalizeStreamUrl((video.imagen_url || "").split(",")[0].trim());

  try {
    // Explicitly allow this page to be framed by anyone (video-index crawler).
    res.setHeader("Content-Security-Policy", "frame-ancestors *");
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  } catch {
    /* the edge runtime may not expose res.setHeader */
  }

  return { props: { video: video as SupabaseVideo, streamUrl, poster } };
};

import { useEffect } from "react";
import { useRouter } from "next/router";

interface AdZoneProps {
  /** ExoClick "eas..." class for this ad unit (from their embed snippet). */
  className: string;
  /** ExoClick zone id. */
  zoneId: string;
}

/**
 * One ExoClick ad placement. The ad-provider.js loader is loaded once,
 * globally, in _app.tsx — this only renders the <ins> slot and asks the
 * (already-loaded-or-loading) AdProvider queue to serve it. Re-serves on
 * client-side route changes so the slot doesn't go stale across navigations
 * that don't remount the page.
 */
export default function AdZone({ className, zoneId }: AdZoneProps) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const adProvider = ((window as any).AdProvider = (window as any).AdProvider || []);
    adProvider.push({ serve: {} });
  }, [router.asPath]);

  return <ins className={className} data-zoneid={zoneId} />;
}

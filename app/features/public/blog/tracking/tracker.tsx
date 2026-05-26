import { useEffect, useRef } from "react";

import { hasActivePublicBlogViewLock, PUBLIC_BLOG_VIEW_TRACKER_FIELD } from "./shared";

interface PublicBlogPostTrackerProps {
  action: string;
  articleId: string;
  slug: string;
}

function measureScrollMetrics(article: HTMLElement) {
  const rect = article.getBoundingClientRect();
  const articleHeight = Math.max(article.offsetHeight, rect.height, 1);
  const viewportBottom = window.innerHeight - rect.top;
  const visibleDistance = Math.min(articleHeight, Math.max(0, viewportBottom));

  return { visibleDistance, articleHeight };
}

function buildTrackPayload(args: {
  scrollRate: number;
  secondsSpent: number;
  slug: string;
}) {
  return new URLSearchParams({
    [PUBLIC_BLOG_VIEW_TRACKER_FIELD.scrollRate]: String(args.scrollRate),
    [PUBLIC_BLOG_VIEW_TRACKER_FIELD.secondsSpent]: String(args.secondsSpent),
    [PUBLIC_BLOG_VIEW_TRACKER_FIELD.slug]: args.slug,
  });
}

export function PublicBlogPostTracker({
  action,
  articleId,
  slug,
}: PublicBlogPostTrackerProps) {
  const maxVisibleDistanceRef = useRef(0);
  const articleHeightRef = useRef(1);
  const startedAtRef = useRef<number | null>(null);
  const sentRef = useRef(false);
  const trackingReadyRef = useRef(false);

  useEffect(() => {
    // Reset refs when dependencies (like slug) change
    sentRef.current = false;
    maxVisibleDistanceRef.current = 0;
    articleHeightRef.current = 1;
    trackingReadyRef.current = false;
    startedAtRef.current =
      typeof performance !== "undefined" ? performance.now() : Date.now();

    // Use a small timeout to ignore React 18 StrictMode double-invocations
    let isValidUnmount = false;
    const strictModeTimeout = setTimeout(() => {
      isValidUnmount = true;
    }, 100);

    const measureScrollDepth = () => {
      if (!trackingReadyRef.current) {
        return;
      }

      const article = document.getElementById(articleId);

      if (!article) {
        return;
      }

      const { visibleDistance, articleHeight } = measureScrollMetrics(article);

      maxVisibleDistanceRef.current = Math.max(
        maxVisibleDistanceRef.current,
        visibleDistance,
      );
      articleHeightRef.current = articleHeight;
    };

    const flushTracking = () => {
      if (sentRef.current) {
        return;
      }

      if (hasActivePublicBlogViewLock(document.cookie, slug, new Date())) {
        sentRef.current = true;
        return;
      }

      const startedAt =
        startedAtRef.current ??
        (typeof performance !== "undefined" ? performance.now() : Date.now());
      const secondsSpent = Math.max(
        1,
        Math.floor(
          ((typeof performance !== "undefined" ? performance.now() : Date.now()) -
            startedAt) /
            1000,
        ),
      );
      const scrollRate = Math.min(
        100,
        Math.round((maxVisibleDistanceRef.current / articleHeightRef.current) * 100),
      );
      const payload = buildTrackPayload({
        scrollRate,
        secondsSpent,
        slug,
      });
      const trackingUrl = new URL(action, window.location.href).toString();
      const sendBeacon = globalThis.navigator?.sendBeacon?.bind(globalThis.navigator);

      sentRef.current = true;

      if (sendBeacon?.(trackingUrl, payload)) {
        return;
      }

      void fetch(trackingUrl, {
        body: payload,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        keepalive: true,
        method: "POST",
      }).catch(() => undefined);
    };

    // React Router ScrollRestoration ve View Transitions gibi yapılar
    // sayfa geçişlerinde eski scroll pozisyonunu (sayfanın en altını) kısa bir an koruyabilir.
    // Animasyonlar ve scroll sıfırlaması bitene kadar beklemek için Grace Period (1000ms) ekliyoruz.
    const gracePeriodTimeout = setTimeout(() => {
      trackingReadyRef.current = true;
      measureScrollDepth(); // Layout ve scroll oturduktan sonra ilk ölçüm
    }, 1000);

    const handleScroll = () => {
      measureScrollDepth();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "hidden") {
        return;
      }

      measureScrollDepth();
      flushTracking();
    };
    const handlePageHide = () => {
      measureScrollDepth();
      flushTracking();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("unload", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(strictModeTimeout);
      clearTimeout(gracePeriodTimeout);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("unload", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (isValidUnmount) {
        measureScrollDepth();
        flushTracking();
      }
    };
  }, [action, articleId, slug]);

  return null;
}

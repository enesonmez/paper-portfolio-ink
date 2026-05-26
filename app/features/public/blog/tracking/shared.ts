import { z } from "zod";

export const PUBLIC_BLOG_VIEW_LOCK_COOKIE_NAME = "paper-view-lock";
export const PUBLIC_BLOG_VIEW_LOCK_WINDOW_MS = 12 * 60 * 60 * 1000;
const PUBLIC_BLOG_VIEW_LOCK_MAX_ENTRIES = 24;
const MAX_TRACKED_SECONDS = 24 * 60 * 60;

export const PUBLIC_BLOG_VIEW_TRACKER_FIELD = {
  scrollRate: "scrollRate",
  secondsSpent: "secondsSpent",
  slug: "slug",
} as const;

export interface PublicBlogTrackedViewMetrics {
  scrollRate: number;
  secondsSpent: number;
}

const publicBlogViewLockSnapshotSchema = z.record(
  z.string(),
  z.number().int().positive(),
);

export const publicBlogTrackPayloadSchema = z.object({
  scrollRate: z.coerce.number().finite().min(0).max(100),
  secondsSpent: z.coerce.number().finite().min(0).max(MAX_TRACKED_SECONDS),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

function clampNumber(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, Math.round(value)));
}

function parseCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) {
    return {};
  }

  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0)
      .map((segment) => {
        const [rawKey, ...rawValue] = segment.split("=");
        return [rawKey, rawValue.join("=")];
      }),
  );
}

function prunePublicBlogViewLockSnapshot(
  snapshot: Record<string, number>,
  now: Date,
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(snapshot)
      .filter(([, expiresAt]) => expiresAt > now.getTime())
      .sort(([, leftExpiresAt], [, rightExpiresAt]) => rightExpiresAt - leftExpiresAt)
      .slice(0, PUBLIC_BLOG_VIEW_LOCK_MAX_ENTRIES),
  );
}

export function readPublicBlogViewLockSnapshot(cookieHeader: string | null, now: Date) {
  const cookies = parseCookieHeader(cookieHeader);
  const cookieValue = cookies[PUBLIC_BLOG_VIEW_LOCK_COOKIE_NAME];

  if (!cookieValue) {
    return {};
  }

  try {
    const decoded: unknown = JSON.parse(decodeURIComponent(cookieValue));
    const parsed = publicBlogViewLockSnapshotSchema.parse(decoded);

    return prunePublicBlogViewLockSnapshot(parsed, now);
  } catch {
    return {};
  }
}

export function hasActivePublicBlogViewLock(
  cookieHeader: string | null,
  slug: string,
  now: Date,
) {
  return (readPublicBlogViewLockSnapshot(cookieHeader, now)[slug] ?? 0) > now.getTime();
}

export function buildPublicBlogViewLockCookie(args: {
  cookieHeader: string | null;
  expiresAt: Date;
  now: Date;
  slug: string;
}) {
  const snapshot = {
    ...readPublicBlogViewLockSnapshot(args.cookieHeader, args.now),
    [args.slug]: args.expiresAt.getTime(),
  };
  const prunedSnapshot = prunePublicBlogViewLockSnapshot(snapshot, args.now);
  const latestExpiry = Math.max(...Object.values(prunedSnapshot));
  const maxAgeSeconds = Math.max(
    1,
    Math.ceil((latestExpiry - args.now.getTime()) / 1000),
  );

  return [
    `${PUBLIC_BLOG_VIEW_LOCK_COOKIE_NAME}=${encodeURIComponent(
      JSON.stringify(prunedSnapshot),
    )}`,
    `Max-Age=${maxAgeSeconds}`,
    "Path=/",
    "SameSite=Lax",
  ].join("; ");
}

export function normalizeTrackedPostViewMetrics(
  metrics: PublicBlogTrackedViewMetrics,
): PublicBlogTrackedViewMetrics {
  return {
    scrollRate: clampNumber(metrics.scrollRate, 0, 100),
    secondsSpent: clampNumber(metrics.secondsSpent, 0, MAX_TRACKED_SECONDS),
  };
}

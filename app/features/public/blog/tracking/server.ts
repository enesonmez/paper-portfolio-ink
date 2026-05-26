import type { AppLoadContext } from "react-router";
import {
  acquirePostViewHistoryLock,
  getPublishedPostAnalyticsTargetBySlug,
  insertPostViewHistoryEntry,
} from "~/lib/analytics/view-history.server";
import {
  buildAuthorizationError,
  buildValidationError,
} from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { resolveAnalyticsConfig } from "~/shared/analytics/config.server";

import {
  buildPublicBlogViewLockCookie,
  normalizeTrackedPostViewMetrics,
  publicBlogTrackPayloadSchema,
  PUBLIC_BLOG_VIEW_TRACKER_FIELD,
  PUBLIC_BLOG_VIEW_LOCK_WINDOW_MS,
} from "./shared";

const textEncoder = new TextEncoder();

function extractClientIp(request: Request) {
  const headerCandidates = [
    request.headers.get("cf-connecting-ip"),
    request.headers.get("x-real-ip"),
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  ];

  for (const candidate of headerCandidates) {
    if (candidate && candidate.length > 0) {
      return candidate;
    }
  }

  return "unknown";
}

async function hashPublicPostViewActor(args: { request: Request; secret: string }) {
  const clientIp = extractClientIp(args.request);
  const userAgent = args.request.headers.get("user-agent")?.trim() ?? "unknown";
  const payload = textEncoder.encode(`${clientIp}:${userAgent}:${args.secret}`);
  const digest = await crypto.subtle.digest("SHA-256", payload);

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function assertSameOriginTrackingRequest(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");

  if (
    fetchSite &&
    fetchSite !== "same-origin" &&
    fetchSite !== "same-site" &&
    fetchSite !== "none"
  ) {
    throw buildAuthorizationError({
      action: APP_ERROR_ACTION.track,
      code: APP_ERROR_CODE.analytics.track.invalidOrigin,
      details: {
        fetchSite,
      },
      message: "Cross-site analytics tracking request rejected.",
      resource: APP_ERROR_RESOURCE.analytics,
      status: 403,
    });
  }

  const requestOrigin = request.headers.get("origin");

  if (!requestOrigin) {
    throw buildAuthorizationError({
      action: APP_ERROR_ACTION.track,
      code: APP_ERROR_CODE.analytics.track.invalidOrigin,
      details: {
        origin: null,
      },
      message: "Missing origin header on analytics tracking request.",
      resource: APP_ERROR_RESOURCE.analytics,
      status: 403,
    });
  }

  const expectedOrigin = new URL(request.url).origin;

  if (requestOrigin !== expectedOrigin) {
    throw buildAuthorizationError({
      action: APP_ERROR_ACTION.track,
      code: APP_ERROR_CODE.analytics.track.invalidOrigin,
      details: {
        origin: requestOrigin,
      },
      message: "Cross-origin analytics tracking request rejected.",
      resource: APP_ERROR_RESOURCE.analytics,
      status: 403,
    });
  }
}

async function parseTrackPublicBlogPostViewRequest(request: Request) {
  const formData = await request.formData();
  const parsed = publicBlogTrackPayloadSchema.safeParse({
    scrollRate: formData.get(PUBLIC_BLOG_VIEW_TRACKER_FIELD.scrollRate),
    secondsSpent: formData.get(PUBLIC_BLOG_VIEW_TRACKER_FIELD.secondsSpent),
    slug: formData.get(PUBLIC_BLOG_VIEW_TRACKER_FIELD.slug),
  });

  if (!parsed.success) {
    throw buildValidationError({
      action: APP_ERROR_ACTION.track,
      code: APP_ERROR_CODE.analytics.validation,
      details: {
        issues: parsed.error.flatten().fieldErrors,
      },
      message: "Invalid public blog analytics payload.",
      resource: APP_ERROR_RESOURCE.analytics,
      status: 400,
    });
  }

  return {
    ...parsed.data,
    ...normalizeTrackedPostViewMetrics(parsed.data),
  };
}

function buildNoStoreHeaders(setCookieHeader: string) {
  return new Headers({
    "Cache-Control": "no-store",
    "Set-Cookie": setCookieHeader,
  });
}

export async function trackPublicBlogPostView(
  context: AppLoadContext,
  request: Request,
) {
  assertSameOriginTrackingRequest(request);

  const submission = await parseTrackPublicBlogPostViewRequest(request);
  const analyticsConfig = resolveAnalyticsConfig({
    secret: context.analytics?.secret ?? context.auth?.secret,
  });
  const post = await getPublishedPostAnalyticsTargetBySlug(context.db, submission.slug);

  if (!post) {
    return new Response(null, {
      headers: {
        "Cache-Control": "no-store",
      },
      status: 204,
    });
  }

  const now = new Date();
  const userHash = await hashPublicPostViewActor({
    request,
    secret: analyticsConfig.secret,
  });
  const lockExpiresAt = new Date(now.getTime() + PUBLIC_BLOG_VIEW_LOCK_WINDOW_MS);
  const setCookieHeader = buildPublicBlogViewLockCookie({
    cookieHeader: request.headers.get("Cookie"),
    expiresAt: lockExpiresAt,
    now,
    slug: post.slug,
  });
  const lockAcquired = await acquirePostViewHistoryLock(context.db, {
    lockedUntil: lockExpiresAt,
    now,
    postId: post.id,
    userHash,
  });

  if (!lockAcquired) {
    return new Response(null, {
      headers: buildNoStoreHeaders(setCookieHeader),
      status: 204,
    });
  }

  await insertPostViewHistoryEntry(context.db, {
    postId: post.id,
    scrollRate: submission.scrollRate,
    secondsSpent: submission.secondsSpent,
    userHash,
  });

  return new Response(null, {
    headers: buildNoStoreHeaders(setCookieHeader),
    status: 204,
  });
}

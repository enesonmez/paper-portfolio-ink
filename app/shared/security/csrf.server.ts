import { buildAuthorizationError } from "~/shared/errors/builders.server";
import type {
  AppErrorAction,
  AppErrorCode,
  AppErrorResource,
} from "~/shared/errors/contracts";

const ALLOWED_FETCH_SITES = new Set(["none", "same-origin", "same-site"]);

interface AssertSameOriginMutationRequestOptions<TResponseData> {
  action: AppErrorAction;
  code: AppErrorCode;
  request: Request;
  resource: AppErrorResource;
  responseData?: TResponseData;
}

function normalizeHeaderValue(value: string | null) {
  return value?.trim() ?? "";
}

function readOriginFromHeader(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return value;
  }
}

export function assertSameOriginMutationRequest<TResponseData>(
  options: AssertSameOriginMutationRequestOptions<TResponseData>,
) {
  const expectedOrigin = new URL(options.request.url).origin;
  const fetchSite = normalizeHeaderValue(
    options.request.headers.get("sec-fetch-site"),
  ).toLowerCase();

  if (fetchSite.length > 0 && !ALLOWED_FETCH_SITES.has(fetchSite)) {
    throw buildAuthorizationError({
      action: options.action,
      code: options.code,
      details: {
        expectedOrigin,
        fetchSite,
      },
      message: "Cross-site mutation request rejected.",
      resource: options.resource,
      responseData: options.responseData,
      status: 403,
    });
  }

  const originHeader = normalizeHeaderValue(options.request.headers.get("origin"));

  if (originHeader.length > 0) {
    if (readOriginFromHeader(originHeader) !== expectedOrigin) {
      throw buildAuthorizationError({
        action: options.action,
        code: options.code,
        details: {
          expectedOrigin,
          origin: originHeader,
        },
        message: "Cross-site mutation request rejected.",
        resource: options.resource,
        responseData: options.responseData,
        status: 403,
      });
    }

    return;
  }

  const refererHeader = normalizeHeaderValue(options.request.headers.get("referer"));

  if (
    refererHeader.length > 0 &&
    readOriginFromHeader(refererHeader) === expectedOrigin
  ) {
    return;
  }

  throw buildAuthorizationError({
    action: options.action,
    code: options.code,
    details: {
      expectedOrigin,
      origin: originHeader || null,
      referer: refererHeader || null,
    },
    message: "Cross-site mutation request rejected.",
    resource: options.resource,
    responseData: options.responseData,
    status: 403,
  });
}

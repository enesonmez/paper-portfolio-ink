const requestIdCache = new WeakMap<Request, string>();

export const REQUEST_ID_HEADER = "X-Request-Id";

export function getRequestId(request: Request) {
  const cached = requestIdCache.get(request);

  if (cached) {
    return cached;
  }

  const headerValue = request.headers.get(REQUEST_ID_HEADER)?.trim();
  const requestId =
    headerValue && headerValue.length > 0 ? headerValue : crypto.randomUUID();

  requestIdCache.set(request, requestId);

  return requestId;
}

export function buildRequestIdHeaders(requestId: string, headers?: HeadersInit) {
  const result = new Headers(headers);

  result.set(REQUEST_ID_HEADER, requestId);

  return result;
}

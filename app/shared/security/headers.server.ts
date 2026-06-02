const NONCE_BYTES = 16;

function encodeBase64(bytes: Uint8Array) {
  return btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""));
}

export function createCspNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(NONCE_BYTES));

  return encodeBase64(bytes);
}

export function buildContentSecurityPolicy(nonce: string) {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "connect-src 'self'",
    "font-src 'self' https://fonts.gstatic.com data:",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "img-src 'self' https: data:",
    "manifest-src 'self'",
    "object-src 'none'",
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
    "worker-src 'self'",
  ].join("; ");
}

export function applySecurityHeaders(
  headers: Headers,
  options: {
    nonce: string;
  },
) {
  headers.set("Content-Security-Policy", buildContentSecurityPolicy(options.nonce));
  headers.set(
    "Permissions-Policy",
    [
      "accelerometer=()",
      "camera=()",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "payment=()",
      "usb=()",
    ].join(", "),
  );
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload",
  );
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");

  return headers;
}

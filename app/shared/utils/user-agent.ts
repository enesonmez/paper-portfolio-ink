export function parseReadableUserAgent(
  uaString: string | null,
  unknownDeviceLabel: string,
): string {
  if (!uaString) {
    return unknownDeviceLabel;
  }

  const ua = uaString.toLowerCase();

  let os = "Unknown OS";
  if (ua.includes("macintosh") || ua.includes("mac os x")) {
    os = "macOS";
  } else if (ua.includes("windows") || ua.includes("win32")) {
    os = "Windows";
  } else if (ua.includes("iphone") || ua.includes("ipad")) {
    os = "iOS";
  } else if (ua.includes("android")) {
    os = "Android";
  } else if (ua.includes("linux")) {
    os = "Linux";
  }

  let browser = "Unknown Browser";
  if (ua.includes("edg/")) {
    browser = "Edge";
  } else if (ua.includes("opr/") || ua.includes("opera")) {
    browser = "Opera";
  } else if (ua.includes("chrome") && !ua.includes("chromium")) {
    browser = "Chrome";
  } else if (ua.includes("firefox")) {
    browser = "Firefox";
  } else if (ua.includes("safari") && !ua.includes("chrome")) {
    browser = "Safari";
  }

  return `${browser} (${os})`;
}

import { stripLocalePrefix } from "~/shared/i18n/i18n.shared";

export function isPublicPathname(pathname: string) {
  const normalizedPathname = stripLocalePrefix(pathname);

  return (
    normalizedPathname === "/" ||
    normalizedPathname.startsWith("/projects") ||
    normalizedPathname.startsWith("/blog")
  );
}

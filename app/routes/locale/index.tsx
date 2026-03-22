import { redirect } from "react-router";
import type { Route } from "./+types/index";

import { buildLocaleCookie } from "~/shared/i18n/i18n.shared";
import { buildLocaleHomePath, loadI18nRuntimeState } from "~/shared/i18n/i18n.server";

export async function loader({ context, request }: Route.LoaderArgs) {
  const { locale } = await loadI18nRuntimeState(context, request);
  const target = buildLocaleHomePath(locale);

  return redirect(target, {
    headers: {
      "Set-Cookie": buildLocaleCookie(locale),
    },
  });
}

export default function LocaleIndexRoute() {
  return null;
}

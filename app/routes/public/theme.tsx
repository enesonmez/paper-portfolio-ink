import { redirect } from "react-router";
import type { Route } from "./+types/theme";

import { buildLocalizedPath } from "~/shared/i18n/i18n.shared";
import { loadI18nRuntimeState } from "~/shared/i18n/i18n.server";
import {
  buildThemeCookie,
  parseThemeFormData,
} from "~/features/public/layout/theme.server";

export async function action({ context, request }: Route.ActionArgs) {
  const formData = await request.formData();
  const parsed = parseThemeFormData(formData);
  const { locale, supportedLocaleCodes } = await loadI18nRuntimeState(context, request);

  if (!parsed) {
    return redirect(buildLocalizedPath(locale, "/", supportedLocaleCodes));
  }

  return redirect(parsed.redirectTo, {
    headers: {
      "Set-Cookie": buildThemeCookie(parsed.theme),
    },
  });
}

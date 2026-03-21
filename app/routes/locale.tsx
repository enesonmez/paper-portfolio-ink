import { redirect } from "react-router";
import type { Route } from "./+types/locale";

import {
  buildLocaleCookie,
  sanitizeLocalizedRedirectTarget,
} from "~/features/i18n/i18n.shared";
import { loadI18nRuntimeState, parseLocaleFormData } from "~/features/i18n/i18n.server";

export async function action({ context, request }: Route.ActionArgs) {
  const formData = await request.formData();
  const { defaultLocale, supportedLocaleCodes, supportedLocales } =
    await loadI18nRuntimeState(context, request);
  const parsed = parseLocaleFormData(formData, supportedLocales);

  if (!parsed) {
    const locale = defaultLocale;

    return redirect(
      sanitizeLocalizedRedirectTarget("/", locale, supportedLocaleCodes),
      {
        headers: {
          "Set-Cookie": buildLocaleCookie(locale),
        },
      },
    );
  }

  return redirect(parsed.redirectTo, {
    headers: {
      "Set-Cookie": buildLocaleCookie(parsed.locale),
    },
  });
}

export default function LocaleActionRoute() {
  return null;
}

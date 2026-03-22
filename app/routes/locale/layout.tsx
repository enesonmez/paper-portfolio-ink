import { Outlet } from "react-router";
import type { Route } from "./+types/layout";

import { loadI18nRuntimeState } from "~/shared/i18n/i18n.server";
import { isSupportedLocale } from "~/shared/i18n/i18n.shared";

class LocaleNotFoundError extends Error {
  status = 404;

  constructor() {
    super("Not Found");
  }
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { supportedLocaleCodes } = await loadI18nRuntimeState(context, request);

  if (!isSupportedLocale(params.locale, supportedLocaleCodes)) {
    throw new LocaleNotFoundError();
  }

  return {
    locale: params.locale.toLowerCase(),
  };
}

export default function LocalePrefixRoute() {
  return <Outlet />;
}

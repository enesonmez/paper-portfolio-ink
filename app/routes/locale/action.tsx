import { redirect } from "react-router";
import type { Route } from "./+types/action";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
  APP_ROUTE_ID,
} from "~/shared/errors/contracts";

import { runActionWithErrorHandling } from "~/shared/errors/route-error-handling.server";
import {
  buildLocaleCookie,
  sanitizeLocalizedRedirectTarget,
} from "~/shared/i18n/i18n.shared";
import { loadI18nRuntimeState, parseLocaleFormData } from "~/shared/i18n/i18n.server";
import { assertSameOriginMutationRequest } from "~/shared/security/csrf.server";

export async function action({ context, request }: Route.ActionArgs) {
  return runActionWithErrorHandling({
    context,
    handler: async () => {
      assertSameOriginMutationRequest({
        action: APP_ERROR_ACTION.update,
        code: APP_ERROR_CODE.security.csrf.invalidOrigin,
        request,
        resource: APP_ERROR_RESOURCE.locale,
      });
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
    },
    request,
    routeId: APP_ROUTE_ID.localeAction,
  });
}

export default function LocaleActionRoute() {
  return null;
}

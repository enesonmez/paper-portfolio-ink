import { redirect, type AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../../db/context";
import {
  purgeAccountConfigurationCache,
  updateAccountConfigurationParameter,
} from "~/lib/configuration/configuration.server";
import { parseAccountConfigurationFormData } from "~/lib/configuration/configuration-form.server";
import { APP_ERROR_ACTION, APP_ERROR_RESOURCE } from "~/shared/errors/contracts";
import { buildLocalizedPath, type createTranslator } from "~/shared/i18n/i18n.shared";
import { recordAuditLog } from "~/shared/logging/audit.server";

import { buildDashboardSettingsHref } from "../state";

export async function handleUpdateAccountConfigurationMutation(args: {
  context: AppLoadContext;
  formData: FormData;
  intent: string;
  locale: string;
  request: Request;
  supportedLocaleCodes: readonly string[];
  t: ReturnType<typeof createTranslator>;
}) {
  const db = getDbFromContext(args.context);
  const submission = parseAccountConfigurationFormData(args.formData, args.t);

  await updateAccountConfigurationParameter(db, submission);
  await purgeAccountConfigurationCache(args.context, args.request);

  await recordAuditLog({
    action: APP_ERROR_ACTION.update,
    context: args.context,
    details: {
      intent: args.intent,
      key: submission.key,
    },
    message: "Account configuration updated",
    request: args.request,
    resource: APP_ERROR_RESOURCE.settings,
    result: "success",
    statusCode: 302,
    targetId: submission.key,
    targetLabel: submission.key,
  });

  const targetTab = submission.key.startsWith("appearance.") ? "appearance" : "account";

  return redirect(
    buildLocalizedPath(
      args.locale,
      buildDashboardSettingsHref(targetTab),
      args.supportedLocaleCodes,
    ),
  );
}

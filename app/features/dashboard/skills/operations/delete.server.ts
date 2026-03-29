import { redirect, type AppLoadContext } from "react-router";

import type { getDbFromContext } from "../../../../../db/context";
import { deleteSkill } from "~/lib/skills/skills.server";
import { purgePublicHomeDataCache } from "~/features/public/home/server";
import { buildValidationError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { buildLocalizedPath } from "~/shared/i18n/i18n.shared";
import { recordAuditLog } from "~/shared/logging/audit.server";

import {
  buildSkillFormState,
  type DashboardSkillsFormCopy,
} from "./_shared/support.server";

export async function handleDeleteSkillMutation(args: {
  context: AppLoadContext;
  db: ReturnType<typeof getDbFromContext>;
  formCopy: DashboardSkillsFormCopy;
  intent: string;
  locale: string;
  request: Request;
  skillId: string;
  supportedLocaleCodes: string[];
}) {
  if (!args.skillId) {
    throw buildValidationError({
      action: APP_ERROR_ACTION.delete,
      code: APP_ERROR_CODE.skills.delete.missingId,
      message: "Skill delete action missing target identifier",
      resource: APP_ERROR_RESOURCE.skills,
      responseData: buildSkillFormState({
        form: args.formCopy.errors.deleteMissingSkill,
      }),
    });
  }

  await deleteSkill(args.db, args.skillId);
  await purgePublicHomeDataCache(args.context, args.request);
  await recordAuditLog({
    action: APP_ERROR_ACTION.delete,
    context: args.context,
    details: {
      intent: args.intent,
    },
    message: "Skill deleted",
    request: args.request,
    resource: APP_ERROR_RESOURCE.skills,
    result: "success",
    statusCode: 302,
    targetId: args.skillId,
  });

  return redirect(
    buildLocalizedPath(args.locale, "/dashboard/skills", args.supportedLocaleCodes),
  );
}

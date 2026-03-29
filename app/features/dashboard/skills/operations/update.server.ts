import { redirect, type AppLoadContext } from "react-router";

import type { getDbFromContext } from "../../../../../db/context";
import { updateSkill } from "~/lib/skills/skills.server";
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
  runSkillMutation,
  type DashboardSkillSubmission,
  type DashboardSkillsFormCopy,
} from "./_shared/support.server";

export async function handleUpdateSkillMutation(args: {
  context: AppLoadContext;
  db: ReturnType<typeof getDbFromContext>;
  formCopy: DashboardSkillsFormCopy;
  intent: string;
  locale: string;
  request: Request;
  skillId: string;
  submission: DashboardSkillSubmission;
  supportedLocaleCodes: string[];
}) {
  if (!args.skillId) {
    throw buildValidationError({
      action: APP_ERROR_ACTION.update,
      code: APP_ERROR_CODE.skills.update.missingId,
      message: "Skill update action missing target identifier",
      resource: APP_ERROR_RESOURCE.skills,
      responseData: buildSkillFormState(
        {
          form: args.formCopy.errors.updateMissingSkill,
        },
        args.submission,
      ),
    });
  }

  await runSkillMutation({
    db: args.db,
    duplicateCode: APP_ERROR_CODE.skills.update.duplicateSlug,
    duplicateMessage: args.formCopy.errors.updateDuplicateSkill,
    excludedSkillId: args.skillId,
    mutate: () => updateSkill(args.db, args.skillId, args.submission),
    values: args.submission,
  });

  await purgePublicHomeDataCache(args.context, args.request);
  await recordAuditLog({
    action: APP_ERROR_ACTION.update,
    context: args.context,
    details: {
      intent: args.intent,
      name: args.submission.name,
    },
    message: "Skill updated",
    request: args.request,
    resource: APP_ERROR_RESOURCE.skills,
    result: "success",
    statusCode: 302,
    targetId: args.skillId,
    targetLabel: args.submission.name,
  });

  return redirect(
    buildLocalizedPath(args.locale, "/dashboard/skills", args.supportedLocaleCodes),
  );
}

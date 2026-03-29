import { redirect, type AppLoadContext } from "react-router";

import type { getDbFromContext } from "../../../../../db/context";
import { createSkill } from "~/lib/skills/skills.server";
import { purgePublicHomeDataCache } from "~/features/public/home/server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { buildLocalizedPath } from "~/shared/i18n/i18n.shared";
import { recordAuditLog } from "~/shared/logging/audit.server";

import {
  runSkillMutation,
  type DashboardSkillSubmission,
  type DashboardSkillsFormCopy,
} from "./_shared/support.server";

export async function handleCreateSkillMutation(args: {
  context: AppLoadContext;
  db: ReturnType<typeof getDbFromContext>;
  formCopy: DashboardSkillsFormCopy;
  intent: string;
  locale: string;
  request: Request;
  submission: DashboardSkillSubmission;
  supportedLocaleCodes: string[];
}) {
  await runSkillMutation({
    db: args.db,
    duplicateCode: APP_ERROR_CODE.skills.create.duplicateSlug,
    duplicateMessage: args.formCopy.errors.createDuplicateSkill,
    mutate: () => createSkill(args.db, args.submission),
    values: args.submission,
  });

  await purgePublicHomeDataCache(args.context, args.request);
  await recordAuditLog({
    action: APP_ERROR_ACTION.create,
    context: args.context,
    details: {
      intent: args.intent,
      name: args.submission.name,
    },
    message: "Skill created",
    request: args.request,
    resource: APP_ERROR_RESOURCE.skills,
    result: "success",
    statusCode: 302,
    targetLabel: args.submission.name,
  });

  return redirect(
    buildLocalizedPath(args.locale, "/dashboard/skills", args.supportedLocaleCodes),
  );
}

import { redirect, type AppLoadContext } from "react-router";

import type { getDbFromContext } from "../../../../../db/context";
import { createProject } from "~/lib/projects/projects.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { buildLocalizedPath, type createTranslator } from "~/shared/i18n/i18n.shared";
import { recordAuditLog } from "~/shared/logging/audit.server";

import {
  ensureProjectSlugAvailableOrThrow,
  rethrowProjectMutationConflict,
  revalidateProjectCaches,
  type DashboardProjectSubmission,
} from "./_shared/support.server";

export async function handleCreateProjectMutation(args: {
  context: AppLoadContext;
  db: ReturnType<typeof getDbFromContext>;
  intent: string;
  locale: string;
  request: Request;
  submission: DashboardProjectSubmission;
  supportedLocaleCodes: string[];
  t: ReturnType<typeof createTranslator>;
}) {
  await ensureProjectSlugAvailableOrThrow({
    db: args.db,
    duplicateCode: APP_ERROR_CODE.projects.create.duplicateSlug,
    duplicateMessage: args.t("validation.slug.taken"),
    submission: args.submission,
  });

  try {
    await createProject(args.db, args.submission);
  } catch (error) {
    await rethrowProjectMutationConflict(error, {
      db: args.db,
      duplicateCode: APP_ERROR_CODE.projects.create.duplicateSlug,
      duplicateMessage: args.t("validation.slug.taken"),
      submission: args.submission,
    });
  }

  await revalidateProjectCaches(args.context, args.request);
  await recordAuditLog({
    action: APP_ERROR_ACTION.create,
    context: args.context,
    details: {
      intent: args.intent,
      slug: args.submission.slug,
    },
    message: "Project created",
    request: args.request,
    resource: APP_ERROR_RESOURCE.projects,
    result: "success",
    statusCode: 302,
    targetLabel: args.submission.title,
  });

  return redirect(
    buildLocalizedPath(args.locale, "/dashboard/projects", args.supportedLocaleCodes),
  );
}

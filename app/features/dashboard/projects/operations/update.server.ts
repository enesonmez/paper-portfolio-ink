import { redirect, type AppLoadContext } from "react-router";

import type { getDbFromContext } from "../../../../../db/context";
import { updateProject } from "~/lib/projects/projects.server";
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
  throwMissingProjectIdError,
  type DashboardProjectSubmission,
  type DashboardProjectsFormCopy,
} from "./_shared/support.server";

export async function handleUpdateProjectMutation(args: {
  context: AppLoadContext;
  db: ReturnType<typeof getDbFromContext>;
  formCopy: DashboardProjectsFormCopy;
  intent: string;
  locale: string;
  projectId: string;
  request: Request;
  submission: DashboardProjectSubmission;
  supportedLocaleCodes: string[];
  t: ReturnType<typeof createTranslator>;
}) {
  if (!args.projectId) {
    throwMissingProjectIdError({
      action: APP_ERROR_ACTION.update,
      code: APP_ERROR_CODE.projects.update.missingId,
      formMessage: args.formCopy.errors.updateMissingProject,
      values: args.submission,
    });
  }

  await ensureProjectSlugAvailableOrThrow({
    db: args.db,
    duplicateCode: APP_ERROR_CODE.projects.update.duplicateSlug,
    duplicateMessage: args.t("validation.slug.taken"),
    projectId: args.projectId,
    submission: args.submission,
  });

  try {
    await updateProject(args.db, args.projectId, args.submission);
  } catch (error) {
    await rethrowProjectMutationConflict(error, {
      db: args.db,
      duplicateCode: APP_ERROR_CODE.projects.update.duplicateSlug,
      duplicateMessage: args.t("validation.slug.taken"),
      projectId: args.projectId,
      submission: args.submission,
    });
  }

  await revalidateProjectCaches(args.context, args.request);
  await recordAuditLog({
    action: APP_ERROR_ACTION.update,
    context: args.context,
    details: {
      intent: args.intent,
      slug: args.submission.slug,
    },
    message: "Project updated",
    request: args.request,
    resource: APP_ERROR_RESOURCE.projects,
    result: "success",
    statusCode: 302,
    targetId: args.projectId,
    targetLabel: args.submission.title,
  });

  return redirect(
    buildLocalizedPath(args.locale, "/dashboard/projects", args.supportedLocaleCodes),
  );
}

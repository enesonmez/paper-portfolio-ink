import { redirect, type AppLoadContext } from "react-router";

import type { getDbFromContext } from "../../../../../db/context";
import { deleteProject } from "~/lib/projects/projects.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { buildLocalizedPath } from "~/shared/i18n/i18n.shared";
import { recordAuditLog } from "~/shared/logging/audit.server";

import {
  revalidateProjectCaches,
  throwMissingProjectIdError,
  type DashboardProjectsFormCopy,
} from "./_shared/support.server";

export async function handleDeleteProjectMutation(args: {
  context: AppLoadContext;
  db: ReturnType<typeof getDbFromContext>;
  formCopy: DashboardProjectsFormCopy;
  intent: string;
  locale: string;
  projectId: string;
  request: Request;
  supportedLocaleCodes: string[];
}) {
  if (!args.projectId) {
    throwMissingProjectIdError({
      action: APP_ERROR_ACTION.delete,
      code: APP_ERROR_CODE.projects.delete.missingId,
      formMessage: args.formCopy.errors.deleteMissingProject,
    });
  }

  await deleteProject(args.db, args.projectId);
  await revalidateProjectCaches(args.context, args.request);
  await recordAuditLog({
    action: APP_ERROR_ACTION.delete,
    context: args.context,
    details: {
      intent: args.intent,
    },
    message: "Project deleted",
    request: args.request,
    resource: APP_ERROR_RESOURCE.projects,
    result: "success",
    statusCode: 302,
    targetId: args.projectId,
  });

  return redirect(
    buildLocalizedPath(args.locale, "/dashboard/projects", args.supportedLocaleCodes),
  );
}

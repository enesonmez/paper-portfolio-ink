import { redirect, type AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { buildProjectFormValues, type ProjectFormState } from "~/domain/projects/form";
import type { parseProjectFormData } from "~/lib/projects/project-form.server";
import {
  createProject,
  deleteProject,
  findAvailableProjectSlug,
  isProjectSlugTaken,
  updateProject,
} from "~/lib/projects/projects.server";
import { isUniqueSlugConstraintError } from "~/lib/slug";
import { purgePublicHomeDataCache } from "~/features/public/home/server";
import { purgePublicProjectsDataCache } from "~/features/public/projects/server";
import {
  buildConflictError,
  buildValidationError,
} from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { buildLocalizedPath, type createTranslator } from "~/shared/i18n/i18n.shared";
import { recordAuditLog } from "~/shared/logging/audit.server";

import type { buildDashboardProjectsFormCopy } from "./copy";

type ProjectActionValues = Omit<ProjectFormState["values"], "sortOrder"> & {
  sortOrder?: number | string;
};

type DashboardProjectsFormCopy = ReturnType<typeof buildDashboardProjectsFormCopy>;
type DashboardProjectSubmission = ReturnType<typeof parseProjectFormData>;

function buildProjectActionValues(values: ProjectActionValues) {
  return buildProjectFormValues({
    ...values,
    sortOrder: values.sortOrder?.toString() ?? "0",
  });
}

async function buildDuplicateProjectSlugState(
  context: AppLoadContext,
  values: ProjectActionValues,
  duplicateMessage: string,
  projectId?: string,
) {
  const db = getDbFromContext(context);

  return {
    errors: {
      slug: duplicateMessage,
    },
    slugSuggestion: await findAvailableProjectSlug(db, values.title, projectId),
    values: buildProjectActionValues(values),
  } satisfies ProjectFormState;
}

function buildProjectsRedirect(locale: string, supportedLocaleCodes: string[]) {
  return redirect(
    buildLocalizedPath(locale, "/dashboard/projects", supportedLocaleCodes),
  );
}

async function revalidateProjectCaches(context: AppLoadContext, request: Request) {
  await Promise.all([
    purgePublicHomeDataCache(context, request),
    purgePublicProjectsDataCache(context, request),
  ]);
}

async function ensureUniqueProjectSlug(args: {
  context: AppLoadContext;
  duplicateMessage: string;
  mode: typeof APP_ERROR_ACTION.create | typeof APP_ERROR_ACTION.update;
  projectId?: string;
  submission: DashboardProjectSubmission;
}) {
  if (
    !(await isProjectSlugTaken(
      getDbFromContext(args.context),
      args.submission.slug,
      args.projectId,
    ))
  ) {
    return;
  }

  throw buildConflictError<ProjectFormState>({
    action: args.mode,
    code:
      args.mode === APP_ERROR_ACTION.update
        ? APP_ERROR_CODE.projects.update.duplicateSlug
        : APP_ERROR_CODE.projects.create.duplicateSlug,
    details: {
      projectId: args.projectId ?? null,
      slug: args.submission.slug,
    },
    message: `Project ${args.mode} rejected because slug is already taken`,
    resource: APP_ERROR_RESOURCE.projects,
    responseData: await buildDuplicateProjectSlugState(
      args.context,
      args.submission,
      args.duplicateMessage,
      args.projectId,
    ),
    status: 409,
    targetId: args.projectId ?? null,
    targetLabel: args.submission.title,
  });
}

async function throwProjectSlugConstraintError(args: {
  context: AppLoadContext;
  duplicateMessage: string;
  mode: typeof APP_ERROR_ACTION.create | typeof APP_ERROR_ACTION.update;
  projectId?: string;
  submission: DashboardProjectSubmission;
}) {
  throw buildConflictError<ProjectFormState>({
    action: args.mode,
    code:
      args.mode === APP_ERROR_ACTION.update
        ? APP_ERROR_CODE.projects.update.duplicateSlug
        : APP_ERROR_CODE.projects.create.duplicateSlug,
    details: {
      projectId: args.projectId ?? null,
      slug: args.submission.slug,
    },
    message: `Project ${args.mode} rejected because slug constraint failed`,
    resource: APP_ERROR_RESOURCE.projects,
    responseData: await buildDuplicateProjectSlugState(
      args.context,
      args.submission,
      args.duplicateMessage,
      args.projectId,
    ),
    status: 409,
    targetId: args.projectId ?? null,
    targetLabel: args.submission.title,
  });
}

export async function handleDeleteProjectMutation(args: {
  context: AppLoadContext;
  formCopy: DashboardProjectsFormCopy;
  intent: string;
  locale: string;
  projectId: string;
  request: Request;
  supportedLocaleCodes: string[];
}) {
  if (!args.projectId) {
    throw buildValidationError<ProjectFormState>({
      action: APP_ERROR_ACTION.delete,
      code: APP_ERROR_CODE.projects.delete.missingId,
      message: "Project delete action missing target identifier",
      resource: APP_ERROR_RESOURCE.projects,
      responseData: {
        errors: {
          form: args.formCopy.errors.deleteMissingProject,
        },
        values: buildProjectFormValues(),
      },
    });
  }

  await deleteProject(getDbFromContext(args.context), args.projectId);
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

  return buildProjectsRedirect(args.locale, args.supportedLocaleCodes);
}

export async function handleUpdateProjectMutation(args: {
  context: AppLoadContext;
  formCopy: DashboardProjectsFormCopy;
  intent: string;
  locale: string;
  projectId: string;
  request: Request;
  submission: DashboardProjectSubmission;
  supportedLocaleCodes: string[];
  t: ReturnType<typeof createTranslator>;
}) {
  const db = getDbFromContext(args.context);

  if (!args.projectId) {
    throw buildValidationError<ProjectFormState>({
      action: APP_ERROR_ACTION.update,
      code: APP_ERROR_CODE.projects.update.missingId,
      message: "Project update action missing target identifier",
      resource: APP_ERROR_RESOURCE.projects,
      responseData: {
        errors: {
          form: args.formCopy.errors.updateMissingProject,
        },
        values: buildProjectActionValues(args.submission),
      },
    });
  }

  await ensureUniqueProjectSlug({
    context: args.context,
    duplicateMessage: args.t("validation.slug.taken"),
    mode: APP_ERROR_ACTION.update,
    projectId: args.projectId,
    submission: args.submission,
  });

  try {
    await updateProject(db, args.projectId, args.submission);
  } catch (error) {
    if (isUniqueSlugConstraintError(error, "projects")) {
      await throwProjectSlugConstraintError({
        context: args.context,
        duplicateMessage: args.t("validation.slug.taken"),
        mode: APP_ERROR_ACTION.update,
        projectId: args.projectId,
        submission: args.submission,
      });
    }

    throw error;
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

  return buildProjectsRedirect(args.locale, args.supportedLocaleCodes);
}

export async function handleCreateProjectMutation(args: {
  context: AppLoadContext;
  intent: string;
  locale: string;
  request: Request;
  submission: DashboardProjectSubmission;
  supportedLocaleCodes: string[];
  t: ReturnType<typeof createTranslator>;
}) {
  const db = getDbFromContext(args.context);

  await ensureUniqueProjectSlug({
    context: args.context,
    duplicateMessage: args.t("validation.slug.taken"),
    mode: APP_ERROR_ACTION.create,
    submission: args.submission,
  });

  try {
    await createProject(db, args.submission);
  } catch (error) {
    if (isUniqueSlugConstraintError(error, "projects")) {
      await throwProjectSlugConstraintError({
        context: args.context,
        duplicateMessage: args.t("validation.slug.taken"),
        mode: APP_ERROR_ACTION.create,
        submission: args.submission,
      });
    }

    throw error;
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

  return buildProjectsRedirect(args.locale, args.supportedLocaleCodes);
}

import type { AppLoadContext } from "react-router";

import type { getDbFromContext } from "../../../../../../db/context";
import { buildProjectFormValues, type ProjectFormState } from "~/domain/projects/form";
import type { parseProjectFormData } from "~/lib/projects/project-form.server";
import {
  findAvailableProjectSlug,
  isProjectSlugTaken,
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
  APP_ERROR_RESOURCE,
  type AppErrorCode,
} from "~/shared/errors/contracts";

import type { buildDashboardProjectsFormCopy } from "../../copy";

export type ProjectActionValues = Omit<ProjectFormState["values"], "sortOrder"> & {
  sortOrder?: number | string;
};

export type DashboardProjectsFormCopy = ReturnType<
  typeof buildDashboardProjectsFormCopy
>;
export type DashboardProjectSubmission = ReturnType<typeof parseProjectFormData>;

function buildProjectActionValues(values: ProjectActionValues) {
  return buildProjectFormValues({
    ...values,
    sortOrder: values.sortOrder?.toString() ?? "0",
  });
}

export function buildProjectFormState(
  errors: ProjectFormState["errors"],
  values?: ProjectActionValues | ProjectFormState["values"],
  slugSuggestion?: string | null,
) {
  return {
    errors,
    slugSuggestion: slugSuggestion ?? null,
    values: values ? buildProjectActionValues(values) : buildProjectFormValues(),
  } satisfies ProjectFormState;
}

export function throwMissingProjectIdError(args: {
  action: typeof APP_ERROR_ACTION.delete | typeof APP_ERROR_ACTION.update;
  code: AppErrorCode;
  formMessage: string;
  values?: ProjectActionValues | ProjectFormState["values"];
}) {
  throw buildValidationError<ProjectFormState>({
    action: args.action,
    code: args.code,
    message: "Project mutation action missing target identifier",
    resource: APP_ERROR_RESOURCE.projects,
    responseData: buildProjectFormState(
      {
        form: args.formMessage,
      },
      args.values,
    ),
  });
}

async function buildDuplicateProjectSlugState(args: {
  db: ReturnType<typeof getDbFromContext>;
  duplicateMessage: string;
  projectId?: string;
  values: ProjectActionValues;
}) {
  return buildProjectFormState(
    {
      slug: args.duplicateMessage,
    },
    args.values,
    await findAvailableProjectSlug(args.db, args.values.title, args.projectId),
  );
}

export async function ensureProjectSlugAvailableOrThrow(args: {
  db: ReturnType<typeof getDbFromContext>;
  duplicateCode: AppErrorCode;
  duplicateMessage: string;
  projectId?: string;
  submission: DashboardProjectSubmission;
}) {
  if (!(await isProjectSlugTaken(args.db, args.submission.slug, args.projectId))) {
    return;
  }

  throw buildConflictError<ProjectFormState>({
    action: args.projectId ? APP_ERROR_ACTION.update : APP_ERROR_ACTION.create,
    code: args.duplicateCode,
    details: {
      projectId: args.projectId ?? null,
      slug: args.submission.slug,
    },
    message: "Project mutation rejected because slug is already taken",
    resource: APP_ERROR_RESOURCE.projects,
    responseData: await buildDuplicateProjectSlugState({
      db: args.db,
      duplicateMessage: args.duplicateMessage,
      projectId: args.projectId,
      values: args.submission,
    }),
    status: 409,
    targetId: args.projectId ?? null,
    targetLabel: args.submission.title,
  });
}

export async function rethrowProjectMutationConflict(
  error: unknown,
  args: {
    db: ReturnType<typeof getDbFromContext>;
    duplicateCode: AppErrorCode;
    duplicateMessage: string;
    projectId?: string;
    submission: DashboardProjectSubmission;
  },
) {
  if (isUniqueSlugConstraintError(error, "projects")) {
    throw buildConflictError<ProjectFormState>({
      action: args.projectId ? APP_ERROR_ACTION.update : APP_ERROR_ACTION.create,
      code: args.duplicateCode,
      details: {
        projectId: args.projectId ?? null,
        slug: args.submission.slug,
      },
      message: "Project mutation rejected because slug constraint failed",
      resource: APP_ERROR_RESOURCE.projects,
      responseData: await buildDuplicateProjectSlugState({
        db: args.db,
        duplicateMessage: args.duplicateMessage,
        projectId: args.projectId,
        values: args.submission,
      }),
      status: 409,
      targetId: args.projectId ?? null,
      targetLabel: args.submission.title,
    });
  }

  throw error;
}

export async function revalidateProjectCaches(
  context: AppLoadContext,
  request: Request,
) {
  await Promise.all([
    purgePublicHomeDataCache(context, request),
    purgePublicProjectsDataCache(context, request),
  ]);
}

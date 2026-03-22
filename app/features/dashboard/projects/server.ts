import { data, redirect, type AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { loadI18nPayload } from "~/shared/i18n/i18n.server";
import { buildLocalizedPath, createTranslator } from "~/shared/i18n/i18n.shared";
import { purgePublicHomeDataCache } from "~/features/public/home/server";
import { purgePublicProjectsDataCache } from "~/features/public/projects/server";
import {
  PROJECT_MUTATION_CLAIMS,
  resolveMutationClaim,
} from "~/shared/authz/action-claims";
import {
  actorHasClaim,
  buildForbiddenFormState,
  denyActionIfMissingClaim,
  denyLoaderIfMissingClaim,
  requireDashboardActor,
} from "~/shared/authz/authz.server";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";
import { readStringField } from "~/shared/forms/form-data.server";
import { buildProjectFormValues, type ProjectFormState } from "~/domain/projects/form";
import { PROJECT_FORM_FIELD, PROJECT_MUTATION_INTENT } from "~/domain/projects/model";
import {
  hasParsedProjectData,
  parseProjectFormData,
} from "~/lib/projects/project-form.server";
import {
  createProject,
  deleteProject,
  findAvailableProjectSlug,
  isProjectSlugTaken,
  listProjects,
  updateProject,
} from "~/lib/projects/projects.server";
import { isUniqueSlugConstraintError } from "~/lib/slug";

import { buildDashboardProjectsFormCopy } from "./copy";
import {
  DASHBOARD_PROJECTS_QUERY_PARAM,
  buildDashboardProjectsMetrics,
  resolveDashboardProjectsForm,
  type DashboardProjectsLoaderData,
} from "./state";

type ProjectActionValues = Omit<ProjectFormState["values"], "sortOrder"> & {
  sortOrder?: number | string;
};

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

  return data<ProjectFormState>(
    {
      errors: {
        slug: duplicateMessage,
      },
      slugSuggestion: await findAvailableProjectSlug(db, values.title, projectId),
      values: buildProjectActionValues(values),
    },
    { status: 409 },
  );
}

function buildDeniedProjectsLoaderData(): DashboardProjectsLoaderData {
  return {
    access: "denied",
    form: resolveDashboardProjectsForm({
      editId: null,
      modal: null,
      projects: [],
    }),
    metrics: buildDashboardProjectsMetrics([]),
    permissions: {
      canCreate: false,
      canDelete: false,
      canUpdate: false,
    },
    projects: [],
  };
}

export async function loadDashboardProjectsData(
  context: AppLoadContext,
  request: Request,
): Promise<DashboardProjectsLoaderData | Response> {
  const auth = await requireDashboardActor(context, request);

  if (auth instanceof Response) {
    return auth;
  }

  const denied = denyLoaderIfMissingClaim(
    auth.actor,
    AUTHORIZATION_CLAIM.projectsRead,
    buildDeniedProjectsLoaderData(),
  );

  if (denied) {
    return denied;
  }

  const db = getDbFromContext(context);
  const projects = await listProjects(db);
  const url = new URL(request.url);

  return {
    access: "granted",
    form: resolveDashboardProjectsForm({
      editId: url.searchParams.get(DASHBOARD_PROJECTS_QUERY_PARAM.edit),
      modal: url.searchParams.get(DASHBOARD_PROJECTS_QUERY_PARAM.modal),
      projects,
    }),
    metrics: buildDashboardProjectsMetrics(projects),
    permissions: {
      canCreate: actorHasClaim(auth.actor, AUTHORIZATION_CLAIM.projectsCreate),
      canDelete: actorHasClaim(auth.actor, AUTHORIZATION_CLAIM.projectsDelete),
      canUpdate: actorHasClaim(auth.actor, AUTHORIZATION_CLAIM.projectsUpdate),
    },
    projects,
  };
}

export async function handleDashboardProjectsAction(
  context: AppLoadContext,
  request: Request,
) {
  const db = getDbFromContext(context);
  const { locale, messages, supportedLocales } = await loadI18nPayload(
    context,
    request,
  );
  const t = createTranslator(messages);
  const formCopy = buildDashboardProjectsFormCopy(t);
  const auth = await requireDashboardActor(context, request);
  const supportedLocaleCodes = supportedLocales.map((item) => item.code);

  if (auth instanceof Response) {
    return auth;
  }

  const formData = await request.formData();
  const intent = readStringField(formData, PROJECT_FORM_FIELD.intent);
  const projectId = readStringField(formData, PROJECT_FORM_FIELD.projectId);
  const requiredClaim = resolveMutationClaim(
    intent,
    PROJECT_MUTATION_CLAIMS,
    AUTHORIZATION_CLAIM.projectsCreate,
  );

  const forbidden = denyActionIfMissingClaim(
    auth.actor,
    requiredClaim,
    buildForbiddenFormState(formCopy.errors.forbidden, buildProjectFormValues()),
  );

  if (forbidden) {
    return forbidden;
  }

  if (intent === PROJECT_MUTATION_INTENT.delete) {
    if (!projectId) {
      return data<ProjectFormState>(
        {
          errors: {
            form: formCopy.errors.deleteMissingProject,
          },
          values: buildProjectFormValues(),
        },
        { status: 400 },
      );
    }

    await deleteProject(db, projectId);
    await Promise.all([
      purgePublicHomeDataCache(context, request),
      purgePublicProjectsDataCache(context, request),
    ]);

    return redirect(
      buildLocalizedPath(locale, "/dashboard/projects", supportedLocaleCodes),
    );
  }

  const submission = parseProjectFormData(formData, t);

  if (!hasParsedProjectData(submission)) {
    return data<ProjectFormState>(submission, { status: 400 });
  }

  if (intent === PROJECT_MUTATION_INTENT.update) {
    if (!projectId) {
      return data<ProjectFormState>(
        {
          errors: {
            form: formCopy.errors.updateMissingProject,
          },
          values: buildProjectActionValues(submission.data),
        },
        { status: 400 },
      );
    }

    if (await isProjectSlugTaken(db, submission.data.slug, projectId)) {
      return buildDuplicateProjectSlugState(
        context,
        submission.data,
        t("validation.slug.taken"),
        projectId,
      );
    }

    try {
      await updateProject(db, projectId, submission.data);
    } catch (error) {
      if (isUniqueSlugConstraintError(error, "projects")) {
        return buildDuplicateProjectSlugState(
          context,
          submission.data,
          t("validation.slug.taken"),
          projectId,
        );
      }

      throw error;
    }

    await Promise.all([
      purgePublicHomeDataCache(context, request),
      purgePublicProjectsDataCache(context, request),
    ]);

    return redirect(
      buildLocalizedPath(locale, "/dashboard/projects", supportedLocaleCodes),
    );
  }

  if (await isProjectSlugTaken(db, submission.data.slug)) {
    return buildDuplicateProjectSlugState(
      context,
      submission.data,
      t("validation.slug.taken"),
    );
  }

  try {
    await createProject(db, submission.data);
  } catch (error) {
    if (isUniqueSlugConstraintError(error, "projects")) {
      return buildDuplicateProjectSlugState(
        context,
        submission.data,
        t("validation.slug.taken"),
      );
    }

    throw error;
  }

  await Promise.all([
    purgePublicHomeDataCache(context, request),
    purgePublicProjectsDataCache(context, request),
  ]);

  return redirect(
    buildLocalizedPath(locale, "/dashboard/projects", supportedLocaleCodes),
  );
}

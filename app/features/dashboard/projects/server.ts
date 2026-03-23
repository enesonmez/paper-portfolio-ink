import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { buildProjectFormValues, type ProjectFormState } from "~/domain/projects/form";
import { PROJECT_FORM_FIELD, PROJECT_MUTATION_INTENT } from "~/domain/projects/model";
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
import { buildAuthorizationError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { resolveParsedSubmission } from "~/shared/errors/submission.server";
import { readStringField } from "~/shared/forms/form-data.server";
import { loadI18nPayload } from "~/shared/i18n/i18n.server";
import { createTranslator } from "~/shared/i18n/i18n.shared";
import { parseProjectFormData } from "~/lib/projects/project-form.server";
import { listProjects } from "~/lib/projects/projects.server";

import { buildDashboardProjectsFormCopy } from "./copy";
import {
  handleCreateProjectMutation,
  handleDeleteProjectMutation,
  handleUpdateProjectMutation,
} from "./mutations.server";
import {
  DASHBOARD_PROJECTS_QUERY_PARAM,
  buildDashboardProjectsMetrics,
  resolveDashboardProjectsForm,
  type DashboardProjectsLoaderData,
} from "./state";

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
    {
      access: "denied",
    } satisfies DashboardProjectsLoaderData,
  );

  if (denied) {
    throw buildAuthorizationError<DashboardProjectsLoaderData>({
      action: APP_ERROR_ACTION.read,
      code: APP_ERROR_CODE.projects.read.forbidden,
      message: "Project dashboard access denied",
      resource: APP_ERROR_RESOURCE.projects,
      responseData: denied,
      status: 403,
    });
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
    throw buildAuthorizationError<ProjectFormState>({
      action: APP_ERROR_ACTION.mutate,
      code: APP_ERROR_CODE.projects.mutation.forbidden,
      details: {
        intent,
        requiredClaim,
      },
      message: "Project mutation denied by authorization policy",
      resource: APP_ERROR_RESOURCE.projects,
      responseData: forbidden,
      status: 403,
    });
  }

  if (intent === PROJECT_MUTATION_INTENT.delete) {
    return handleDeleteProjectMutation({
      context,
      formCopy,
      intent,
      locale,
      projectId,
      request,
      supportedLocaleCodes,
    });
  }

  const submission = resolveParsedSubmission({
    action:
      intent === PROJECT_MUTATION_INTENT.update
        ? APP_ERROR_ACTION.update
        : APP_ERROR_ACTION.create,
    code: APP_ERROR_CODE.projects.validation,
    message: "Project form validation failed",
    resource: APP_ERROR_RESOURCE.projects,
    submission: parseProjectFormData(formData, t),
  });

  if (intent === PROJECT_MUTATION_INTENT.update) {
    return handleUpdateProjectMutation({
      context,
      formCopy,
      intent,
      locale,
      projectId,
      request,
      submission,
      supportedLocaleCodes,
      t,
    });
  }

  return handleCreateProjectMutation({
    context,
    intent,
    locale,
    request,
    submission,
    supportedLocaleCodes,
    t,
  });
}

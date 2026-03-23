import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { buildSkillFormValues, type SkillFormState } from "~/domain/skills/form";
import { SKILL_FORM_FIELD, SKILL_MUTATION_INTENT } from "~/domain/skills/model";
import {
  SKILL_MUTATION_CLAIMS,
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
import { parseSkillFormData } from "~/lib/skills/skill-form.server";
import { listSkills } from "~/lib/skills/skills.server";

import { buildDashboardSkillsFormCopy } from "./copy";
import {
  handleCreateSkillMutation,
  handleDeleteSkillMutation,
  handleUpdateSkillMutation,
} from "./mutations.server";
import {
  buildDashboardSkillsMetrics,
  resolveDashboardSkillsForm,
  type DashboardSkillsLoaderData,
} from "./state";

export async function loadDashboardSkillsData(
  context: AppLoadContext,
  request: Request,
): Promise<DashboardSkillsLoaderData | Response> {
  const auth = await requireDashboardActor(context, request);

  if (auth instanceof Response) {
    return auth;
  }

  const denied = denyLoaderIfMissingClaim(auth.actor, AUTHORIZATION_CLAIM.skillsRead, {
    access: "denied",
  } satisfies DashboardSkillsLoaderData);

  if (denied) {
    throw buildAuthorizationError<DashboardSkillsLoaderData>({
      action: APP_ERROR_ACTION.read,
      code: APP_ERROR_CODE.skills.read.forbidden,
      message: "Skill dashboard access denied",
      resource: APP_ERROR_RESOURCE.skills,
      responseData: denied,
      status: 403,
    });
  }

  const db = getDbFromContext(context);
  const skillRows = await listSkills(db);
  const url = new URL(request.url);

  return {
    access: "granted",
    form: resolveDashboardSkillsForm({
      editId: url.searchParams.get("edit"),
      modal: url.searchParams.get("modal"),
      skills: skillRows,
    }),
    metrics: buildDashboardSkillsMetrics(skillRows),
    permissions: {
      canCreate: actorHasClaim(auth.actor, AUTHORIZATION_CLAIM.skillsCreate),
      canDelete: actorHasClaim(auth.actor, AUTHORIZATION_CLAIM.skillsDelete),
      canUpdate: actorHasClaim(auth.actor, AUTHORIZATION_CLAIM.skillsUpdate),
    },
    skills: skillRows,
  };
}

export async function handleDashboardSkillsAction(
  context: AppLoadContext,
  request: Request,
) {
  const { locale, messages, supportedLocales } = await loadI18nPayload(
    context,
    request,
  );
  const t = createTranslator(messages);
  const formCopy = buildDashboardSkillsFormCopy(t);
  const auth = await requireDashboardActor(context, request);
  const supportedLocaleCodes = supportedLocales.map((item) => item.code);

  if (auth instanceof Response) {
    return auth;
  }

  const db = getDbFromContext(context);
  const formData = await request.formData();
  const intent = readStringField(formData, SKILL_FORM_FIELD.intent);
  const skillId = readStringField(formData, SKILL_FORM_FIELD.skillId);
  const requiredClaim = resolveMutationClaim(
    intent,
    SKILL_MUTATION_CLAIMS,
    AUTHORIZATION_CLAIM.skillsCreate,
  );

  const forbidden = denyActionIfMissingClaim(
    auth.actor,
    requiredClaim,
    buildForbiddenFormState(formCopy.errors.forbidden, buildSkillFormValues()),
  );

  if (forbidden) {
    throw buildAuthorizationError<SkillFormState>({
      action: APP_ERROR_ACTION.mutate,
      code: APP_ERROR_CODE.skills.mutation.forbidden,
      details: {
        intent,
        requiredClaim,
      },
      message: "Skill mutation denied by authorization policy",
      resource: APP_ERROR_RESOURCE.skills,
      responseData: forbidden,
      status: 403,
    });
  }

  if (intent === SKILL_MUTATION_INTENT.delete) {
    return handleDeleteSkillMutation({
      context,
      db,
      formCopy,
      intent,
      locale,
      request,
      skillId,
      supportedLocaleCodes,
    });
  }

  const submission = resolveParsedSubmission({
    action:
      intent === SKILL_MUTATION_INTENT.update
        ? APP_ERROR_ACTION.update
        : APP_ERROR_ACTION.create,
    code: APP_ERROR_CODE.skills.validation,
    message: "Skill form validation failed",
    resource: APP_ERROR_RESOURCE.skills,
    submission: parseSkillFormData(formData, t),
  });

  if (intent === SKILL_MUTATION_INTENT.update) {
    return handleUpdateSkillMutation({
      context,
      db,
      formCopy,
      intent,
      locale,
      request,
      skillId,
      submission,
      supportedLocaleCodes,
    });
  }

  return handleCreateSkillMutation({
    context,
    db,
    formCopy,
    intent,
    locale,
    request,
    submission,
    supportedLocaleCodes,
  });
}

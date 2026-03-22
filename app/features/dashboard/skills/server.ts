import { data, redirect, type AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { loadI18nPayload } from "~/shared/i18n/i18n.server";
import { buildLocalizedPath, createTranslator } from "~/shared/i18n/i18n.shared";
import { purgePublicHomeDataCache } from "~/features/public/home/server";
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
import { readStringField } from "~/shared/forms/form-data.server";
import { buildSkillFormValues, type SkillFormState } from "~/domain/skills/form";
import { SKILL_FORM_FIELD, SKILL_MUTATION_INTENT } from "~/domain/skills/model";
import { hasParsedSkillData, parseSkillFormData } from "~/lib/skills/skill-form.server";
import {
  createSkill,
  deleteSkill,
  isSkillSlugTaken,
  listSkills,
  updateSkill,
} from "~/lib/skills/skills.server";
import { isUniqueSlugConstraintError, suggestSlugFromTitle } from "~/lib/slug";

import { buildDashboardSkillsFormCopy } from "./copy";
import {
  buildDashboardSkillsMetrics,
  resolveDashboardSkillsForm,
  type DashboardSkillsLoaderData,
} from "./state";

type SkillActionValues = Omit<SkillFormState["values"], "sortOrder"> & {
  sortOrder?: number | string;
};

interface BuildSkillFormStateResponseArgs {
  errors: SkillFormState["errors"];
  status: number;
  values?: SkillActionValues | SkillFormState["values"];
}

interface RunSkillMutationArgs {
  db: ReturnType<typeof getDbFromContext>;
  duplicateMessage: string;
  excludedSkillId?: string;
  mutate: () => Promise<void>;
  values: SkillActionValues;
}

function buildSkillFormStateResponse({
  errors,
  status,
  values,
}: BuildSkillFormStateResponseArgs) {
  return data<SkillFormState>(
    {
      errors,
      values: values ? buildSkillActionValues(values) : buildSkillFormValues(),
    },
    { status },
  );
}

function buildSkillActionValues(values: SkillActionValues) {
  return buildSkillFormValues({
    ...values,
    sortOrder: values.sortOrder?.toString() ?? "0",
  });
}

function buildDuplicateSkillState(message: string, values: SkillActionValues) {
  return buildSkillFormStateResponse({
    errors: {
      name: message,
    },
    status: 409,
    values,
  });
}

async function runSkillMutation({
  db,
  duplicateMessage,
  excludedSkillId,
  mutate,
  values,
}: RunSkillMutationArgs) {
  const slug = suggestSlugFromTitle(values.name);

  if (await isSkillSlugTaken(db, slug, excludedSkillId)) {
    return buildDuplicateSkillState(duplicateMessage, values);
  }

  try {
    await mutate();
  } catch (error) {
    if (isUniqueSlugConstraintError(error, "skills")) {
      return buildDuplicateSkillState(duplicateMessage, values);
    }

    throw error;
  }

  return null;
}

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
    return denied;
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
    return forbidden;
  }

  if (intent === SKILL_MUTATION_INTENT.delete) {
    if (!skillId) {
      return buildSkillFormStateResponse({
        errors: {
          form: formCopy.errors.deleteMissingSkill,
        },
        status: 400,
      });
    }

    await deleteSkill(db, skillId);
    await purgePublicHomeDataCache(context, request);

    return redirect(
      buildLocalizedPath(locale, "/dashboard/skills", supportedLocaleCodes),
    );
  }

  const submission = parseSkillFormData(formData, t);

  if (!hasParsedSkillData(submission)) {
    return data<SkillFormState>(submission, { status: 400 });
  }

  if (intent === SKILL_MUTATION_INTENT.update) {
    if (!skillId) {
      return buildSkillFormStateResponse({
        errors: {
          form: formCopy.errors.updateMissingSkill,
        },
        status: 400,
        values: submission.data,
      });
    }

    const mutationError = await runSkillMutation({
      db,
      duplicateMessage: formCopy.errors.updateDuplicateSkill,
      excludedSkillId: skillId,
      mutate: () => updateSkill(db, skillId, submission.data),
      values: submission.data,
    });

    if (mutationError) {
      return mutationError;
    }

    await purgePublicHomeDataCache(context, request);

    return redirect(
      buildLocalizedPath(locale, "/dashboard/skills", supportedLocaleCodes),
    );
  }

  const mutationError = await runSkillMutation({
    db,
    duplicateMessage: formCopy.errors.createDuplicateSkill,
    mutate: () => createSkill(db, submission.data),
    values: submission.data,
  });

  if (mutationError) {
    return mutationError;
  }

  await purgePublicHomeDataCache(context, request);

  return redirect(
    buildLocalizedPath(locale, "/dashboard/skills", supportedLocaleCodes),
  );
}

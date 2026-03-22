import { data, redirect, type AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { loadI18nPayload } from "~/shared/i18n/i18n.server";
import { buildLocalizedPath, createTranslator } from "~/shared/i18n/i18n.shared";
import { purgePublicHomeDataCache } from "~/features/public/home/public-home.server";
import { buildLoginRedirect } from "~/shared/auth/login.server";
import { requireSession } from "~/shared/auth/session.server";
import { isSessionUserAdmin } from "~/shared/auth/session-user";
import {
  buildSkillFormValues,
  type SkillFormState,
} from "~/features/skills/skill-form.shared";
import {
  SKILL_FORM_FIELD,
  SKILL_MUTATION_INTENT,
} from "~/features/skills/skill.shared";
import { hasParsedSkillData, parseSkillFormData } from "~/lib/skills/skill-form.server";
import {
  createSkill,
  deleteSkill,
  isSkillSlugTaken,
  listSkills,
  updateSkill,
} from "~/lib/skills/skills.server";
import { isUniqueSlugConstraintError, suggestSlugFromTitle } from "~/lib/slug";

import { buildDashboardSkillsFormCopy } from "./dashboard-skills.constants";
import {
  buildDashboardSkillsMetrics,
  resolveDashboardSkillsForm,
  type DashboardSkillsLoaderData,
} from "./dashboard-skills.shared";

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

function readStringField(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value : "";
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

function buildForbiddenState(message: string) {
  return buildSkillFormStateResponse({
    errors: {
      form: message,
    },
    status: 403,
  });
}

export async function loadDashboardSkillsData(
  context: AppLoadContext,
  request: Request,
): Promise<DashboardSkillsLoaderData | Response> {
  const session = await requireSession(request, context, {
    redirectTo: await buildLoginRedirect(context, request),
  });

  if (session instanceof Response) {
    return session;
  }

  if (!isSessionUserAdmin(session)) {
    return {
      access: "denied",
    };
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
  const session = await requireSession(request, context, {
    redirectTo: await buildLoginRedirect(context, request),
  });
  const supportedLocaleCodes = supportedLocales.map((item) => item.code);

  if (session instanceof Response) {
    return session;
  }

  if (!isSessionUserAdmin(session)) {
    return buildForbiddenState(formCopy.errors.forbidden);
  }

  const db = getDbFromContext(context);
  const formData = await request.formData();
  const intent = readStringField(formData, SKILL_FORM_FIELD.intent);
  const skillId = readStringField(formData, SKILL_FORM_FIELD.skillId);

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

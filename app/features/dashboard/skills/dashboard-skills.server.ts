import { data, redirect, type AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { purgePublicHomeDataCache } from "~/features/public/home/public-home.server";
import { buildLoginRedirect } from "~/lib/auth/login.server";
import { requireSession } from "~/lib/auth/session.server";
import { isSessionUserAdmin } from "~/lib/auth/session-user";
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

import { DASHBOARD_SKILLS_FORM_COPY } from "./dashboard-skills.constants";
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

function buildForbiddenState() {
  return buildSkillFormStateResponse({
    errors: {
      form: DASHBOARD_SKILLS_FORM_COPY.errors.forbidden,
    },
    status: 403,
  });
}

export async function loadDashboardSkillsData(
  context: AppLoadContext,
  request: Request,
): Promise<DashboardSkillsLoaderData | Response> {
  const session = await requireSession(request, context, {
    redirectTo: buildLoginRedirect(request),
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
  const session = await requireSession(request, context, {
    redirectTo: buildLoginRedirect(request),
  });

  if (session instanceof Response) {
    return session;
  }

  if (!isSessionUserAdmin(session)) {
    return buildForbiddenState();
  }

  const db = getDbFromContext(context);
  const formData = await request.formData();
  const intent = readStringField(formData, SKILL_FORM_FIELD.intent);
  const skillId = readStringField(formData, SKILL_FORM_FIELD.skillId);

  if (intent === SKILL_MUTATION_INTENT.delete) {
    if (!skillId) {
      return buildSkillFormStateResponse({
        errors: {
          form: DASHBOARD_SKILLS_FORM_COPY.errors.deleteMissingSkill,
        },
        status: 400,
      });
    }

    await deleteSkill(db, skillId);
    await purgePublicHomeDataCache(context, request);

    return redirect("/dashboard/skills");
  }

  const submission = parseSkillFormData(formData);

  if (!hasParsedSkillData(submission)) {
    return data<SkillFormState>(submission, { status: 400 });
  }

  if (intent === SKILL_MUTATION_INTENT.update) {
    if (!skillId) {
      return buildSkillFormStateResponse({
        errors: {
          form: DASHBOARD_SKILLS_FORM_COPY.errors.updateMissingSkill,
        },
        status: 400,
        values: submission.data,
      });
    }

    const mutationError = await runSkillMutation({
      db,
      duplicateMessage: DASHBOARD_SKILLS_FORM_COPY.errors.updateDuplicateSkill,
      excludedSkillId: skillId,
      mutate: () => updateSkill(db, skillId, submission.data),
      values: submission.data,
    });

    if (mutationError) {
      return mutationError;
    }

    await purgePublicHomeDataCache(context, request);

    return redirect("/dashboard/skills");
  }

  const mutationError = await runSkillMutation({
    db,
    duplicateMessage: DASHBOARD_SKILLS_FORM_COPY.errors.createDuplicateSkill,
    mutate: () => createSkill(db, submission.data),
    values: submission.data,
  });

  if (mutationError) {
    return mutationError;
  }

  await purgePublicHomeDataCache(context, request);

  return redirect("/dashboard/skills");
}

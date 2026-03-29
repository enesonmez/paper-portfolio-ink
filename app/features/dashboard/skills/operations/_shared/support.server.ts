import type { getDbFromContext } from "../../../../../../db/context";
import { buildSkillFormValues, type SkillFormState } from "~/domain/skills/form";
import type { parseSkillFormData } from "~/lib/skills/skill-form.server";
import { isSkillSlugTaken } from "~/lib/skills/skills.server";
import { isUniqueSlugConstraintError, suggestSlugFromTitle } from "~/lib/slug";
import { buildConflictError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_RESOURCE,
  type AppErrorCode,
} from "~/shared/errors/contracts";

import type { buildDashboardSkillsFormCopy } from "../../copy";

export type SkillActionValues = Omit<SkillFormState["values"], "sortOrder"> & {
  sortOrder?: number | string;
};

export type DashboardSkillsFormCopy = ReturnType<typeof buildDashboardSkillsFormCopy>;
export type DashboardSkillSubmission = ReturnType<typeof parseSkillFormData>;

interface RunSkillMutationArgs {
  db: ReturnType<typeof getDbFromContext>;
  duplicateCode: AppErrorCode;
  duplicateMessage: string;
  excludedSkillId?: string;
  mutate: () => Promise<void>;
  values: SkillActionValues;
}

function buildSkillActionValues(values: SkillActionValues) {
  return buildSkillFormValues({
    ...values,
    sortOrder: values.sortOrder?.toString() ?? "0",
  });
}

export function buildSkillFormState(
  errors: SkillFormState["errors"],
  values?: SkillActionValues | SkillFormState["values"],
) {
  return {
    errors,
    values: values ? buildSkillActionValues(values) : buildSkillFormValues(),
  } satisfies SkillFormState;
}

function buildDuplicateSkillState(message: string, values: SkillActionValues) {
  return buildSkillFormState(
    {
      name: message,
    },
    values,
  );
}

export async function runSkillMutation({
  db,
  duplicateCode,
  duplicateMessage,
  excludedSkillId,
  mutate,
  values,
}: RunSkillMutationArgs) {
  const action = excludedSkillId ? APP_ERROR_ACTION.update : APP_ERROR_ACTION.create;
  const slug = suggestSlugFromTitle(values.name);

  if (await isSkillSlugTaken(db, slug, excludedSkillId)) {
    throw buildConflictError<SkillFormState>({
      action,
      code: duplicateCode,
      details: {
        excludedSkillId: excludedSkillId ?? null,
        slug,
      },
      message: "Skill mutation rejected because slug is already taken",
      resource: APP_ERROR_RESOURCE.skills,
      responseData: buildDuplicateSkillState(duplicateMessage, values),
      status: 409,
      targetId: excludedSkillId ?? null,
      targetLabel: values.name,
    });
  }

  try {
    await mutate();
  } catch (error) {
    if (isUniqueSlugConstraintError(error, "skills")) {
      throw buildConflictError<SkillFormState>({
        action,
        code: duplicateCode,
        details: {
          excludedSkillId: excludedSkillId ?? null,
          slug,
        },
        message: "Skill mutation rejected because slug constraint failed",
        resource: APP_ERROR_RESOURCE.skills,
        responseData: buildDuplicateSkillState(duplicateMessage, values),
        status: 409,
        targetId: excludedSkillId ?? null,
        targetLabel: values.name,
      });
    }

    throw error;
  }
}

import { redirect, type AppLoadContext } from "react-router";

import type { getDbFromContext } from "../../../../db/context";
import { buildSkillFormValues, type SkillFormState } from "~/domain/skills/form";
import type { parseSkillFormData } from "~/lib/skills/skill-form.server";
import {
  createSkill,
  deleteSkill,
  isSkillSlugTaken,
  updateSkill,
} from "~/lib/skills/skills.server";
import { isUniqueSlugConstraintError, suggestSlugFromTitle } from "~/lib/slug";
import { purgePublicHomeDataCache } from "~/features/public/home/server";
import {
  buildConflictError,
  buildValidationError,
} from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
  type AppErrorCode,
} from "~/shared/errors/contracts";
import { buildLocalizedPath } from "~/shared/i18n/i18n.shared";
import { recordAuditLog } from "~/shared/logging/audit.server";

import type { buildDashboardSkillsFormCopy } from "./copy";

type SkillActionValues = Omit<SkillFormState["values"], "sortOrder"> & {
  sortOrder?: number | string;
};

type DashboardSkillsFormCopy = ReturnType<typeof buildDashboardSkillsFormCopy>;
type DashboardSkillSubmission = ReturnType<typeof parseSkillFormData>;

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

function buildSkillFormState(
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

async function runSkillMutation({
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

export async function handleDeleteSkillMutation(args: {
  context: AppLoadContext;
  db: ReturnType<typeof getDbFromContext>;
  formCopy: DashboardSkillsFormCopy;
  intent: string;
  locale: string;
  request: Request;
  skillId: string;
  supportedLocaleCodes: string[];
}) {
  if (!args.skillId) {
    throw buildValidationError<SkillFormState>({
      action: APP_ERROR_ACTION.delete,
      code: APP_ERROR_CODE.skills.delete.missingId,
      message: "Skill delete action missing target identifier",
      resource: APP_ERROR_RESOURCE.skills,
      responseData: buildSkillFormState({
        form: args.formCopy.errors.deleteMissingSkill,
      }),
    });
  }

  await deleteSkill(args.db, args.skillId);
  await purgePublicHomeDataCache(args.context, args.request);
  await recordAuditLog({
    action: APP_ERROR_ACTION.delete,
    context: args.context,
    details: {
      intent: args.intent,
    },
    message: "Skill deleted",
    request: args.request,
    resource: APP_ERROR_RESOURCE.skills,
    result: "success",
    statusCode: 302,
    targetId: args.skillId,
  });

  return redirect(
    buildLocalizedPath(args.locale, "/dashboard/skills", args.supportedLocaleCodes),
  );
}

export async function handleUpdateSkillMutation(args: {
  context: AppLoadContext;
  db: ReturnType<typeof getDbFromContext>;
  formCopy: DashboardSkillsFormCopy;
  intent: string;
  locale: string;
  request: Request;
  skillId: string;
  submission: DashboardSkillSubmission;
  supportedLocaleCodes: string[];
}) {
  if (!args.skillId) {
    throw buildValidationError<SkillFormState>({
      action: APP_ERROR_ACTION.update,
      code: APP_ERROR_CODE.skills.update.missingId,
      message: "Skill update action missing target identifier",
      resource: APP_ERROR_RESOURCE.skills,
      responseData: buildSkillFormState(
        {
          form: args.formCopy.errors.updateMissingSkill,
        },
        args.submission,
      ),
    });
  }

  await runSkillMutation({
    db: args.db,
    duplicateCode: APP_ERROR_CODE.skills.update.duplicateSlug,
    duplicateMessage: args.formCopy.errors.updateDuplicateSkill,
    excludedSkillId: args.skillId,
    mutate: () => updateSkill(args.db, args.skillId, args.submission),
    values: args.submission,
  });

  await purgePublicHomeDataCache(args.context, args.request);
  await recordAuditLog({
    action: APP_ERROR_ACTION.update,
    context: args.context,
    details: {
      intent: args.intent,
      name: args.submission.name,
    },
    message: "Skill updated",
    request: args.request,
    resource: APP_ERROR_RESOURCE.skills,
    result: "success",
    statusCode: 302,
    targetId: args.skillId,
    targetLabel: args.submission.name,
  });

  return redirect(
    buildLocalizedPath(args.locale, "/dashboard/skills", args.supportedLocaleCodes),
  );
}

export async function handleCreateSkillMutation(args: {
  context: AppLoadContext;
  db: ReturnType<typeof getDbFromContext>;
  formCopy: DashboardSkillsFormCopy;
  intent: string;
  locale: string;
  request: Request;
  submission: DashboardSkillSubmission;
  supportedLocaleCodes: string[];
}) {
  await runSkillMutation({
    db: args.db,
    duplicateCode: APP_ERROR_CODE.skills.create.duplicateSlug,
    duplicateMessage: args.formCopy.errors.createDuplicateSkill,
    mutate: () => createSkill(args.db, args.submission),
    values: args.submission,
  });

  await purgePublicHomeDataCache(args.context, args.request);
  await recordAuditLog({
    action: APP_ERROR_ACTION.create,
    context: args.context,
    details: {
      intent: args.intent,
      name: args.submission.name,
    },
    message: "Skill created",
    request: args.request,
    resource: APP_ERROR_RESOURCE.skills,
    result: "success",
    statusCode: 302,
    targetLabel: args.submission.name,
  });

  return redirect(
    buildLocalizedPath(args.locale, "/dashboard/skills", args.supportedLocaleCodes),
  );
}

import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { buildSkillFormValues } from "~/domain/skills/form";
import {
  SKILL_FORM_FIELD,
  SKILL_MUTATION_INTENT,
  isSkillMutationIntent,
} from "~/domain/skills/model";
import { withDashboardAccess } from "~/shared/authz/authz.server";
import { buildValidationError } from "~/shared/errors/builders.server";
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

import { buildDashboardSkillsFormCopy } from "./copy";
import { authorizeSkillMutationOrThrow } from "./operations/_shared/authorization.server";
import { handleCreateSkillMutation } from "./operations/create.server";
import { handleDeleteSkillMutation } from "./operations/delete.server";
import { handleUpdateSkillMutation } from "./operations/update.server";

function buildInvalidIntentFormState(message: string) {
  return {
    errors: {
      form: message,
    },
    values: buildSkillFormValues(),
  };
}

function parseSkillSubmission(args: {
  formData: FormData;
  intent: typeof SKILL_MUTATION_INTENT.create | typeof SKILL_MUTATION_INTENT.update;
  t: ReturnType<typeof createTranslator>;
}) {
  return resolveParsedSubmission({
    action:
      args.intent === SKILL_MUTATION_INTENT.update
        ? APP_ERROR_ACTION.update
        : APP_ERROR_ACTION.create,
    code: APP_ERROR_CODE.skills.validation,
    message: "Skill form validation failed",
    resource: APP_ERROR_RESOURCE.skills,
    submission: parseSkillFormData(args.formData, args.t),
  });
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
  const supportedLocaleCodes = supportedLocales.map((item) => item.code);
  const formData = await request.formData();
  const intent = readStringField(formData, SKILL_FORM_FIELD.intent);
  const skillId = readStringField(formData, SKILL_FORM_FIELD.skillId);

  if (!isSkillMutationIntent(intent)) {
    throw buildValidationError({
      action: APP_ERROR_ACTION.mutate,
      code: APP_ERROR_CODE.skills.mutation.invalidIntent,
      details: {
        intent,
      },
      message: "Skill mutation received an unsupported intent",
      resource: APP_ERROR_RESOURCE.skills,
      responseData: buildInvalidIntentFormState(formCopy.errors.forbidden),
      status: 400,
    });
  }

  const resolveCreateSubmission = () =>
    parseSkillSubmission({
      formData,
      intent: SKILL_MUTATION_INTENT.create,
      t,
    });
  const resolveUpdateSubmission = () =>
    parseSkillSubmission({
      formData,
      intent: SKILL_MUTATION_INTENT.update,
      t,
    });

  return withDashboardAccess({
    request,
    context,
    authorize: ({ actor }) =>
      authorizeSkillMutationOrThrow({
        actor,
        formCopy,
        intent,
      }),
    handle: async () => {
      const db = getDbFromContext(context);
      const mutationHandlers = {
        [SKILL_MUTATION_INTENT.create]: () =>
          handleCreateSkillMutation({
            context,
            db,
            formCopy,
            intent,
            locale,
            request,
            submission: resolveCreateSubmission(),
            supportedLocaleCodes,
          }),
        [SKILL_MUTATION_INTENT.delete]: () =>
          handleDeleteSkillMutation({
            context,
            db,
            formCopy,
            intent,
            locale,
            request,
            skillId,
            supportedLocaleCodes,
          }),
        [SKILL_MUTATION_INTENT.update]: () =>
          handleUpdateSkillMutation({
            context,
            db,
            formCopy,
            intent,
            locale,
            request,
            skillId,
            submission: resolveUpdateSubmission(),
            supportedLocaleCodes,
          }),
      } as const;

      return mutationHandlers[intent]();
    },
  });
}

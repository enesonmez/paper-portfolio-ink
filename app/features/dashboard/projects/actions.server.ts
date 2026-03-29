import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { buildProjectFormValues } from "~/domain/projects/form";
import {
  PROJECT_FORM_FIELD,
  PROJECT_MUTATION_INTENT,
  isProjectMutationIntent,
} from "~/domain/projects/model";
import { parseProjectFormData } from "~/lib/projects/project-form.server";
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

import { buildDashboardProjectsFormCopy } from "./copy";
import { authorizeProjectMutationOrThrow } from "./operations/_shared/authorization.server";
import { handleCreateProjectMutation } from "./operations/create.server";
import { handleDeleteProjectMutation } from "./operations/delete.server";
import { handleUpdateProjectMutation } from "./operations/update.server";

function buildInvalidIntentFormState(message: string) {
  return {
    errors: {
      form: message,
    },
    values: buildProjectFormValues(),
  };
}

function parseProjectSubmission(args: {
  formData: FormData;
  intent: typeof PROJECT_MUTATION_INTENT.create | typeof PROJECT_MUTATION_INTENT.update;
  t: ReturnType<typeof createTranslator>;
}) {
  return resolveParsedSubmission({
    action:
      args.intent === PROJECT_MUTATION_INTENT.update
        ? APP_ERROR_ACTION.update
        : APP_ERROR_ACTION.create,
    code: APP_ERROR_CODE.projects.validation,
    message: "Project form validation failed",
    resource: APP_ERROR_RESOURCE.projects,
    submission: parseProjectFormData(args.formData, args.t),
  });
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
  const supportedLocaleCodes = supportedLocales.map((item) => item.code);
  const formData = await request.formData();
  const intent = readStringField(formData, PROJECT_FORM_FIELD.intent);
  const projectId = readStringField(formData, PROJECT_FORM_FIELD.projectId);

  if (!isProjectMutationIntent(intent)) {
    throw buildValidationError({
      action: APP_ERROR_ACTION.mutate,
      code: APP_ERROR_CODE.projects.mutation.invalidIntent,
      details: {
        intent,
      },
      message: "Project mutation received an unsupported intent",
      resource: APP_ERROR_RESOURCE.projects,
      responseData: buildInvalidIntentFormState(formCopy.errors.forbidden),
      status: 400,
    });
  }

  const resolveCreateSubmission = () =>
    parseProjectSubmission({
      formData,
      intent: PROJECT_MUTATION_INTENT.create,
      t,
    });
  const resolveUpdateSubmission = () =>
    parseProjectSubmission({
      formData,
      intent: PROJECT_MUTATION_INTENT.update,
      t,
    });

  return withDashboardAccess({
    request,
    context,
    authorize: ({ actor }) =>
      authorizeProjectMutationOrThrow({
        actor,
        formCopy,
        intent,
      }),
    handle: async () => {
      const db = getDbFromContext(context);
      const mutationHandlers = {
        [PROJECT_MUTATION_INTENT.create]: () =>
          handleCreateProjectMutation({
            context,
            db,
            intent,
            locale,
            request,
            submission: resolveCreateSubmission(),
            supportedLocaleCodes,
            t,
          }),
        [PROJECT_MUTATION_INTENT.delete]: () =>
          handleDeleteProjectMutation({
            context,
            db,
            formCopy,
            intent,
            locale,
            projectId,
            request,
            supportedLocaleCodes,
          }),
        [PROJECT_MUTATION_INTENT.update]: () =>
          handleUpdateProjectMutation({
            context,
            db,
            formCopy,
            intent,
            locale,
            projectId,
            request,
            submission: resolveUpdateSubmission(),
            supportedLocaleCodes,
            t,
          }),
      } as const;

      return mutationHandlers[intent]();
    },
  });
}

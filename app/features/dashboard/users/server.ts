import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { buildUserFormValues, type UserFormState } from "~/domain/users/form";
import { USER_FORM_FIELD, USER_MUTATION_INTENT } from "~/domain/users/model";
import {
  USER_MUTATION_CLAIMS,
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
import { listUsers } from "~/lib/users/users.server";
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
import { parseUserFormData } from "~/lib/users/user-form.server";

import { buildDashboardUsersFormCopy } from "./copy";
import {
  handleCreateUserMutation,
  handleDeleteUserMutation,
  handleUpdateUserMutation,
} from "./mutations.server";
import {
  buildDashboardUsersMetrics,
  resolveDashboardUsersForm,
  type DashboardUsersLoaderData,
} from "./state";

export async function loadDashboardUsersData(
  context: AppLoadContext,
  request: Request,
): Promise<DashboardUsersLoaderData | Response> {
  const auth = await requireDashboardActor(context, request);

  if (auth instanceof Response) {
    return auth;
  }

  const denied = denyLoaderIfMissingClaim(auth.actor, AUTHORIZATION_CLAIM.usersRead, {
    access: "denied",
  } satisfies DashboardUsersLoaderData);

  if (denied) {
    throw buildAuthorizationError<DashboardUsersLoaderData>({
      action: APP_ERROR_ACTION.read,
      code: APP_ERROR_CODE.users.read.forbidden,
      message: "User dashboard access denied",
      resource: APP_ERROR_RESOURCE.users,
      responseData: denied,
      status: 403,
    });
  }

  const db = getDbFromContext(context);
  const users = await listUsers(db);
  const url = new URL(request.url);

  return {
    access: "granted",
    form: resolveDashboardUsersForm({
      editId: url.searchParams.get("edit"),
      modal: url.searchParams.get("modal"),
      users,
    }),
    metrics: buildDashboardUsersMetrics(users),
    permissions: {
      canCreate: actorHasClaim(auth.actor, AUTHORIZATION_CLAIM.usersCreate),
      canDelete: actorHasClaim(auth.actor, AUTHORIZATION_CLAIM.usersDelete),
      canUpdate: actorHasClaim(auth.actor, AUTHORIZATION_CLAIM.usersUpdate),
    },
    users,
  };
}

export async function handleDashboardUsersAction(
  context: AppLoadContext,
  request: Request,
) {
  const { locale, messages, supportedLocales } = await loadI18nPayload(
    context,
    request,
  );
  const t = createTranslator(messages);
  const formCopy = buildDashboardUsersFormCopy(t);
  const auth = await requireDashboardActor(context, request);
  const supportedLocaleCodes = supportedLocales.map((item) => item.code);

  if (auth instanceof Response) {
    return auth;
  }

  const formData = await request.formData();
  const intent = readStringField(formData, USER_FORM_FIELD.intent);
  const userId = readStringField(formData, USER_FORM_FIELD.userId);
  const requiredClaim = resolveMutationClaim(
    intent,
    USER_MUTATION_CLAIMS,
    AUTHORIZATION_CLAIM.usersCreate,
  );

  const forbidden = denyActionIfMissingClaim(
    auth.actor,
    requiredClaim,
    buildForbiddenFormState(formCopy.errors.forbidden, buildUserFormValues()),
  );

  if (forbidden) {
    throw buildAuthorizationError<UserFormState>({
      action: APP_ERROR_ACTION.mutate,
      code: APP_ERROR_CODE.users.mutation.forbidden,
      details: {
        intent,
        requiredClaim,
      },
      message: "User mutation denied by authorization policy",
      resource: APP_ERROR_RESOURCE.users,
      responseData: forbidden,
      status: 403,
    });
  }

  if (intent === USER_MUTATION_INTENT.delete) {
    return handleDeleteUserMutation({
      context,
      formCopy,
      intent,
      locale,
      request,
      supportedLocaleCodes,
      userId,
    });
  }

  const submission = resolveParsedSubmission({
    action:
      intent === USER_MUTATION_INTENT.update
        ? APP_ERROR_ACTION.update
        : APP_ERROR_ACTION.create,
    code: APP_ERROR_CODE.users.validation,
    message: "User form validation failed",
    resource: APP_ERROR_RESOURCE.users,
    submission: parseUserFormData(
      formData,
      intent === USER_MUTATION_INTENT.update
        ? USER_MUTATION_INTENT.update
        : USER_MUTATION_INTENT.create,
      t,
    ),
  });

  if (intent === USER_MUTATION_INTENT.update) {
    return handleUpdateUserMutation({
      context,
      formCopy,
      intent,
      locale,
      request,
      submission,
      supportedLocaleCodes,
      userId,
    });
  }

  return handleCreateUserMutation({
    context,
    intent,
    locale,
    request,
    submission,
    supportedLocaleCodes,
    formCopy,
  });
}

import { redirect, type AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { buildUserFormValues, type UserFormState } from "~/domain/users/form";
import type { parseUserFormData } from "~/lib/users/user-form.server";
import {
  countActiveAdmins,
  createUser,
  deactivateUser,
  getUserById,
  isLastActiveAdminConstraintError,
  isUniqueUserEmailConstraintError,
  isUserEmailTaken,
  updateUser,
} from "~/lib/users/users.server";
import { purgePublicBlogDataCache } from "~/features/public/blog/server";
import {
  buildBusinessError,
  buildConflictError,
  buildValidationError,
} from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { buildLocalizedPath } from "~/shared/i18n/i18n.shared";
import { recordAuditLog } from "~/shared/logging/audit.server";

import type { buildDashboardUsersFormCopy } from "./copy";

type DashboardUsersFormCopy = ReturnType<typeof buildDashboardUsersFormCopy>;
type DashboardUserSubmission = ReturnType<typeof parseUserFormData>;

function buildDuplicateEmailState(values: UserFormState["values"], message: string) {
  return {
    errors: {
      email: message,
    },
    values,
  } satisfies UserFormState;
}

function buildAdminProtectionState(message: string) {
  return {
    errors: {
      form: message,
    },
    values: buildUserFormValues(),
  } satisfies UserFormState;
}

async function ensureAdminInvariant(
  context: AppLoadContext,
  userId: string,
  formCopy: DashboardUsersFormCopy,
  nextState: {
    isActive: boolean;
    role: string;
  },
) {
  const db = getDbFromContext(context);
  const currentUser = await getUserById(db, userId);

  if (!currentUser || !currentUser.isActive || currentUser.role !== "admin") {
    return null;
  }

  if (nextState.isActive && nextState.role === "admin") {
    return null;
  }

  const activeAdminCount = await countActiveAdmins(db);

  if (activeAdminCount > 1) {
    return null;
  }

  if (!nextState.isActive) {
    return buildAdminProtectionState(formCopy.errors.lastActiveAdminDeactivate);
  }

  return buildAdminProtectionState(formCopy.errors.lastActiveAdminDemotion);
}

function buildUsersRedirect(locale: string, supportedLocaleCodes: string[]) {
  return redirect(buildLocalizedPath(locale, "/dashboard/users", supportedLocaleCodes));
}

export async function handleDeleteUserMutation(args: {
  context: AppLoadContext;
  formCopy: DashboardUsersFormCopy;
  intent: string;
  locale: string;
  request: Request;
  supportedLocaleCodes: string[];
  userId: string;
}) {
  if (!args.userId) {
    throw buildValidationError<UserFormState>({
      action: APP_ERROR_ACTION.delete,
      code: APP_ERROR_CODE.users.delete.missingId,
      message: "User deactivate action missing target identifier",
      resource: APP_ERROR_RESOURCE.users,
      responseData: {
        errors: {
          form: args.formCopy.errors.deactivateMissingUser,
        },
        values: buildUserFormValues(),
      },
    });
  }

  const adminInvariantState = await ensureAdminInvariant(
    args.context,
    args.userId,
    args.formCopy,
    {
      isActive: false,
      role: "admin",
    },
  );

  if (adminInvariantState) {
    throw buildBusinessError<UserFormState>({
      action: APP_ERROR_ACTION.delete,
      code: APP_ERROR_CODE.users.delete.lastAdminGuard,
      message: "User deactivate rejected by last-admin protection",
      resource: APP_ERROR_RESOURCE.users,
      responseData: adminInvariantState,
      status: 409,
      targetId: args.userId,
    });
  }

  try {
    await deactivateUser(getDbFromContext(args.context), args.userId);
  } catch (error) {
    if (isLastActiveAdminConstraintError(error)) {
      throw buildBusinessError<UserFormState>({
        action: APP_ERROR_ACTION.delete,
        code: APP_ERROR_CODE.users.delete.lastAdminGuard,
        message: "User deactivate rejected by last-admin constraint",
        resource: APP_ERROR_RESOURCE.users,
        responseData: buildAdminProtectionState(
          args.formCopy.errors.lastActiveAdminDelete,
        ),
        status: 409,
        targetId: args.userId,
      });
    }

    throw error;
  }

  await purgePublicBlogDataCache(args.context, args.request);
  await recordAuditLog({
    action: APP_ERROR_ACTION.delete,
    context: args.context,
    details: {
      intent: args.intent,
    },
    message: "User deactivated",
    request: args.request,
    resource: APP_ERROR_RESOURCE.users,
    result: "success",
    statusCode: 302,
    targetId: args.userId,
  });

  return buildUsersRedirect(args.locale, args.supportedLocaleCodes);
}

export async function handleUpdateUserMutation(args: {
  context: AppLoadContext;
  formCopy: DashboardUsersFormCopy;
  intent: string;
  locale: string;
  request: Request;
  submission: DashboardUserSubmission;
  supportedLocaleCodes: string[];
  userId: string;
}) {
  const db = getDbFromContext(args.context);

  if (!args.userId) {
    throw buildValidationError<UserFormState>({
      action: APP_ERROR_ACTION.update,
      code: APP_ERROR_CODE.users.update.missingId,
      message: "User update action missing target identifier",
      resource: APP_ERROR_RESOURCE.users,
      responseData: {
        errors: {
          form: args.formCopy.errors.updateMissingUser,
        },
        values: buildUserFormValues(args.submission),
      },
    });
  }

  const adminInvariantState = await ensureAdminInvariant(
    args.context,
    args.userId,
    args.formCopy,
    {
      isActive: args.submission.isActive,
      role: args.submission.role,
    },
  );

  if (adminInvariantState) {
    throw buildBusinessError<UserFormState>({
      action: APP_ERROR_ACTION.update,
      code: APP_ERROR_CODE.users.update.lastAdminGuard,
      message: "User update rejected by last-admin protection",
      resource: APP_ERROR_RESOURCE.users,
      responseData: adminInvariantState,
      status: 409,
      targetId: args.userId,
      targetLabel: args.submission.email,
    });
  }

  if (await isUserEmailTaken(db, args.submission.email, args.userId)) {
    throw buildConflictError<UserFormState>({
      action: APP_ERROR_ACTION.update,
      code: APP_ERROR_CODE.users.update.duplicateEmail,
      details: {
        email: args.submission.email,
        userId: args.userId,
      },
      message: "User update rejected because email is already taken",
      resource: APP_ERROR_RESOURCE.users,
      responseData: buildDuplicateEmailState(
        args.submission,
        args.formCopy.errors.updateDuplicateEmail,
      ),
      status: 409,
      targetId: args.userId,
      targetLabel: args.submission.email,
    });
  }

  try {
    await updateUser(db, args.userId, args.submission);
  } catch (error) {
    if (isLastActiveAdminConstraintError(error)) {
      throw buildBusinessError<UserFormState>({
        action: APP_ERROR_ACTION.update,
        code: APP_ERROR_CODE.users.update.lastAdminGuard,
        message: "User update rejected by last-admin constraint",
        resource: APP_ERROR_RESOURCE.users,
        responseData: buildAdminProtectionState(
          args.submission.isActive
            ? args.formCopy.errors.lastActiveAdminDemotion
            : args.formCopy.errors.lastActiveAdminDeactivate,
        ),
        status: 409,
        targetId: args.userId,
        targetLabel: args.submission.email,
      });
    }

    if (isUniqueUserEmailConstraintError(error)) {
      throw buildConflictError<UserFormState>({
        action: APP_ERROR_ACTION.update,
        code: APP_ERROR_CODE.users.update.duplicateEmail,
        details: {
          email: args.submission.email,
          userId: args.userId,
        },
        message: "User update rejected because email constraint failed",
        resource: APP_ERROR_RESOURCE.users,
        responseData: buildDuplicateEmailState(
          args.submission,
          args.formCopy.errors.updateDuplicateEmail,
        ),
        status: 409,
        targetId: args.userId,
        targetLabel: args.submission.email,
      });
    }

    throw error;
  }

  await purgePublicBlogDataCache(args.context, args.request);
  await recordAuditLog({
    action: APP_ERROR_ACTION.update,
    context: args.context,
    details: {
      intent: args.intent,
      email: args.submission.email,
    },
    message: "User updated",
    request: args.request,
    resource: APP_ERROR_RESOURCE.users,
    result: "success",
    statusCode: 302,
    targetId: args.userId,
    targetLabel: args.submission.email,
  });

  return buildUsersRedirect(args.locale, args.supportedLocaleCodes);
}

export async function handleCreateUserMutation(args: {
  context: AppLoadContext;
  intent: string;
  locale: string;
  request: Request;
  submission: DashboardUserSubmission;
  supportedLocaleCodes: string[];
  formCopy: DashboardUsersFormCopy;
}) {
  const db = getDbFromContext(args.context);

  if (await isUserEmailTaken(db, args.submission.email)) {
    throw buildConflictError<UserFormState>({
      action: APP_ERROR_ACTION.create,
      code: APP_ERROR_CODE.users.create.duplicateEmail,
      details: {
        email: args.submission.email,
      },
      message: "User creation rejected because email is already taken",
      resource: APP_ERROR_RESOURCE.users,
      responseData: buildDuplicateEmailState(
        args.submission,
        args.formCopy.errors.createDuplicateEmail,
      ),
      status: 409,
      targetLabel: args.submission.email,
    });
  }

  try {
    await createUser(db, args.submission);
  } catch (error) {
    if (isUniqueUserEmailConstraintError(error)) {
      throw buildConflictError<UserFormState>({
        action: APP_ERROR_ACTION.create,
        code: APP_ERROR_CODE.users.create.duplicateEmail,
        details: {
          email: args.submission.email,
        },
        message: "User creation rejected because email constraint failed",
        resource: APP_ERROR_RESOURCE.users,
        responseData: buildDuplicateEmailState(
          args.submission,
          args.formCopy.errors.createDuplicateEmail,
        ),
        status: 409,
        targetLabel: args.submission.email,
      });
    }

    throw error;
  }

  await recordAuditLog({
    action: APP_ERROR_ACTION.create,
    context: args.context,
    details: {
      intent: args.intent,
      email: args.submission.email,
    },
    message: "User created",
    request: args.request,
    resource: APP_ERROR_RESOURCE.users,
    result: "success",
    statusCode: 302,
    targetLabel: args.submission.email,
  });

  return buildUsersRedirect(args.locale, args.supportedLocaleCodes);
}

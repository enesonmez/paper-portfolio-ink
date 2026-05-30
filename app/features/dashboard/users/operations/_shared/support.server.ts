import type { getDbFromContext } from "../../../../../../db/context";
import { buildUserFormValues, type UserFormState } from "~/domain/users/form";
import { USER_ROLE } from "~/domain/users/model";
import type { parseUserFormData } from "~/lib/users/user-form.server";
import {
  countActiveAdmins,
  getUserById,
  isLastActiveAdminConstraintError,
  isUniqueUserEmailConstraintError,
  isUserEmailTaken,
} from "~/lib/users/users.server";
import {
  buildBusinessError,
  buildConflictError,
  buildValidationError,
} from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_RESOURCE,
  type AppErrorCode,
} from "~/shared/errors/contracts";

import type { buildDashboardUsersFormCopy } from "../../copy";

export type DashboardUsersFormCopy = ReturnType<typeof buildDashboardUsersFormCopy>;
export type DashboardUserSubmission = ReturnType<typeof parseUserFormData>;

function buildDuplicateEmailState(values: UserFormState["values"], message: string) {
  return {
    errors: {
      email: message,
    },
    values,
  } satisfies UserFormState;
}

export function buildAdminProtectionState(message: string) {
  return {
    errors: {
      form: message,
    },
    values: buildUserFormValues(),
  } satisfies UserFormState;
}

export async function ensureAdminInvariant(
  db: ReturnType<typeof getDbFromContext>,
  formCopy: DashboardUsersFormCopy,
  nextState: {
    isActive: boolean;
    role: string;
  },
  userId: string,
) {
  const currentUser = await getUserById(db, userId);

  if (!currentUser || !currentUser.isActive || currentUser.role !== USER_ROLE.admin) {
    return null;
  }

  if (nextState.isActive && nextState.role === USER_ROLE.admin) {
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

export function throwMissingUserIdError(args: {
  action: typeof APP_ERROR_ACTION.delete | typeof APP_ERROR_ACTION.update;
  code: AppErrorCode;
  formMessage: string;
  values?: UserFormState["values"];
}) {
  throw buildValidationError<UserFormState>({
    action: args.action,
    code: args.code,
    message: "User mutation action missing target identifier",
    resource: APP_ERROR_RESOURCE.users,
    responseData: {
      errors: {
        form: args.formMessage,
      },
      values: args.values ?? buildUserFormValues(),
    },
  });
}

export async function ensureUserEmailAvailableOrThrow(args: {
  db: ReturnType<typeof getDbFromContext>;
  duplicateCode: AppErrorCode;
  duplicateMessage: string;
  submission: DashboardUserSubmission;
  userId?: string;
}) {
  if (await isUserEmailTaken(args.db, args.submission.email, args.userId)) {
    throw buildConflictError<UserFormState>({
      action: args.userId ? APP_ERROR_ACTION.update : APP_ERROR_ACTION.create,
      code: args.duplicateCode,
      details: {
        email: args.submission.email,
        userId: args.userId ?? null,
      },
      message: "User mutation rejected because email is already taken",
      resource: APP_ERROR_RESOURCE.users,
      responseData: buildDuplicateEmailState(args.submission, args.duplicateMessage),
      status: 409,
      targetId: args.userId ?? null,
      targetLabel: args.submission.email,
    });
  }
}

export function rethrowUserMutationConflict(
  error: unknown,
  args: {
    duplicateCode: AppErrorCode;
    duplicateMessage: string;
    submission: DashboardUserSubmission;
    userId?: string;
  },
) {
  if (isUniqueUserEmailConstraintError(error)) {
    throw buildConflictError<UserFormState>({
      action: args.userId ? APP_ERROR_ACTION.update : APP_ERROR_ACTION.create,
      code: args.duplicateCode,
      details: {
        email: args.submission.email,
        userId: args.userId ?? null,
      },
      message: "User mutation rejected because email constraint failed",
      resource: APP_ERROR_RESOURCE.users,
      responseData: buildDuplicateEmailState(args.submission, args.duplicateMessage),
      status: 409,
      targetId: args.userId ?? null,
      targetLabel: args.submission.email,
    });
  }

  throw error;
}

export function rethrowLastActiveAdminGuard(
  error: unknown,
  args: {
    action: typeof APP_ERROR_ACTION.delete | typeof APP_ERROR_ACTION.update;
    code: AppErrorCode;
    formMessage: string;
    targetId: string;
    targetLabel?: string;
  },
) {
  if (isLastActiveAdminConstraintError(error)) {
    throw buildBusinessError<UserFormState>({
      action: args.action,
      code: args.code,
      message: "User mutation rejected by last-admin constraint",
      resource: APP_ERROR_RESOURCE.users,
      responseData: buildAdminProtectionState(args.formMessage),
      status: 409,
      targetId: args.targetId,
      targetLabel: args.targetLabel,
    });
  }

  throw error;
}

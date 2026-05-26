import { redirect, type AppLoadContext } from "react-router";

import type { getDbFromContext } from "../../../../../db/context";
import {
  buildUserAuthorizationFormValues,
  type UserAuthorizationFormValues,
} from "~/domain/users/form";
import { USER_MUTATION_INTENT, USER_ROLE } from "~/domain/users/model";
import {
  getUserAuthorizationById,
  upsertUserClaimOverrideWithVersionGuard,
  updateUserRoleWithVersionGuard,
} from "~/lib/users/users.server";
import type {
  UserClaimOverrideSubmission,
  UserAuthorizationRoleSubmission,
} from "~/lib/users/user-authorization-form.server";
import {
  buildBusinessError,
  buildConflictError,
  buildValidationError,
} from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
  type AppErrorCode,
} from "~/shared/errors/contracts";
import type { AuthorizationEffect } from "~/shared/authz/model";
import { recordAuditLog } from "~/shared/logging/audit.server";

import type { DashboardUsersActionState } from "../state";
import {
  ensureAdminInvariant,
  type DashboardUsersFormCopy,
} from "./_shared/support.server";

function buildAuthorizationFormState(args: {
  editingUserId?: string | null;
  formMessage?: string;
  role: UserAuthorizationFormValues["role"];
  authzVersion: string;
  claimKey?: string;
}) {
  return {
    authorizationForm: {
      editingUserId: args.editingUserId ?? null,
      errors: args.formMessage
        ? {
            form: args.formMessage,
          }
        : undefined,
      isOpen: true,
      mode: "access",
      values: buildUserAuthorizationFormValues({
        authzVersion: args.authzVersion,
        claimKey: args.claimKey ?? "",
        role: args.role,
      }),
    },
  } satisfies DashboardUsersActionState;
}

function throwMissingAuthorizationUser(args: {
  code: AppErrorCode;
  formCopy: DashboardUsersFormCopy;
  role: UserAuthorizationFormValues["role"];
  authzVersion: string;
  claimKey?: string;
}): never {
  throw buildValidationError<DashboardUsersActionState>({
    action: APP_ERROR_ACTION.update,
    code: args.code,
    message: "User authorization mutation missing target user",
    resource: APP_ERROR_RESOURCE.users,
    responseData: buildAuthorizationFormState({
      authzVersion: args.authzVersion,
      claimKey: args.claimKey,
      formMessage: args.formCopy.errors.updateMissingUser,
      role: args.role,
    }),
  });
}

function throwStaleAuthorizationVersion(args: {
  authzVersion: string;
  claimKey?: string;
  formCopy: DashboardUsersFormCopy;
  role: UserAuthorizationFormValues["role"];
  targetId: string;
  targetLabel: string;
}): never {
  throw buildConflictError<DashboardUsersActionState>({
    action: APP_ERROR_ACTION.update,
    code: APP_ERROR_CODE.users.update.staleAuthzVersion,
    message: "User authorization mutation rejected because authz version is stale",
    resource: APP_ERROR_RESOURCE.users,
    responseData: buildAuthorizationFormState({
      authzVersion: args.authzVersion,
      claimKey: args.claimKey,
      editingUserId: args.targetId,
      formMessage: args.formCopy.errors.authzVersionMismatch,
      role: args.role,
    }),
    status: 409,
    targetId: args.targetId,
    targetLabel: args.targetLabel,
  });
}

export async function handleUpdateUserAuthorizationMutation(args: {
  context: AppLoadContext;
  db: ReturnType<typeof getDbFromContext>;
  formCopy: DashboardUsersFormCopy;
  intent:
    | typeof USER_MUTATION_INTENT.grantClaim
    | typeof USER_MUTATION_INTENT.revokeClaim
    | typeof USER_MUTATION_INTENT.updateAccessRole;
  request: Request;
  roleSubmission?: UserAuthorizationRoleSubmission;
  claimSubmission?: UserClaimOverrideSubmission;
  userId: string;
}) {
  if (!args.userId) {
    throwMissingAuthorizationUser({
      authzVersion:
        args.roleSubmission?.authzVersion?.toString() ??
        args.claimSubmission?.authzVersion?.toString() ??
        "1",
      claimKey: args.claimSubmission?.claimKey,
      code: APP_ERROR_CODE.users.update.missingId,
      formCopy: args.formCopy,
      role: args.roleSubmission?.role ?? USER_ROLE.author,
    });
  }

  const currentUser = await getUserAuthorizationById(args.db, args.userId);

  if (!currentUser) {
    throwMissingAuthorizationUser({
      authzVersion:
        args.roleSubmission?.authzVersion?.toString() ??
        args.claimSubmission?.authzVersion?.toString() ??
        "1",
      claimKey: args.claimSubmission?.claimKey,
      code: APP_ERROR_CODE.users.update.missingId,
      formCopy: args.formCopy,
      role: args.roleSubmission?.role ?? USER_ROLE.author,
    });
  }
  const targetUser = currentUser;

  if (args.intent === USER_MUTATION_INTENT.updateAccessRole && args.roleSubmission) {
    if (targetUser.authzVersion !== args.roleSubmission.authzVersion) {
      throwStaleAuthorizationVersion({
        authzVersion: args.roleSubmission.authzVersion.toString(),
        formCopy: args.formCopy,
        role: args.roleSubmission.role,
        targetId: targetUser.id,
        targetLabel: targetUser.email,
      });
    }

    const adminInvariantState = await ensureAdminInvariant(
      args.db,
      args.formCopy,
      {
        isActive: targetUser.isActive,
        role: args.roleSubmission.role,
      },
      args.userId,
    );

    if (adminInvariantState) {
      throw buildBusinessError<DashboardUsersActionState>({
        action: APP_ERROR_ACTION.update,
        code: APP_ERROR_CODE.users.update.lastAdminGuard,
        message: "User role update rejected by last-admin protection",
        resource: APP_ERROR_RESOURCE.users,
        responseData: buildAuthorizationFormState({
          authzVersion: args.roleSubmission.authzVersion.toString(),
          editingUserId: targetUser.id,
          formMessage: adminInvariantState.errors?.form,
          role: args.roleSubmission.role,
        }),
        status: 409,
        targetId: targetUser.id,
        targetLabel: targetUser.email,
      });
    }

    if (targetUser.role !== args.roleSubmission.role) {
      const updated = await updateUserRoleWithVersionGuard({
        db: args.db,
        expectedAuthzVersion: args.roleSubmission.authzVersion,
        role: args.roleSubmission.role,
        userId: targetUser.id,
      });

      if (!updated) {
        throwStaleAuthorizationVersion({
          authzVersion: args.roleSubmission.authzVersion.toString(),
          formCopy: args.formCopy,
          role: args.roleSubmission.role,
          targetId: targetUser.id,
          targetLabel: targetUser.email,
        });
      }

      await recordAuditLog({
        action: APP_ERROR_ACTION.update,
        context: args.context,
        details: {
          intent: args.intent,
          nextRole: args.roleSubmission.role,
          previousRole: targetUser.role,
        },
        message: "User authorization role updated",
        request: args.request,
        resource: APP_ERROR_RESOURCE.users,
        result: "success",
        statusCode: 302,
        targetId: targetUser.id,
        targetLabel: targetUser.email,
      });
    }

    return redirect(args.request.url);
  }

  if (args.intent === USER_MUTATION_INTENT.updateAccessRole) {
    throw buildValidationError<DashboardUsersActionState>({
      action: APP_ERROR_ACTION.update,
      code: APP_ERROR_CODE.users.validation,
      message: "User role mutation missing role submission",
      resource: APP_ERROR_RESOURCE.users,
      responseData: buildAuthorizationFormState({
        authzVersion: targetUser.authzVersion.toString(),
        editingUserId: targetUser.id,
        formMessage: args.formCopy.errors.forbidden,
        role: targetUser.role,
      }),
    });
  }

  if (!args.claimSubmission) {
    throw buildValidationError<DashboardUsersActionState>({
      action: APP_ERROR_ACTION.update,
      code: APP_ERROR_CODE.users.validation,
      message: "User claim mutation missing claim submission",
      resource: APP_ERROR_RESOURCE.users,
      responseData: buildAuthorizationFormState({
        authzVersion: targetUser.authzVersion.toString(),
        editingUserId: targetUser.id,
        formMessage: args.formCopy.errors.forbidden,
        role: targetUser.role,
      }),
    });
  }

  if (targetUser.authzVersion !== args.claimSubmission.authzVersion) {
    throwStaleAuthorizationVersion({
      authzVersion: args.claimSubmission.authzVersion.toString(),
      claimKey: args.claimSubmission.claimKey,
      formCopy: args.formCopy,
      role: targetUser.role,
      targetId: targetUser.id,
      targetLabel: targetUser.email,
    });
  }

  const nextEffect: AuthorizationEffect =
    args.intent === USER_MUTATION_INTENT.grantClaim ? "grant" : "revoke";
  const currentEffect =
    targetUser.overrides.find(
      (override) => override.claimKey === args.claimSubmission?.claimKey,
    )?.effect ?? null;

  if (currentEffect !== nextEffect) {
    const updated = await upsertUserClaimOverrideWithVersionGuard({
      claimKey: args.claimSubmission.claimKey,
      db: args.db,
      effect: nextEffect,
      expectedAuthzVersion: args.claimSubmission.authzVersion,
      userId: targetUser.id,
    });

    if (!updated) {
      throwStaleAuthorizationVersion({
        authzVersion: args.claimSubmission.authzVersion.toString(),
        claimKey: args.claimSubmission.claimKey,
        formCopy: args.formCopy,
        role: targetUser.role,
        targetId: targetUser.id,
        targetLabel: targetUser.email,
      });
    }

    await recordAuditLog({
      action: APP_ERROR_ACTION.update,
      context: args.context,
      details: {
        claimKey: args.claimSubmission.claimKey,
        effect: nextEffect,
        intent: args.intent,
      },
      message: "User claim override updated",
      request: args.request,
      resource: APP_ERROR_RESOURCE.users,
      result: "success",
      statusCode: 302,
      targetId: targetUser.id,
      targetLabel: targetUser.email,
    });
  }

  return redirect(args.request.url);
}

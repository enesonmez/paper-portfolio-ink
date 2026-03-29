import { redirect, type AppLoadContext } from "react-router";

import type { getDbFromContext } from "../../../../../db/context";
import { buildUserFormValues } from "~/domain/users/form";
import { updateUser } from "~/lib/users/users.server";
import { purgePublicBlogDataCache } from "~/features/public/blog/server";
import { buildBusinessError } from "~/shared/errors/builders.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { buildLocalizedPath } from "~/shared/i18n/i18n.shared";
import { recordAuditLog } from "~/shared/logging/audit.server";

import {
  ensureAdminInvariant,
  ensureUserEmailAvailableOrThrow,
  rethrowLastActiveAdminGuard,
  rethrowUserMutationConflict,
  throwMissingUserIdError,
  type DashboardUserSubmission,
  type DashboardUsersFormCopy,
} from "./_shared/support.server";

export async function handleUpdateUserMutation(args: {
  context: AppLoadContext;
  db: ReturnType<typeof getDbFromContext>;
  formCopy: DashboardUsersFormCopy;
  intent: string;
  locale: string;
  request: Request;
  submission: DashboardUserSubmission;
  supportedLocaleCodes: string[];
  userId: string;
}) {
  if (!args.userId) {
    throwMissingUserIdError({
      action: APP_ERROR_ACTION.update,
      code: APP_ERROR_CODE.users.update.missingId,
      formMessage: args.formCopy.errors.updateMissingUser,
      values: buildUserFormValues(args.submission),
    });
  }

  const adminInvariantState = await ensureAdminInvariant(
    args.db,
    args.formCopy,
    {
      isActive: args.submission.isActive,
      role: args.submission.role,
    },
    args.userId,
  );

  if (adminInvariantState) {
    throw buildBusinessError({
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

  await ensureUserEmailAvailableOrThrow({
    db: args.db,
    duplicateCode: APP_ERROR_CODE.users.update.duplicateEmail,
    duplicateMessage: args.formCopy.errors.updateDuplicateEmail,
    submission: args.submission,
    userId: args.userId,
  });

  try {
    await updateUser(args.db, args.userId, args.submission);
  } catch (error) {
    rethrowLastActiveAdminGuard(error, {
      action: APP_ERROR_ACTION.update,
      code: APP_ERROR_CODE.users.update.lastAdminGuard,
      formMessage: args.submission.isActive
        ? args.formCopy.errors.lastActiveAdminDemotion
        : args.formCopy.errors.lastActiveAdminDeactivate,
      targetId: args.userId,
      targetLabel: args.submission.email,
    });

    rethrowUserMutationConflict(error, {
      duplicateCode: APP_ERROR_CODE.users.update.duplicateEmail,
      duplicateMessage: args.formCopy.errors.updateDuplicateEmail,
      submission: args.submission,
      userId: args.userId,
    });
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

  return redirect(
    buildLocalizedPath(args.locale, "/dashboard/users", args.supportedLocaleCodes),
  );
}

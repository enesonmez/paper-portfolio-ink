import { redirect, type AppLoadContext } from "react-router";

import type { getDbFromContext } from "../../../../../db/context";
import { deactivateUser } from "~/lib/users/users.server";
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
  rethrowLastActiveAdminGuard,
  throwMissingUserIdError,
  type DashboardUsersFormCopy,
} from "./_shared/support.server";

export async function handleDeleteUserMutation(args: {
  context: AppLoadContext;
  db: ReturnType<typeof getDbFromContext>;
  formCopy: DashboardUsersFormCopy;
  intent: string;
  locale: string;
  request: Request;
  supportedLocaleCodes: string[];
  userId: string;
}) {
  if (!args.userId) {
    throwMissingUserIdError({
      action: APP_ERROR_ACTION.delete,
      code: APP_ERROR_CODE.users.delete.missingId,
      formMessage: args.formCopy.errors.deactivateMissingUser,
    });
  }

  const adminInvariantState = await ensureAdminInvariant(
    args.db,
    args.formCopy,
    {
      isActive: false,
      role: "admin",
    },
    args.userId,
  );

  if (adminInvariantState) {
    throw buildBusinessError({
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
    await deactivateUser(args.db, args.userId);
  } catch (error) {
    rethrowLastActiveAdminGuard(error, {
      action: APP_ERROR_ACTION.delete,
      code: APP_ERROR_CODE.users.delete.lastAdminGuard,
      formMessage: args.formCopy.errors.lastActiveAdminDelete,
      targetId: args.userId,
    });
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

  return redirect(
    buildLocalizedPath(args.locale, "/dashboard/users", args.supportedLocaleCodes),
  );
}

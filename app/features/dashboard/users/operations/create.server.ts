import { redirect, type AppLoadContext } from "react-router";

import type { getDbFromContext } from "../../../../../db/context";
import { createUser } from "~/lib/users/users.server";
import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { buildLocalizedPath } from "~/shared/i18n/i18n.shared";
import { recordAuditLog } from "~/shared/logging/audit.server";

import {
  ensureUserEmailAvailableOrThrow,
  rethrowUserMutationConflict,
  type DashboardUserSubmission,
  type DashboardUsersFormCopy,
} from "./_shared/support.server";

export async function handleCreateUserMutation(args: {
  context: AppLoadContext;
  db: ReturnType<typeof getDbFromContext>;
  formCopy: DashboardUsersFormCopy;
  intent: string;
  locale: string;
  request: Request;
  submission: DashboardUserSubmission;
  supportedLocaleCodes: string[];
}) {
  await ensureUserEmailAvailableOrThrow({
    db: args.db,
    duplicateCode: APP_ERROR_CODE.users.create.duplicateEmail,
    duplicateMessage: args.formCopy.errors.createDuplicateEmail,
    submission: args.submission,
  });

  try {
    await createUser(args.db, args.submission);
  } catch (error) {
    rethrowUserMutationConflict(error, {
      duplicateCode: APP_ERROR_CODE.users.create.duplicateEmail,
      duplicateMessage: args.formCopy.errors.createDuplicateEmail,
      submission: args.submission,
    });
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

  return redirect(
    buildLocalizedPath(args.locale, "/dashboard/users", args.supportedLocaleCodes),
  );
}

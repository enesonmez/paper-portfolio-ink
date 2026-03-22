import { data, redirect, type AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { loadI18nPayload } from "~/shared/i18n/i18n.server";
import { buildLocalizedPath, createTranslator } from "~/shared/i18n/i18n.shared";
import { purgePublicBlogDataCache } from "~/features/public/blog/public-blog.server";
import { buildLoginRedirect } from "~/shared/auth/login.server";
import { requireSession } from "~/shared/auth/session.server";
import { isSessionUserAdmin } from "~/shared/auth/session-user";
import {
  buildUserFormValues,
  type UserFormState,
} from "~/features/users/user-form.shared";
import { USER_FORM_FIELD, USER_MUTATION_INTENT } from "~/features/users/user.shared";
import { hasParsedUserData, parseUserFormData } from "~/lib/users/user-form.server";
import {
  countActiveAdmins,
  createUser,
  deactivateUser,
  getUserById,
  isLastActiveAdminConstraintError,
  isUniqueUserEmailConstraintError,
  isUserEmailTaken,
  listUsers,
  updateUser,
} from "~/lib/users/users.server";

import { buildDashboardUsersFormCopy } from "./dashboard-users.constants";
import {
  buildDashboardUsersMetrics,
  resolveDashboardUsersForm,
  type DashboardUsersLoaderData,
} from "./dashboard-users.shared";

function readStringField(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value : "";
}

function buildDuplicateEmailState(values: UserFormState["values"], message: string) {
  return data<UserFormState>(
    {
      errors: {
        email: message,
      },
      values,
    },
    { status: 409 },
  );
}

function buildForbiddenState(forbiddenMessage: string) {
  return data<UserFormState>(
    {
      errors: {
        form: forbiddenMessage,
      },
      values: buildUserFormValues(),
    },
    { status: 403 },
  );
}

function buildAdminProtectionState(message: string) {
  return data<UserFormState>(
    {
      errors: {
        form: message,
      },
      values: buildUserFormValues(),
    },
    { status: 409 },
  );
}

async function ensureAdminInvariant(
  context: AppLoadContext,
  userId: string,
  formCopy: ReturnType<typeof buildDashboardUsersFormCopy>,
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

export async function loadDashboardUsersData(
  context: AppLoadContext,
  request: Request,
): Promise<DashboardUsersLoaderData | Response> {
  const session = await requireSession(request, context, {
    redirectTo: await buildLoginRedirect(context, request),
  });

  if (session instanceof Response) {
    return session;
  }

  if (!isSessionUserAdmin(session)) {
    return {
      access: "denied",
    };
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
  const session = await requireSession(request, context, {
    redirectTo: await buildLoginRedirect(context, request),
  });
  const supportedLocaleCodes = supportedLocales.map((item) => item.code);

  if (session instanceof Response) {
    return session;
  }

  if (!isSessionUserAdmin(session)) {
    return buildForbiddenState(formCopy.errors.forbidden);
  }

  const db = getDbFromContext(context);
  const formData = await request.formData();
  const intent = readStringField(formData, USER_FORM_FIELD.intent);
  const userId = readStringField(formData, USER_FORM_FIELD.userId);

  if (intent === USER_MUTATION_INTENT.delete) {
    if (!userId) {
      return data<UserFormState>(
        {
          errors: {
            form: formCopy.errors.deactivateMissingUser,
          },
          values: buildUserFormValues(),
        },
        { status: 400 },
      );
    }

    const adminInvariantState = await ensureAdminInvariant(context, userId, formCopy, {
      isActive: false,
      role: "admin",
    });

    if (adminInvariantState) {
      return adminInvariantState;
    }

    try {
      await deactivateUser(db, userId);
    } catch (error) {
      if (isLastActiveAdminConstraintError(error)) {
        return buildAdminProtectionState(formCopy.errors.lastActiveAdminDelete);
      }

      throw error;
    }

    await purgePublicBlogDataCache(context, request);

    return redirect(
      buildLocalizedPath(locale, "/dashboard/users", supportedLocaleCodes),
    );
  }

  const submission = parseUserFormData(
    formData,
    intent === USER_MUTATION_INTENT.update
      ? USER_MUTATION_INTENT.update
      : USER_MUTATION_INTENT.create,
    t,
  );

  if (!hasParsedUserData(submission)) {
    return data<UserFormState>(submission, { status: 400 });
  }

  if (intent === USER_MUTATION_INTENT.update) {
    if (!userId) {
      return data<UserFormState>(
        {
          errors: {
            form: formCopy.errors.updateMissingUser,
          },
          values: buildUserFormValues(submission.data),
        },
        { status: 400 },
      );
    }

    const adminInvariantState = await ensureAdminInvariant(context, userId, formCopy, {
      isActive: submission.data.isActive,
      role: submission.data.role,
    });

    if (adminInvariantState) {
      return adminInvariantState;
    }

    if (await isUserEmailTaken(db, submission.data.email, userId)) {
      return buildDuplicateEmailState(
        submission.data,
        formCopy.errors.updateDuplicateEmail,
      );
    }

    try {
      await updateUser(db, userId, submission.data);
    } catch (error) {
      if (isLastActiveAdminConstraintError(error)) {
        return buildAdminProtectionState(
          submission.data.isActive
            ? formCopy.errors.lastActiveAdminDemotion
            : formCopy.errors.lastActiveAdminDeactivate,
        );
      }

      if (isUniqueUserEmailConstraintError(error)) {
        return buildDuplicateEmailState(
          submission.data,
          formCopy.errors.updateDuplicateEmail,
        );
      }

      throw error;
    }

    await purgePublicBlogDataCache(context, request);

    return redirect(
      buildLocalizedPath(locale, "/dashboard/users", supportedLocaleCodes),
    );
  }

  if (await isUserEmailTaken(db, submission.data.email)) {
    return buildDuplicateEmailState(
      submission.data,
      formCopy.errors.createDuplicateEmail,
    );
  }

  try {
    await createUser(db, submission.data);
  } catch (error) {
    if (isUniqueUserEmailConstraintError(error)) {
      return buildDuplicateEmailState(
        submission.data,
        formCopy.errors.createDuplicateEmail,
      );
    }

    throw error;
  }

  return redirect(buildLocalizedPath(locale, "/dashboard/users", supportedLocaleCodes));
}

import { data, redirect, type AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../../db/context";
import { buildLoginRedirect } from "~/lib/auth/login.server";
import { requireSession } from "~/lib/auth/session.server";
import { isSessionUserAdmin } from "~/lib/auth/session-user";
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

import { DASHBOARD_USERS_FORM_COPY } from "./dashboard-users.constants";
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

function buildForbiddenState() {
  return data<UserFormState>(
    {
      errors: {
        form: DASHBOARD_USERS_FORM_COPY.errors.forbidden,
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
    return buildAdminProtectionState(
      DASHBOARD_USERS_FORM_COPY.errors.lastActiveAdminDeactivate,
    );
  }

  return buildAdminProtectionState(
    DASHBOARD_USERS_FORM_COPY.errors.lastActiveAdminDemotion,
  );
}

export async function loadDashboardUsersData(
  context: AppLoadContext,
  request: Request,
): Promise<DashboardUsersLoaderData | Response> {
  const session = await requireSession(request, context, {
    redirectTo: buildLoginRedirect(request),
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
  const session = await requireSession(request, context, {
    redirectTo: buildLoginRedirect(request),
  });

  if (session instanceof Response) {
    return session;
  }

  if (!isSessionUserAdmin(session)) {
    return buildForbiddenState();
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
            form: DASHBOARD_USERS_FORM_COPY.errors.deactivateMissingUser,
          },
          values: buildUserFormValues(),
        },
        { status: 400 },
      );
    }

    const adminInvariantState = await ensureAdminInvariant(context, userId, {
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
        return buildAdminProtectionState(
          DASHBOARD_USERS_FORM_COPY.errors.lastActiveAdminDelete,
        );
      }

      throw error;
    }

    return redirect("/dashboard/users");
  }

  const submission = parseUserFormData(
    formData,
    intent === USER_MUTATION_INTENT.update
      ? USER_MUTATION_INTENT.update
      : USER_MUTATION_INTENT.create,
  );

  if (!hasParsedUserData(submission)) {
    return data<UserFormState>(submission, { status: 400 });
  }

  if (intent === USER_MUTATION_INTENT.update) {
    if (!userId) {
      return data<UserFormState>(
        {
          errors: {
            form: DASHBOARD_USERS_FORM_COPY.errors.updateMissingUser,
          },
          values: buildUserFormValues(submission.data),
        },
        { status: 400 },
      );
    }

    const adminInvariantState = await ensureAdminInvariant(context, userId, {
      isActive: submission.data.isActive,
      role: submission.data.role,
    });

    if (adminInvariantState) {
      return adminInvariantState;
    }

    if (await isUserEmailTaken(db, submission.data.email, userId)) {
      return buildDuplicateEmailState(
        submission.data,
        DASHBOARD_USERS_FORM_COPY.errors.updateDuplicateEmail,
      );
    }

    try {
      await updateUser(db, userId, submission.data);
    } catch (error) {
      if (isLastActiveAdminConstraintError(error)) {
        return buildAdminProtectionState(
          submission.data.isActive
            ? DASHBOARD_USERS_FORM_COPY.errors.lastActiveAdminDemotion
            : DASHBOARD_USERS_FORM_COPY.errors.lastActiveAdminDeactivate,
        );
      }

      if (isUniqueUserEmailConstraintError(error)) {
        return buildDuplicateEmailState(
          submission.data,
          DASHBOARD_USERS_FORM_COPY.errors.updateDuplicateEmail,
        );
      }

      throw error;
    }

    return redirect("/dashboard/users");
  }

  if (await isUserEmailTaken(db, submission.data.email)) {
    return buildDuplicateEmailState(
      submission.data,
      DASHBOARD_USERS_FORM_COPY.errors.createDuplicateEmail,
    );
  }

  try {
    await createUser(db, submission.data);
  } catch (error) {
    if (isUniqueUserEmailConstraintError(error)) {
      return buildDuplicateEmailState(
        submission.data,
        DASHBOARD_USERS_FORM_COPY.errors.createDuplicateEmail,
      );
    }

    throw error;
  }

  return redirect("/dashboard/users");
}

import { useActionData, useLoaderData, useOutletContext } from "react-router";

import type { UserFormState } from "~/domain/users/form";
import type { DashboardLayoutOutletContext } from "~/features/dashboard/layout/identity";

import { DashboardUsersAccessDeniedScreen, DashboardUsersScreen } from "./screen";
import {
  mergeDashboardUsersAuthorizationFormState,
  mergeDashboardUsersProfileFormState,
  type DashboardUsersActionState,
  type DashboardUsersLoaderData,
} from "./state";

export { DashboardUsersAccessDeniedScreen, DashboardUsersScreen };

function isUserProfileActionState(
  value: UserFormState | DashboardUsersActionState | undefined,
): value is UserFormState {
  return typeof value === "object" && value !== null && "values" in value;
}

export default function DashboardUsersRoute() {
  const loaderData = useLoaderData<DashboardUsersLoaderData>();
  const actionData = useActionData<UserFormState | DashboardUsersActionState>();
  const { user } = useOutletContext<DashboardLayoutOutletContext>();

  if (loaderData.access === "denied") {
    return <DashboardUsersAccessDeniedScreen viewerRole={user.role} />;
  }

  const profileActionState = isUserProfileActionState(actionData)
    ? {
        profileForm: {
          editingUserId: loaderData.profileForm.editingUserId,
          errors: actionData.errors,
          isOpen: loaderData.profileForm.isOpen,
          mode: loaderData.profileForm.mode,
          values: actionData.values,
        },
      }
    : undefined;
  const authorizationActionState =
    actionData && typeof actionData === "object" && "authorizationForm" in actionData
      ? actionData
      : undefined;

  return (
    <DashboardUsersScreen
      actionError={
        !loaderData.profileForm.isOpen && !loaderData.authorizationForm.isOpen
          ? isUserProfileActionState(actionData)
            ? actionData.errors?.form
            : authorizationActionState?.actionError
          : undefined
      }
      authorizationForm={mergeDashboardUsersAuthorizationFormState(
        loaderData.authorizationForm,
        authorizationActionState,
      )}
      filters={loaderData.filters}
      metrics={loaderData.metrics}
      pagination={loaderData.pagination}
      permissions={loaderData.permissions}
      profileForm={mergeDashboardUsersProfileFormState(
        loaderData.profileForm,
        profileActionState,
      )}
      users={loaderData.users}
    />
  );
}

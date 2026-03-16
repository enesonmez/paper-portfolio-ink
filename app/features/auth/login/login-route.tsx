import { useActionData, useLoaderData, useNavigation } from "react-router";

import { LoginScreen } from "./login-screen";
import {
  mergeLoginFormState,
  type LoginFormState,
  type LoginLoaderData,
} from "./login.shared";

export { LoginScreen } from "./login-screen";

export default function LoginRoute() {
  const { redirectTo } = useLoaderData<LoginLoaderData>();
  const actionData = useActionData<LoginFormState>();
  const navigation = useNavigation();
  const formState = mergeLoginFormState(redirectTo, actionData);

  return (
    <LoginScreen
      errors={formState.errors}
      isSubmitting={navigation.state === "submitting"}
      values={formState.values}
    />
  );
}

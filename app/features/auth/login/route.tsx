import { useActionData, useLoaderData, useNavigation } from "react-router";

import { LoginScreen } from "./screen";
import {
  mergeLoginFormState,
  type LoginFormState,
  type LoginLoaderData,
} from "./state";

export { LoginScreen } from "./screen";

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

import { redirect, type ActionFunctionArgs } from "react-router";

import {
  buildThemeCookie,
  parseThemeFormData,
} from "~/features/public/layout/public-theme.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const parsed = parseThemeFormData(formData);

  if (!parsed) {
    return redirect("/");
  }

  return redirect(parsed.redirectTo, {
    headers: {
      "Set-Cookie": buildThemeCookie(parsed.theme),
    },
  });
}

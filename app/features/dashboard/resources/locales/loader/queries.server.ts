import type { AppLoadContext } from "react-router";

import {
  listLocales,
  type LocaleResourceRecord,
} from "~/lib/resources/resources.server";

export async function listResourceLocalesForDashboard(
  context: AppLoadContext,
): Promise<LocaleResourceRecord[]> {
  return listLocales(context.db);
}

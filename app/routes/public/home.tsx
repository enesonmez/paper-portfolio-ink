import { useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import { APP_ROUTE_ID } from "~/shared/errors/contracts";

import { runLoaderWithErrorHandling } from "~/shared/errors/route-error-handling.server";
import { createTranslator } from "~/shared/i18n/i18n.shared";
import { PublicHomeScreen } from "~/features/public/home/ui/screen";
import { loadPublicHomeData } from "~/features/public/home/server";
import { buildSiteConfig, getRootLoaderDataFromMatches } from "~/lib/site";

export function meta({ matches }: Route.MetaArgs) {
  const rootData = getRootLoaderDataFromMatches(matches);
  const messages = rootData?.messages;

  if (!messages) {
    return [];
  }

  const t = createTranslator(messages);
  const site = buildSiteConfig(rootData?.configuration);

  return [
    { title: t("site.title.home", { siteName: site.name }) },
    { name: "description", content: t("site.description.home") },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  return runLoaderWithErrorHandling({
    context,
    handler: () => loadPublicHomeData(context, request),
    request,
    routeId: APP_ROUTE_ID.publicHome,
  });
}

export default function HomePage() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <PublicHomeScreen
      featuredProjects={loaderData.featuredProjects}
      skills={loaderData.skills}
    />
  );
}

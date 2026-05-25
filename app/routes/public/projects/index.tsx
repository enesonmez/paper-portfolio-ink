import { useLoaderData } from "react-router";
import type { Route } from "./+types/index";
import { APP_ROUTE_ID } from "~/shared/errors/contracts";

import { runLoaderWithErrorHandling } from "~/shared/errors/route-error-handling.server";
import { createTranslator } from "~/shared/i18n/i18n.shared";
import { PublicProjectsScreen } from "~/features/public/projects/ui/screen";
import { loadPublicProjectsData } from "~/features/public/projects/server";
import { buildSiteConfig, getRootLoaderDataFromMatches } from "~/lib/site";

export function meta({ location, matches }: Route.MetaArgs) {
  const rootData = getRootLoaderDataFromMatches(matches);

  if (rootData) {
    const t = createTranslator(rootData.messages);
    const site = buildSiteConfig(rootData.configuration);
    const title = t("site.title.projects", { siteName: site.name });
    const description = t("site.description.projects");

    return [
      { title },
      {
        name: "description",
        content: description,
      },
      {
        property: "og:title",
        content: title,
      },
      {
        property: "og:description",
        content: description,
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: new URL(location.pathname, site.url).toString(),
      },
    ];
  }

  return [];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  return runLoaderWithErrorHandling({
    context,
    handler: () => loadPublicProjectsData(context, request),
    request,
    routeId: APP_ROUTE_ID.publicProjectsIndex,
  });
}

export default function ProjectsPage() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <PublicProjectsScreen
      nextCursor={loaderData.nextCursor}
      projects={loaderData.projects}
      stats={loaderData.stats}
    />
  );
}

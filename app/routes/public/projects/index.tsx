import { useLoaderData } from "react-router";
import type { Route } from "./+types/index";
import { APP_ROUTE_ID } from "~/shared/errors/contracts";

import type { loader as rootLoader } from "~/root";
import { runLoaderWithErrorHandling } from "~/shared/errors/route-error-handling.server";
import { createTranslator } from "~/shared/i18n/i18n.shared";
import { PublicProjectsScreen } from "~/features/public/projects/screen";
import { loadPublicProjectsData } from "~/features/public/projects/server";
import { siteConfig } from "~/lib/site";

type RootLoaderData = Exclude<Awaited<ReturnType<typeof rootLoader>>, Response>;

export function meta({ location, matches }: Route.MetaArgs) {
  for (const match of matches) {
    if (match && match.id === "root" && !(match.data instanceof Response)) {
      const rootData = match.data as RootLoaderData;
      const t = createTranslator(rootData.messages);
      const title = t("site.title.projects");
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
          content: new URL(location.pathname, siteConfig.url).toString(),
        },
      ];
    }
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

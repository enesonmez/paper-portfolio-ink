import { useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import { APP_ROUTE_ID } from "~/shared/errors/contracts";

import type { loader as rootLoader } from "~/root";
import { runLoaderWithErrorHandling } from "~/shared/errors/route-error-handling.server";
import { createTranslator } from "~/shared/i18n/i18n.shared";
import { PublicHomeScreen } from "~/features/public/home/screen";
import { loadPublicHomeData } from "~/features/public/home/server";

type RootLoaderData = Exclude<Awaited<ReturnType<typeof rootLoader>>, Response>;

export function meta({ matches }: Route.MetaArgs) {
  let messages: RootLoaderData["messages"] | undefined;

  for (const match of matches) {
    if (match && match.id === "root" && !(match.data instanceof Response)) {
      const rootData = match.data as RootLoaderData;
      messages = rootData.messages;
      break;
    }
  }

  if (!messages) {
    return [];
  }

  const t = createTranslator(messages);

  return [
    { title: t("site.title.home") },
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

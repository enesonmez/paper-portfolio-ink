import { useLoaderData } from "react-router";
import type { Route } from "./+types/index";
import { APP_ROUTE_ID } from "~/shared/errors/contracts";

import type { loader as rootLoader } from "~/root";
import { runLoaderWithErrorHandling } from "~/shared/errors/route-error-handling.server";
import { createTranslator } from "~/shared/i18n/i18n.shared";
import { PublicBlogScreen } from "~/features/public/blog/screen";
import { loadPublicBlogData } from "~/features/public/blog/server";
import { siteConfig } from "~/lib/site";

type RootLoaderData = Exclude<Awaited<ReturnType<typeof rootLoader>>, Response>;

export function meta({ location, matches }: Route.MetaArgs) {
  for (const match of matches) {
    if (match && match.id === "root" && !(match.data instanceof Response)) {
      const rootData = match.data as RootLoaderData;
      const t = createTranslator(rootData.messages);
      const title = t("site.title.blog");
      const description = t("site.description.blog");

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
        {
          property: "twitter:card",
          content: "summary",
        },
      ];
    }
  }

  return [];
}

export async function loader({
  context,
  request,
}: {
  context: Parameters<typeof loadPublicBlogData>[0];
  request: Request;
}) {
  return runLoaderWithErrorHandling({
    context,
    handler: () => loadPublicBlogData(context, request),
    request,
    routeId: APP_ROUTE_ID.publicBlogIndex,
  });
}

export default function BlogPage() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <PublicBlogScreen nextCursor={loaderData.nextCursor} posts={loaderData.posts} />
  );
}

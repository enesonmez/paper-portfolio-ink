import { useLoaderData } from "react-router";
import type { Route } from "./+types/blog";

import type { loader as rootLoader } from "~/root";
import { createTranslator } from "~/shared/i18n/i18n.shared";
import { PublicBlogScreen } from "~/features/public/blog/screen";
import { loadPublicBlogData } from "~/features/public/blog/server";
import { siteConfig } from "~/lib/site";

export function meta({ location, matches }: Route.MetaArgs) {
  for (const match of matches) {
    if (match && match.id === "root") {
      const rootData = match.data as Awaited<ReturnType<typeof rootLoader>>;
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
  return loadPublicBlogData(context, request);
}

export default function BlogPage() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <PublicBlogScreen nextCursor={loaderData.nextCursor} posts={loaderData.posts} />
  );
}

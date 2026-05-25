import { Link, useLoaderData, useRouteError } from "react-router";
import type { Route } from "./+types/$slug";
import { APP_ROUTE_ID } from "~/shared/errors/contracts";

import { runLoaderWithErrorHandling } from "~/shared/errors/route-error-handling.server";
import { createTranslator } from "~/shared/i18n/i18n.shared";
import { useLocalizedPath, useT } from "~/shared/i18n/i18n-react";
import { isPublicBlogPostNotFoundError } from "~/features/public/blog/post/errors";
import { PublicBlogPostScreen } from "~/features/public/blog/post/screen";
import { loadPublicBlogPostData } from "~/features/public/blog/server";
import { buildSiteConfig, getRootLoaderDataFromMatches } from "~/lib/site";

export const meta: Route.MetaFunction = ({ data, location, matches }) => {
  const rootData = getRootLoaderDataFromMatches(matches);
  const messages = rootData?.messages;
  const site = buildSiteConfig(rootData?.configuration);

  if (!data) {
    return messages
      ? [
          {
            title: createTranslator(messages)("site.title.blogPostFallback", {
              siteName: site.name,
            }),
          },
        ]
      : [];
  }

  const pageTitle = `${data.post.title} | Blog | ${site.name}`;
  const pageUrl = new URL(location.pathname, site.url).toString();
  const descriptors = [
    { title: pageTitle },
    {
      name: "description",
      content: data.post.excerpt,
    },
    {
      property: "og:title",
      content: pageTitle,
    },
    {
      property: "og:description",
      content: data.post.excerpt,
    },
    {
      property: "og:type",
      content: "article",
    },
    {
      property: "og:url",
      content: pageUrl,
    },
    {
      property: "article:published_time",
      content: data.post.publishedAtIso,
    },
    {
      property: "twitter:card",
      content: data.post.coverImageUrl ? "summary_large_image" : "summary",
    },
  ];

  if (data.post.coverImageUrl) {
    descriptors.push({
      property: "og:image",
      content: data.post.coverImageUrl,
    });
  }

  return descriptors;
};

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const currentRequest =
    request ?? new Request("http://localhost/blog/unknown-slug", { method: "GET" });

  return runLoaderWithErrorHandling({
    context,
    handler: async () => {
      const slug = params.slug;

      if (!slug) {
        const errorModule = await import("~/features/public/blog/post/errors.server");
        const PublicBlogPostNotFoundError =
          errorModule.PublicBlogPostNotFoundError as new () => Error;

        throw new PublicBlogPostNotFoundError();
      }

      return loadPublicBlogPostData(context, slug);
    },
    request: currentRequest,
    routeId: APP_ROUTE_ID.publicBlogSlug,
  });
}

export default function BlogPostPage() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <PublicBlogPostScreen morePosts={loaderData.morePosts} post={loaderData.post} />
  );
}

export function ErrorBoundary() {
  const t = useT();
  const to = useLocalizedPath();
  const error = useRouteError();

  if (isPublicBlogPostNotFoundError(error)) {
    return (
      <main className="mx-auto grid min-h-[70vh] max-w-4xl px-4 py-12 md:px-8 md:py-16">
        <section className="bg-card grid content-center gap-5 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:p-8 dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
          <p className="text-muted-foreground text-sm tracking-[0.08em] uppercase">
            {t("public.blog.notFoundEyebrow")}
          </p>
          <h1 className="font-display text-5xl leading-none md:text-7xl">
            {t("public.blog.notFoundTitle")}
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base leading-7 md:text-lg">
            {t("public.blog.notFoundBody")}
          </p>
          <div>
            <Link to={to("/blog")} className="font-sans text-sm font-bold underline">
              {t("public.blog.backToBlog")}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error("Unknown blog route error");
}

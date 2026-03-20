import { useLoaderData, useRouteError } from "react-router";
import type { Route } from "./+types/blog_.$slug";

import { PublicBlogPostScreen } from "~/features/public/blog/public-blog-post-screen";
import {
  loadPublicBlogPostData,
  PublicBlogPostNotFoundError,
} from "~/features/public/blog/public-blog.server";
import { siteConfig } from "~/lib/site";

export const meta: Route.MetaFunction = ({ data, location }) => {
  if (!data) {
    return [{ title: "Blog Post | Enes Ink" }];
  }

  const pageTitle = `${data.post.title} | Blog | Enes Ink`;
  const pageUrl = new URL(location.pathname, siteConfig.url).toString();
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

export async function loader({ context, params }: Route.LoaderArgs) {
  const slug = params.slug;

  if (!slug) {
    throw new PublicBlogPostNotFoundError();
  }

  return loadPublicBlogPostData(context, slug);
}

export default function BlogPostPage() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <PublicBlogPostScreen morePosts={loaderData.morePosts} post={loaderData.post} />
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof PublicBlogPostNotFoundError) {
    return (
      <main className="mx-auto grid min-h-[70vh] max-w-4xl px-4 py-12 md:px-8 md:py-16">
        <section className="bg-card grid content-center gap-5 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:p-8 dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
          <p className="text-muted-foreground text-sm tracking-[0.08em] uppercase">
            Public Logbook
          </p>
          <h1 className="font-display text-5xl leading-none md:text-7xl">
            Yazi bulunamadi
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base leading-7 md:text-lg">
            Bu slug ile eslesen yayinlanmis bir not yok. Blog arsivinden baska bir yazi
            sec.
          </p>
        </section>
      </main>
    );
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error("Unknown blog route error");
}

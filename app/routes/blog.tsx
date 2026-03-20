import { useLoaderData } from "react-router";
import type { MetaFunction } from "react-router";

import { PublicBlogScreen } from "~/features/public/blog/public-blog-screen";
import { loadPublicBlogData } from "~/features/public/blog/public-blog.server";
import { siteConfig } from "~/lib/site";

export const meta: MetaFunction = (_args) => [
  { title: "Blog | Enes Ink" },
  {
    name: "description",
    content: "Edge-first teknik notlar, mimari denemeler ve uygulama gunlukleri.",
  },
  {
    property: "og:title",
    content: "Blog | Enes Ink",
  },
  {
    property: "og:description",
    content: "Edge-first teknik notlar, mimari denemeler ve uygulama gunlukleri.",
  },
  {
    property: "og:type",
    content: "website",
  },
  {
    property: "og:url",
    content: `${siteConfig.url}/blog`,
  },
  {
    property: "twitter:card",
    content: "summary",
  },
];

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

  return <PublicBlogScreen nextPage={loaderData.nextPage} posts={loaderData.posts} />;
}

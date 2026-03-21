import { useLoaderData } from "react-router";
import type { Route } from "./+types/_index";

import { PublicHomeScreen } from "~/features/public/home/public-home-screen";
import { loadPublicHomeData } from "~/features/public/home/public-home.server";
import { siteConfig } from "../lib/site";

export function meta() {
  return [
    { title: siteConfig.title },
    { name: "description", content: siteConfig.description },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  return loadPublicHomeData(context, request);
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

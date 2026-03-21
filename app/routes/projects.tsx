import { useLoaderData } from "react-router";
import type { Route } from "./+types/projects";

import { PublicProjectsScreen } from "~/features/public/projects/public-projects-screen";
import { loadPublicProjectsData } from "~/features/public/projects/public-projects.server";

export function meta() {
  return [
    { title: "Projects | Enes Ink" },
    {
      name: "description",
      content: "Secili projeler, teknik ozetler ve uygulama notlari.",
    },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  return loadPublicProjectsData(context, request);
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

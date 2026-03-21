import { useLoaderData } from "react-router";
import type { Route } from "./+types/_index";

import type { loader as rootLoader } from "~/root";
import { createTranslator } from "~/features/i18n/i18n.shared";
import { PublicHomeScreen } from "~/features/public/home/public-home-screen";
import { loadPublicHomeData } from "~/features/public/home/public-home.server";

export function meta({ matches }: Route.MetaArgs) {
  let messages: Awaited<ReturnType<typeof rootLoader>>["messages"] | undefined;

  for (const match of matches) {
    if (match && match.id === "root") {
      const rootData = match.data as Awaited<ReturnType<typeof rootLoader>>;
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

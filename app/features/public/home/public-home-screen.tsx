import type { PublicFeaturedProject } from "~/lib/projects/projects.server";

import { PublicHomeCta } from "./components/public-home-cta";
import { PublicHomeFeaturedProjects } from "./components/public-home-featured-projects";
import { PublicHomeHero } from "./components/public-home-hero";
import { PublicHomeResume } from "./components/public-home-resume";
import { PublicHomeTechStack } from "./components/public-home-tech-stack";

interface PublicHomeScreenProps {
  featuredProjects: PublicFeaturedProject[];
}

export function PublicHomeScreen({ featuredProjects }: PublicHomeScreenProps) {
  return (
    <main>
      <PublicHomeHero />
      <PublicHomeFeaturedProjects projects={featuredProjects} />
      <PublicHomeTechStack />
      <PublicHomeResume />
      <PublicHomeCta />
    </main>
  );
}

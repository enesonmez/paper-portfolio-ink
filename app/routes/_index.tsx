import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import { siteConfig } from "../lib/site";

export function meta() {
  return [
    { title: siteConfig.title },
    { name: "description", content: siteConfig.description },
  ];
}

export default function HomePage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-6xl gap-6 px-4 py-8 md:px-6 lg:py-16">
      <section className="grid min-h-112 content-center gap-6 border-2 border-black bg-card p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)] md:p-8">
        <p className="text-sm uppercase tracking-[0.08em] text-muted-foreground">
          Paper Comic / Phase 1.2
        </p>
        <h1 className="font-display text-6xl leading-none md:text-8xl">
          {siteConfig.name}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
          {siteConfig.description}
        </p>
        <div
          className="flex flex-wrap gap-3"
          aria-label="Ana yonlendirmeler"
        >
          <Button asChild size="lg">
            <Link to="/projects">Projeleri Incele</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link to="/blog">Yazilari Oku</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 border-2 border-black bg-card p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)] md:p-8">
        <h2 className="font-display text-4xl leading-none md:text-5xl">
          Tailwind + shadcn tabani hazir
        </h2>
        <ul className="grid gap-3 pl-5 text-sm leading-6 text-muted-foreground md:text-base">
          <li>`app/` React Router route ve layout dosyalari</li>
          <li>`components/ui/` shadcn tabanli UI atomlari</li>
          <li>`tests/` Unit ve integration test senaryolari</li>
          <li>`public/` statik varliklar</li>
          <li>`db/` D1 migration ciktilari icin ayrilan alan</li>
        </ul>
      </section>
    </main>
  );
}

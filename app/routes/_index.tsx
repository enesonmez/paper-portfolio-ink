import { Link } from "react-router";

import { siteConfig } from "../lib/site";

export function meta() {
  return [
    { title: siteConfig.title },
    { name: "description", content: siteConfig.description },
  ];
}

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="panel hero-panel">
        <p className="eyebrow">Paper Comic / Phase 1</p>
        <h1>{siteConfig.name}</h1>
        <p className="lede">{siteConfig.description}</p>
        <div className="button-row" aria-label="Ana yonlendirmeler">
          <Link className="button" to="/projects">
            Projeleri Incele
          </Link>
          <Link className="button button-secondary" to="/blog">
            Yazilari Oku
          </Link>
        </div>
      </section>

      <section className="panel">
        <h2>Temel klasor yapisi hazir</h2>
        <ul className="stack-list">
          <li>`app/` React Router route ve layout dosyalari</li>
          <li>`tests/` Unit ve integration test senaryolari</li>
          <li>`public/` statik varliklar</li>
          <li>`db/` D1 migration ciktilari icin ayrilan alan</li>
        </ul>
      </section>
    </main>
  );
}


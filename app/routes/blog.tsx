export function meta() {
  return [
    { title: "Blog | Enes Ink" },
    {
      name: "description",
      content: "Teknik notlar, deneyler ve mimari kararlar icin blog listesi.",
    },
  ];
}

export default function BlogPage() {
  return (
    <main className="page-shell">
      <section className="panel hero-panel">
        <p className="eyebrow">Blog / Placeholder</p>
        <h1>Yazilar yolda</h1>
        <p className="lede">
          Blog listeleme ve detay akisi bir sonraki asamada SEO uyumlu route
          yapisi ile tamamlanacak.
        </p>
      </section>
    </main>
  );
}


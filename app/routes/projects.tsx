export function meta() {
  return [
    { title: "Projects | Enes Ink" },
    {
      name: "description",
      content: "Secili projeler, teknik ozetler ve uygulama notlari.",
    },
  ];
}

export default function ProjectsPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-6xl px-4 py-8 md:px-6 lg:py-16">
      <section className="bg-card grid min-h-96 content-center gap-5 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:p-8 dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
        <p className="text-muted-foreground text-sm tracking-[0.08em] uppercase">
          Projects / Placeholder
        </p>
        <h1 className="font-display text-5xl leading-none md:text-7xl">
          Projeler listesi hazirlaniyor
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-7 md:text-lg">
          Proje kartlari ve detayli case study akisi sonraki public UI adiminda bu route
          uzerine yerlestirilecek.
        </p>
      </section>
    </main>
  );
}

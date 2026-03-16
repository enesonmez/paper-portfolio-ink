const dashboardStats = [
  {
    label: "Total Posts",
    value: "42",
    delta: "+5%",
    tone: "text-green-600 dark:text-green-400",
  },
  {
    label: "Total Views",
    value: "12.8K",
    delta: "+12%",
    tone: "text-green-600 dark:text-green-400",
  },
  {
    label: "Project Success",
    value: "98%",
    delta: "Stable",
    tone: "text-primary",
  },
  {
    label: "Server Load",
    value: "14%",
    delta: "Optimal",
    tone: "text-sky-700 dark:text-sky-400",
  },
];

const dashboardPosts = [
  {
    title: "Neo-Brutalism in UI Design",
    category: "Design",
    status: "Published",
    statusTone: "text-green-600 dark:text-green-400",
  },
  {
    title: "The Future of Web Dev 2024",
    category: "Tech",
    status: "Draft",
    statusTone: "text-amber-600 dark:text-amber-400",
  },
  {
    title: "Scaling CSS for Large Projects",
    category: "Tutorial",
    status: "Published",
    statusTone: "text-green-600 dark:text-green-400",
  },
];

const dashboardLogs = [
  {
    title: "Updated Blog Post: Neo-Brutalism in UI",
    time: "2 hours ago",
    tone: "bg-primary text-black",
  },
  {
    title: "New Project Added: Edge Commerce",
    time: "Yesterday",
    tone: "bg-green-500 text-white",
  },
  {
    title: "System Configuration Changed",
    time: "3 days ago",
    tone: "bg-stone-300 text-black dark:bg-stone-600 dark:text-white",
  },
];

function cardClasses() {
  return "bg-card border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]";
}

export default function DashboardIndexRoute() {
  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <article key={stat.label} className={cardClasses()}>
            <p className="text-muted-foreground mb-2 font-sans text-xs font-bold tracking-[0.18em] uppercase">
              {stat.label}
            </p>
            <div className="flex items-end gap-3">
              <span className="font-display text-foreground text-6xl leading-none">
                {stat.value}
              </span>
              <span className={`font-sans text-xs font-bold uppercase ${stat.tone}`}>
                {stat.delta}
              </span>
            </div>
          </article>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <section className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-muted-foreground font-sans text-xs font-bold tracking-[0.18em] uppercase">
                Content Pipeline
              </p>
              <h1 className="font-display text-foreground text-5xl leading-none uppercase md:text-6xl">
                Manage Content
              </h1>
            </div>
            <button
              type="button"
              className="bg-primary w-full border-2 border-black px-5 py-3 font-sans text-sm font-bold tracking-[0.14em] text-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none md:w-auto dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]"
            >
              Create New Post
            </button>
          </div>

          <div className="bg-card overflow-x-auto border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
            <table className="min-w-full border-collapse text-left">
              <thead className="bg-muted border-b-2 border-black">
                <tr>
                  <th className="p-4 font-sans text-xs font-bold tracking-[0.18em] uppercase">
                    Post Title
                  </th>
                  <th className="p-4 font-sans text-xs font-bold tracking-[0.18em] uppercase">
                    Category
                  </th>
                  <th className="p-4 font-sans text-xs font-bold tracking-[0.18em] uppercase">
                    Status
                  </th>
                  <th className="p-4 text-right font-sans text-xs font-bold tracking-[0.18em] uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {dashboardPosts.map((post) => (
                  <tr
                    key={post.title}
                    className="border-b border-black/10 last:border-b-0"
                  >
                    <td className="text-foreground p-4 font-sans text-sm font-bold">
                      {post.title}
                    </td>
                    <td className="p-4">
                      <span className="bg-primary/20 text-foreground inline-flex border-2 border-black px-2 py-1 font-sans text-[10px] font-bold tracking-[0.14em] uppercase">
                        {post.category}
                      </span>
                    </td>
                    <td
                      className={`p-4 font-sans text-xs font-bold uppercase ${post.statusTone}`}
                    >
                      {post.status}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="bg-primary border-2 border-black px-3 py-2 font-sans text-[10px] font-bold tracking-[0.14em] text-black uppercase transition-transform hover:translate-x-0.5 hover:translate-y-0.5"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="bg-destructive text-destructive-foreground border-2 border-black px-3 py-2 font-sans text-[10px] font-bold tracking-[0.14em] uppercase transition-transform hover:translate-x-0.5 hover:translate-y-0.5"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-4">
          <div>
            <p className="text-muted-foreground font-sans text-xs font-bold tracking-[0.18em] uppercase">
              Runtime Feed
            </p>
            <h2 className="font-display text-foreground text-5xl leading-none uppercase">
              Logs
            </h2>
          </div>

          <div className="space-y-4">
            {dashboardLogs.map((log) => (
              <article key={log.title} className={cardClasses()}>
                <div className="flex items-start gap-4">
                  <div
                    className={`shrink-0 border-2 border-black px-3 py-2 ${log.tone}`}
                  >
                    <span className="font-sans text-[10px] font-bold uppercase">
                      Log
                    </span>
                  </div>
                  <div>
                    <p className="text-foreground font-sans text-sm font-bold tracking-[0.06em] uppercase">
                      {log.title}
                    </p>
                    <p className="text-muted-foreground mt-2 font-sans text-[10px] font-bold tracking-[0.18em] uppercase">
                      {log.time}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

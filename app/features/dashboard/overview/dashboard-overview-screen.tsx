import { DashboardMetricCard } from "~/components/dashboard/metric-card";
import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardSectionHeading } from "~/components/dashboard/section-heading";

import {
  DASHBOARD_OVERVIEW_LOGS,
  DASHBOARD_OVERVIEW_POSTS,
  DASHBOARD_OVERVIEW_STATS,
} from "./dashboard-overview.constants";

export default function DashboardOverviewScreen() {
  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {DASHBOARD_OVERVIEW_STATS.map((stat) => (
          <DashboardMetricCard
            key={stat.label}
            label={stat.label}
            meta={stat.delta}
            value={stat.value}
          />
        ))}
      </section>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <section className="space-y-4">
          <DashboardSectionHeading
            action={
              <button
                type="button"
                className="bg-primary w-full border-2 border-black px-5 py-3 font-sans text-sm font-bold tracking-[0.14em] text-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none md:w-auto dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]"
              >
                Create New Post
              </button>
            }
            eyebrow="Content Pipeline"
            title="Manage Content"
          />

          <DashboardPanel className="overflow-x-auto p-0">
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
                {DASHBOARD_OVERVIEW_POSTS.map((post) => (
                  <tr key={post.title} className="border-b border-black/10 last:border-b-0">
                    <td className="text-foreground p-4 font-sans text-sm font-bold">
                      {post.title}
                    </td>
                    <td className="p-4">
                      <span className="bg-primary/20 text-foreground inline-flex border-2 border-black px-2 py-1 font-sans text-[10px] font-bold tracking-[0.14em] uppercase">
                        {post.category}
                      </span>
                    </td>
                    <td
                      className={`p-4 font-sans text-xs font-bold uppercase ${post.statusToneClassName}`}
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
          </DashboardPanel>
        </section>

        <aside className="space-y-4">
          <DashboardSectionHeading eyebrow="Runtime Feed" level={2} title="Logs" />

          <div className="space-y-4">
            {DASHBOARD_OVERVIEW_LOGS.map((log) => (
              <DashboardPanel key={log.title}>
                <div className="flex items-start gap-4">
                  <div
                    className={`shrink-0 border-2 border-black px-3 py-2 ${log.toneClassName}`}
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
              </DashboardPanel>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

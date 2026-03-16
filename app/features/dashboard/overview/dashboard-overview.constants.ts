export interface DashboardOverviewStat {
  delta: string;
  label: string;
  toneClassName: string;
  value: string;
}

export interface DashboardOverviewPost {
  category: string;
  status: string;
  statusToneClassName: string;
  title: string;
}

export interface DashboardOverviewLog {
  time: string;
  title: string;
  toneClassName: string;
}

export const DASHBOARD_OVERVIEW_STATS: readonly DashboardOverviewStat[] = [
  {
    delta: "+5%",
    label: "Total Posts",
    toneClassName: "text-green-600 dark:text-green-400",
    value: "42",
  },
  {
    delta: "+12%",
    label: "Total Views",
    toneClassName: "text-green-600 dark:text-green-400",
    value: "12.8K",
  },
  {
    delta: "Stable",
    label: "Project Success",
    toneClassName: "text-primary",
    value: "98%",
  },
  {
    delta: "Optimal",
    label: "Server Load",
    toneClassName: "text-sky-700 dark:text-sky-400",
    value: "14%",
  },
];

export const DASHBOARD_OVERVIEW_POSTS: readonly DashboardOverviewPost[] = [
  {
    category: "Design",
    status: "Published",
    statusToneClassName: "text-green-600 dark:text-green-400",
    title: "Neo-Brutalism in UI Design",
  },
  {
    category: "Tech",
    status: "Draft",
    statusToneClassName: "text-amber-600 dark:text-amber-400",
    title: "The Future of Web Dev 2024",
  },
  {
    category: "Tutorial",
    status: "Published",
    statusToneClassName: "text-green-600 dark:text-green-400",
    title: "Scaling CSS for Large Projects",
  },
];

export const DASHBOARD_OVERVIEW_LOGS: readonly DashboardOverviewLog[] = [
  {
    time: "2 hours ago",
    title: "Updated Blog Post: Neo-Brutalism in UI",
    toneClassName: "bg-primary text-black",
  },
  {
    time: "Yesterday",
    title: "New Project Added: Edge Commerce",
    toneClassName: "bg-green-500 text-white",
  },
  {
    time: "3 days ago",
    title: "System Configuration Changed",
    toneClassName: "bg-stone-300 text-black dark:bg-stone-600 dark:text-white",
  },
];

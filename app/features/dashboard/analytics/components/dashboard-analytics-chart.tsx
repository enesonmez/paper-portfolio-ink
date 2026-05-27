import { useState } from "react";
import { useT } from "~/shared/i18n/i18n-react";
import type { ViewsDataPoint, MonthlyViewsDataPoint } from "../state";

interface DashboardAnalyticsChartProps {
  dailyData: ViewsDataPoint[];
  monthlyData: MonthlyViewsDataPoint[];
}

export function DashboardAnalyticsChart({
  dailyData,
  monthlyData,
}: DashboardAnalyticsChartProps) {
  const t = useT();
  const [activeTab, setActiveTab] = useState<"daily" | "monthly">("daily");

  const isDaily = activeTab === "daily";
  const rawData = isDaily ? dailyData : monthlyData;

  const data = rawData.map((item) => {
    const label = "date" in item ? item.date : item.month;
    const value = item.count;
    return { label, value };
  });

  const chartHeight = 200;
  const chartWidth = 600;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const graphHeight = chartHeight - paddingTop - paddingBottom;
  const graphWidth = chartWidth - paddingLeft - paddingRight;

  const maxVal = Math.max(...data.map((d) => d.value), 5);
  const barCount = data.length;

  return (
    <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-stone-800">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-4">
        <h3 className="font-display text-2xl tracking-wide text-stone-900 dark:text-stone-50">
          {isDaily
            ? t("dashboard.analytics.dailyViewsTab")
            : t("dashboard.analytics.monthlyViewsTab")}
        </h3>
        <div className="flex border-2 border-black bg-stone-100 p-1 dark:bg-stone-900">
          <button
            onClick={() => setActiveTab("daily")}
            className={`border-r border-black/20 px-4 py-1.5 font-sans text-xs font-bold tracking-[0.14em] uppercase transition-colors ${
              isDaily
                ? "bg-primary text-black"
                : "text-stone-600 hover:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-800"
            }`}
          >
            {t("dashboard.analytics.dailyViewsTab")}
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`px-4 py-1.5 font-sans text-xs font-bold tracking-[0.14em] uppercase transition-colors ${
              !isDaily
                ? "bg-primary text-black"
                : "text-stone-600 hover:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-800"
            }`}
          >
            {t("dashboard.analytics.monthlyViewsTab")}
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex h-50 items-center justify-center border border-dashed border-stone-300 dark:border-stone-700">
          <span className="font-sans text-xs font-bold tracking-wider text-stone-400 uppercase">
            {t("dashboard.analytics.emptyState")}
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full min-w-125"
            role="img"
            aria-label="Analytics Views Chart"
          >
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const y = paddingTop + graphHeight * (1 - ratio);
              const gridVal = Math.round(maxVal * ratio);
              return (
                <g key={index}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={chartWidth - paddingRight}
                    y2={y}
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    className="text-stone-200 dark:text-stone-700"
                  />
                  <text
                    x={paddingLeft - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-stone-500 font-mono text-[10px] font-bold dark:fill-stone-400"
                  >
                    {gridVal}
                  </text>
                </g>
              );
            })}

            {data.map((d, index) => {
              const barWidth = Math.max(
                4,
                Math.floor(graphWidth / barCount) - (barCount > 20 ? 2 : 6),
              );
              const spaceBetween = graphWidth / barCount;
              const x =
                paddingLeft + index * spaceBetween + (spaceBetween - barWidth) / 2;

              const valRatio = d.value / maxVal;
              const barHeight = Math.max(2, graphHeight * valRatio);
              const y = paddingTop + graphHeight - barHeight;

              const showLabel =
                !isDaily ||
                barCount <= 10 ||
                index === 0 ||
                index === barCount - 1 ||
                index % Math.ceil(barCount / 6) === 0;

              const cleanLabel = isDaily
                ? d.label.split("-")[2]
                : d.label.split("-")[1];

              return (
                <g key={index} className="group">
                  <rect
                    x={x - 2}
                    y={paddingTop}
                    width={barWidth + 4}
                    height={graphHeight + 5}
                    fill="transparent"
                    className="cursor-pointer"
                  />

                  <rect
                    x={x + 3}
                    y={y + 3}
                    width={barWidth}
                    height={barHeight}
                    fill="#000000"
                    stroke="#000000"
                    strokeWidth="2"
                  />

                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill="#facc15"
                    stroke="#000000"
                    strokeWidth="2"
                    className="transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
                  />

                  <g className="opacity-0 transition-opacity group-hover:opacity-100">
                    <rect
                      x={x + barWidth / 2 - 25}
                      y={Math.max(0, y - 25)}
                      width="50"
                      height="18"
                      fill="#000000"
                      stroke="#000000"
                      strokeWidth="1"
                    />
                    <text
                      x={x + barWidth / 2}
                      y={Math.max(12, y - 13)}
                      textAnchor="middle"
                      fill="#ffffff"
                      className="font-mono text-[9px] font-bold"
                    >
                      {d.value}
                    </text>
                  </g>

                  {showLabel && (
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight - paddingBottom + 18}
                      textAnchor="middle"
                      className="fill-stone-600 font-mono text-[10px] font-bold dark:fill-stone-400"
                    >
                      {cleanLabel}
                    </text>
                  )}
                </g>
              );
            })}

            <line
              x1={paddingLeft}
              y1={chartHeight - paddingBottom}
              x2={chartWidth - paddingRight}
              y2={chartHeight - paddingBottom}
              stroke="#000000"
              strokeWidth="2"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

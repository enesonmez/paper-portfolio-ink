import { useEffect, useState } from "react";

import { DashboardPanel } from "~/components/dashboard/panel";

import { useDashboardSettingsCopy } from "../copy";

interface RuntimeMetricState {
  cpuEstimatePercent: number | null;
  hardwareConcurrency: number | null;
  jsHeapLimitBytes: number | null;
  jsHeapUsedBytes: number | null;
  storageQuotaBytes: number | null;
  storageUsageBytes: number | null;
  updatedAtLabel: string;
}

interface StorageEstimateNavigatorShape {
  storage?: {
    estimate?: () => Promise<{
      quota?: number;
      usage?: number;
    }>;
  };
}

interface PerformanceWithMemory extends Performance {
  memory?: {
    jsHeapSizeLimit: number;
    usedJSHeapSize: number;
  };
}

function formatBytes(value: number | null, unavailableLabel: string) {
  if (value === null || Number.isNaN(value)) {
    return unavailableLabel;
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 100 ? 0 : size >= 10 ? 1 : 2)} ${units[unitIndex]}`;
}

async function sampleCpuEstimate() {
  const waitMs = 250;
  const startedAt = performance.now();

  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, waitMs);
  });

  const lag = Math.max(0, performance.now() - startedAt - waitMs);
  return Math.min(100, Math.round((lag / waitMs) * 100));
}

async function readRuntimeMetricState(): Promise<RuntimeMetricState> {
  const nextState: RuntimeMetricState = {
    cpuEstimatePercent: null,
    hardwareConcurrency:
      typeof navigator.hardwareConcurrency === "number"
        ? navigator.hardwareConcurrency
        : null,
    jsHeapLimitBytes: null,
    jsHeapUsedBytes: null,
    storageQuotaBytes: null,
    storageUsageBytes: null,
    updatedAtLabel: new Date().toLocaleTimeString(),
  };

  const performanceWithMemory = performance as PerformanceWithMemory;
  if (performanceWithMemory.memory) {
    nextState.jsHeapLimitBytes = performanceWithMemory.memory.jsHeapSizeLimit;
    nextState.jsHeapUsedBytes = performanceWithMemory.memory.usedJSHeapSize;
  }

  const navigatorWithStorage = navigator as Navigator & StorageEstimateNavigatorShape;
  if (navigatorWithStorage.storage?.estimate) {
    const storageEstimate = await navigatorWithStorage.storage.estimate();
    nextState.storageQuotaBytes = storageEstimate.quota ?? null;
    nextState.storageUsageBytes = storageEstimate.usage ?? null;
  }

  nextState.cpuEstimatePercent = await sampleCpuEstimate();

  return nextState;
}

export function DashboardSettingsRuntimeMetrics() {
  const copy = useDashboardSettingsCopy();
  const [metrics, setMetrics] = useState<RuntimeMetricState>({
    cpuEstimatePercent: null,
    hardwareConcurrency:
      typeof navigator !== "undefined" ? navigator.hardwareConcurrency : null,
    jsHeapLimitBytes: null,
    jsHeapUsedBytes: null,
    storageQuotaBytes: null,
    storageUsageBytes: null,
    updatedAtLabel: "--:--:--",
  });

  useEffect(() => {
    let isMounted = true;

    const updateMetrics = async () => {
      const nextState = await readRuntimeMetricState();

      if (isMounted) {
        setMetrics(nextState);
      }
    };

    void updateMetrics();
    const intervalId = window.setInterval(() => {
      void updateMetrics();
    }, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <DashboardPanel className="space-y-4">
      <div className="space-y-2">
        <p className="text-muted-foreground font-sans text-xs font-bold tracking-[0.18em] uppercase">
          {copy.runtimeMetricsEyebrow}
        </p>
        <h3 className="font-display text-3xl leading-none">
          {copy.runtimeMetricsTitle}
        </h3>
        <p className="text-muted-foreground font-sans text-sm font-bold">
          {copy.runtimeMetricsDescription}
        </p>
      </div>

      <div className="space-y-3">
        <div className="border-2 border-black bg-stone-200 px-4 py-3 dark:bg-stone-800">
          <p className="font-sans text-xs font-bold tracking-[0.18em] uppercase">
            {copy.runtimeMetricsCpuLabel}
          </p>
          <p className="font-display mt-2 text-3xl leading-none">
            {metrics.cpuEstimatePercent === null
              ? copy.runtimeTelemetryUnavailable
              : `%${metrics.cpuEstimatePercent}`}
          </p>
          <p className="mt-2 font-sans text-xs font-bold text-stone-600 dark:text-stone-400">
            {copy.runtimeMetricsCpuHint.replace(
              "{cores}",
              metrics.hardwareConcurrency === null
                ? copy.runtimeTelemetryUnavailable
                : String(metrics.hardwareConcurrency),
            )}
          </p>
        </div>

        <div className="border-2 border-black bg-stone-200 px-4 py-3 dark:bg-stone-800">
          <p className="font-sans text-xs font-bold tracking-[0.18em] uppercase">
            {copy.runtimeMetricsMemoryLabel}
          </p>
          <p className="font-display mt-2 text-3xl leading-none">
            {formatBytes(metrics.jsHeapUsedBytes, copy.runtimeTelemetryUnavailable)}
          </p>
          <p className="mt-2 font-sans text-xs font-bold text-stone-600 dark:text-stone-400">
            {copy.runtimeMetricsMemoryHint.replace(
              "{limit}",
              formatBytes(metrics.jsHeapLimitBytes, copy.runtimeTelemetryUnavailable),
            )}
          </p>
        </div>

        <div className="border-2 border-black bg-stone-200 px-4 py-3 dark:bg-stone-800">
          <p className="font-sans text-xs font-bold tracking-[0.18em] uppercase">
            {copy.runtimeMetricsStorageLabel}
          </p>
          <p className="font-display mt-2 text-3xl leading-none">
            {formatBytes(metrics.storageUsageBytes, copy.runtimeTelemetryUnavailable)}
          </p>
          <p className="mt-2 font-sans text-xs font-bold text-stone-600 dark:text-stone-400">
            {copy.runtimeMetricsStorageHint.replace(
              "{quota}",
              formatBytes(metrics.storageQuotaBytes, copy.runtimeTelemetryUnavailable),
            )}
          </p>
        </div>
      </div>

      <p className="text-muted-foreground font-sans text-xs font-bold">
        {copy.runtimeMetricsUpdatedAt.replace("{time}", metrics.updatedAtLabel)}
      </p>
    </DashboardPanel>
  );
}

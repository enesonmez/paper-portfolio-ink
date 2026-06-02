import { RefreshCcw } from "lucide-react";
import { Form, useNavigation } from "react-router";

import { DashboardPanel } from "~/components/dashboard/panel";
import { Button } from "~/components/ui/button";

import { useDashboardSettingsCopy } from "../copy";
import { SETTINGS_MUTATION_FORM_FIELD, SETTINGS_MUTATION_INTENT } from "../contracts";
import type { DashboardSettingsRuntimeCacheEntry } from "../runtime/state";

function resolveRuntimeEntryValue(
  entry: DashboardSettingsRuntimeCacheEntry,
  runtimeCopy: ReturnType<typeof useDashboardSettingsCopy>,
) {
  switch (entry.valueKind) {
    case "keys":
      return runtimeCopy.runtimeValueKeys.replace("{count}", String(entry.value));
    case "locales":
      return runtimeCopy.runtimeValueLocales.replace("{count}", String(entry.value));
    case "page":
      return runtimeCopy.runtimeValuePage.replace("{count}", String(entry.value));
    case "revision":
      return runtimeCopy.runtimeValueRevision.replace("{count}", String(entry.value));
  }
}

export function DashboardSettingsRuntimeCards({
  cacheEntries,
}: {
  cacheEntries: readonly DashboardSettingsRuntimeCacheEntry[];
}) {
  const copy = useDashboardSettingsCopy();
  const navigation = useNavigation();

  return (
    <div className="col-span-2 space-y-6">
      {cacheEntries.map((entry) => {
        const isPending =
          navigation.state !== "idle" &&
          navigation.formData?.get(SETTINGS_MUTATION_FORM_FIELD.intent) ===
            SETTINGS_MUTATION_INTENT.refreshRuntimeCache &&
          navigation.formData?.get(SETTINGS_MUTATION_FORM_FIELD.cacheId) === entry.id;

        const entryCopy = copy.runtimeCacheEntries[entry.id];

        return (
          <DashboardPanel key={entry.id} className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <p className="text-muted-foreground font-sans text-xs font-bold tracking-[0.18em] uppercase">
                  {entryCopy.eyebrow}
                </p>
                <h3 className="font-display text-3xl leading-none">
                  {entryCopy.title}
                </h3>
                <p className="text-muted-foreground font-sans text-sm font-bold">
                  {entryCopy.description}
                </p>
              </div>

              <Form method="post">
                <input
                  type="hidden"
                  name={SETTINGS_MUTATION_FORM_FIELD.intent}
                  value={SETTINGS_MUTATION_INTENT.refreshRuntimeCache}
                />
                <input
                  type="hidden"
                  name={SETTINGS_MUTATION_FORM_FIELD.cacheId}
                  value={entry.id}
                />
                <Button
                  type="submit"
                  className="w-full min-w-44 font-sans font-bold lg:w-auto"
                  disabled={isPending}
                >
                  <RefreshCcw className="size-4" aria-hidden="true" />
                  {isPending ? copy.runtimeRefreshPending : copy.runtimeRefreshAction}
                </Button>
              </Form>
            </div>

            <div className="grid gap-4 border-t-2 border-black pt-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="font-sans text-xs font-bold tracking-[0.18em] uppercase">
                  {copy.runtimeCacheKeyLabel}
                </p>
                <p className="font-sans text-sm font-bold break-all">
                  {entry.cacheKey}
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-sans text-xs font-bold tracking-[0.18em] uppercase">
                  {copy.runtimeCacheValueLabel}
                </p>
                <p className="font-sans text-sm font-bold">
                  {resolveRuntimeEntryValue(entry, copy)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-sans text-xs font-bold tracking-[0.18em] uppercase">
                  {copy.runtimeCacheScopeLabel}
                </p>
                <p className="font-sans text-sm font-bold">
                  {copy.runtimeScopeLabels[entry.scope]}
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-sans text-xs font-bold tracking-[0.18em] uppercase">
                  {copy.runtimeCacheStrategyLabel}
                </p>
                <p className="font-sans text-sm font-bold">
                  {copy.runtimeStrategyLabels[entry.strategy]}
                </p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="font-sans text-xs font-bold tracking-[0.18em] uppercase">
                  {copy.runtimeWarmScopeLabel}
                </p>
                <p className="font-sans text-sm font-bold">
                  {copy.runtimeScopeLabels[entry.warmScope]}
                </p>
              </div>
            </div>
          </DashboardPanel>
        );
      })}
    </div>
  );
}

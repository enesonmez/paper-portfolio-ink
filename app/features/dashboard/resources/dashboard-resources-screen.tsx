import { Form, Link } from "react-router";
import { Globe, Languages, Plus, Search, TableProperties } from "lucide-react";

import { DashboardMetricCard } from "~/components/dashboard/metric-card";
import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardSectionHeading } from "~/components/dashboard/section-heading";
import { Button } from "~/components/ui/button";
import { TextField } from "~/components/ui/form-field";
import { useLocalizedPath, useT } from "~/shared/i18n/i18n-react";
import {
  DASHBOARD_RESOURCES_MODAL,
  DASHBOARD_RESOURCES_QUERY_PARAM,
  DASHBOARD_RESOURCES_TAB,
} from "~/features/resources/resource.shared";
import type {
  LocaleResourceRecord,
  TranslationResourceRecord,
} from "~/lib/resources/resources.server";

import { useDashboardResourcesCopy } from "./dashboard-resources.constants";
import {
  buildDashboardResourcesHref,
  buildDashboardResourcesTranslationsHref,
  type DashboardResourcesLocaleFormState,
  type DashboardResourcesMetrics,
  type DashboardResourcesTranslationPagination,
  type DashboardResourcesTranslationFormState,
} from "./dashboard-resources.shared";
import { DashboardResourcesLocaleModal } from "./components/dashboard-resources-locale-modal";
import { DashboardResourcesLocalesTable } from "./components/dashboard-resources-locales-table";
import { DashboardResourcesTranslationModal } from "./components/dashboard-resources-translation-modal";
import { DashboardResourcesTranslationsTable } from "./components/dashboard-resources-translations-table";

interface DashboardResourcesScreenProps {
  actionError?: string;
  activeTab: "locales" | "translations";
  localeForm: DashboardResourcesLocaleFormState;
  locales: LocaleResourceRecord[];
  metrics: DashboardResourcesMetrics;
  selectedTranslationLocale: string;
  translationPagination: DashboardResourcesTranslationPagination;
  translationSearchQuery: string;
  translationForm: DashboardResourcesTranslationFormState;
  translations: TranslationResourceRecord[];
}

export function DashboardResourcesScreen({
  actionError,
  activeTab,
  localeForm,
  locales,
  metrics,
  selectedTranslationLocale,
  translationPagination,
  translationSearchQuery,
  translationForm,
  translations,
}: DashboardResourcesScreenProps) {
  const to = useLocalizedPath();
  const t = useT();
  const { copy, formCopy } = useDashboardResourcesCopy();
  const isLocalesTab = activeTab === DASHBOARD_RESOURCES_TAB.locales;
  const translationsViewState = {
    translationLocale: selectedTranslationLocale,
    translationPage: translationPagination.currentPage,
    translationSearch: translationSearchQuery,
  } as const;

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <DashboardMetricCard
          label={t("dashboard.resources.metricTotalLocales")}
          value={String(metrics.totalLocales)}
        />
        <DashboardMetricCard
          label={t("dashboard.resources.metricActiveLocales")}
          value={String(metrics.activeLocales)}
        />
        <DashboardMetricCard
          label={t("dashboard.resources.metricTotalTranslations")}
          value={String(metrics.totalTranslations)}
        />
        <DashboardMetricCard
          label={t("dashboard.resources.metricSelectedLocaleTranslations")}
          value={String(metrics.selectedLocaleTranslations)}
        />
      </section>

      <DashboardPanel className="space-y-5">
        <div className="space-y-2">
          <p className="text-muted-foreground font-sans text-xs font-bold tracking-[0.18em] uppercase">
            {copy.cacheEyebrow}
          </p>
          <p className="font-sans text-sm font-bold">{copy.cacheDescription}</p>
          <p className="text-muted-foreground font-sans text-xs font-bold">
            {copy.tabDescription}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Button
            asChild
            variant={isLocalesTab ? "default" : "secondary"}
            className="justify-between"
          >
            <Link
              to={to(
                buildDashboardResourcesHref({
                  tab: DASHBOARD_RESOURCES_TAB.locales,
                  ...translationsViewState,
                }),
              )}
            >
              <span className="flex items-center gap-2">
                <Globe className="size-4" aria-hidden="true" />
                {copy.localeTabLabel}
              </span>
              <span>{metrics.totalLocales}</span>
            </Link>
          </Button>
          <Button
            asChild
            variant={!isLocalesTab ? "default" : "secondary"}
            className="justify-between"
          >
            <Link
              to={to(buildDashboardResourcesTranslationsHref(translationsViewState))}
            >
              <span className="flex items-center gap-2">
                <TableProperties className="size-4" aria-hidden="true" />
                {copy.translationTabLabel}
              </span>
              <span>{metrics.selectedLocaleTranslations}</span>
            </Link>
          </Button>
        </div>
      </DashboardPanel>

      {actionError ? (
        <DashboardPanel className="bg-destructive text-destructive-foreground">
          <p className="font-sans text-sm font-bold" role="alert">
            {actionError}
          </p>
        </DashboardPanel>
      ) : null}

      <section className="space-y-4">
        <DashboardSectionHeading
          action={
            isLocalesTab ? (
              <Button
                asChild
                className="hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              >
                <Link
                  to={to(
                    buildDashboardResourcesHref({
                      modal: DASHBOARD_RESOURCES_MODAL.createLocale,
                      tab: DASHBOARD_RESOURCES_TAB.locales,
                      ...translationsViewState,
                    }),
                  )}
                >
                  <Plus className="size-4" aria-hidden="true" />
                  {copy.createLocaleActionLabel}
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                className="hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              >
                <Link
                  to={to(
                    buildDashboardResourcesTranslationsHref(translationsViewState, {
                      modal: DASHBOARD_RESOURCES_MODAL.createTranslation,
                    }),
                  )}
                >
                  <Plus className="size-4" aria-hidden="true" />
                  {copy.createTranslationActionLabel}
                </Link>
              </Button>
            )
          }
          eyebrow={
            isLocalesTab
              ? copy.localeInventoryEyebrow
              : copy.translationInventoryEyebrow
          }
          title={copy.registryTitle}
        />

        {isLocalesTab ? (
          <DashboardResourcesLocalesTable locales={locales} />
        ) : (
          <div className="space-y-4">
            <DashboardPanel className="space-y-3">
              <div className="flex items-center gap-2">
                <Languages className="size-4" aria-hidden="true" />
                <p className="font-sans text-xs font-bold tracking-[0.18em] uppercase">
                  {copy.localeFilterTitle}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {locales.map((localeRow) => (
                  <Button
                    key={localeRow.code}
                    asChild
                    size="sm"
                    variant={
                      localeRow.code === selectedTranslationLocale
                        ? "default"
                        : "secondary"
                    }
                  >
                    <Link
                      to={to(
                        buildDashboardResourcesTranslationsHref({
                          translationLocale: localeRow.code,
                          translationPage: null,
                          translationSearch: "",
                        }),
                      )}
                    >
                      {localeRow.code.toUpperCase()}
                    </Link>
                  </Button>
                ))}
              </div>
            </DashboardPanel>

            <DashboardPanel className="space-y-4">
              <div className="flex items-center gap-2">
                <Search className="size-4" aria-hidden="true" />
                <p className="font-sans text-xs font-bold tracking-[0.18em] uppercase">
                  {copy.searchTitle}
                </p>
              </div>
              <Form
                method="get"
                className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]"
              >
                <input
                  type="hidden"
                  name={DASHBOARD_RESOURCES_QUERY_PARAM.tab}
                  value={DASHBOARD_RESOURCES_TAB.translations}
                />
                <input
                  type="hidden"
                  name={DASHBOARD_RESOURCES_QUERY_PARAM.translationLocale}
                  value={selectedTranslationLocale}
                />
                <TextField
                  defaultValue={translationSearchQuery}
                  label={formCopy.translation.search.label}
                  name={DASHBOARD_RESOURCES_QUERY_PARAM.translationSearch}
                  placeholder={formCopy.translation.search.placeholder}
                />
                <Button type="submit" className="self-end">
                  <Search className="size-4" aria-hidden="true" />
                  {formCopy.translation.search.label}
                </Button>
                <Button asChild variant="secondary" className="self-end">
                  <Link
                    to={to(
                      buildDashboardResourcesTranslationsHref({
                        ...translationsViewState,
                        translationPage: null,
                        translationSearch: "",
                      }),
                    )}
                  >
                    {copy.clearSearchLabel}
                  </Link>
                </Button>
              </Form>
            </DashboardPanel>

            <DashboardResourcesTranslationsTable
              emptyState={translationSearchQuery ? copy.searchEmptyState : undefined}
              pagination={translationPagination}
              paginationNextLabel={copy.paginationNextLabel}
              paginationPreviousLabel={copy.paginationPreviousLabel}
              selectedTranslationLocale={selectedTranslationLocale}
              translationPage={translationPagination.currentPage}
              translationSearchQuery={translationSearchQuery}
              translations={translations}
            />
          </div>
        )}
      </section>

      <DashboardResourcesLocaleModal form={localeForm} />
      <DashboardResourcesTranslationModal
        form={translationForm}
        locales={locales}
        selectedTranslationLocale={selectedTranslationLocale}
        translationPage={translationPagination.currentPage}
        translationSearchQuery={translationSearchQuery}
      />
    </div>
  );
}

export function DashboardResourcesAccessDeniedScreen({
  viewerRole,
}: {
  viewerRole: string;
}) {
  const t = useT();
  const { copy } = useDashboardResourcesCopy();

  return (
    <div className="space-y-4">
      <DashboardSectionHeading
        eyebrow={t("common.roleGuard")}
        title={copy.restrictedTitle}
      />
      <DashboardPanel className="space-y-3">
        <p className="font-sans text-sm font-bold">{copy.restrictedDescription}</p>
        <p className="text-muted-foreground font-sans text-xs font-bold tracking-[0.14em] uppercase">
          {copy.currentRoleLabel}: {viewerRole}
        </p>
      </DashboardPanel>
    </div>
  );
}

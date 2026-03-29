import type { ReactNode } from "react";
import { Link } from "react-router";
import { Globe, TableProperties } from "lucide-react";

import { DashboardAuthorizationAccessDeniedScreen } from "~/shared/authz/components/dashboard-authorization-access-denied-screen";
import { DashboardMetricCard } from "~/components/dashboard/metric-card";
import { DashboardPanel } from "~/components/dashboard/panel";
import { Button } from "~/components/ui/button";
import { useLocalizedPath } from "~/shared/i18n/i18n-react";

import { useDashboardResourcesCopy } from "../copy";
import {
  DASHBOARD_RESOURCES_SECTION,
  buildDashboardResourcesLocalesHref,
  buildDashboardResourcesTranslationsHref,
  type DashboardResourcesSection,
} from "../routing/href";
import type {
  DashboardResourcesMetrics,
  DashboardResourcesPermissions,
  DashboardResourcesTranslationPagination,
} from "../state";

interface DashboardResourcesLayoutProps {
  actionError?: string;
  children: ReactNode;
  currentSection: DashboardResourcesSection;
  metrics: DashboardResourcesMetrics;
  permissions: DashboardResourcesPermissions;
  selectedTranslationLocale: string;
  translationPagination: DashboardResourcesTranslationPagination;
  translationSearchQuery: string;
}

export function DashboardResourcesLayout({
  actionError,
  children,
  currentSection,
  metrics,
  permissions,
  selectedTranslationLocale,
  translationPagination,
  translationSearchQuery,
}: DashboardResourcesLayoutProps) {
  const to = useLocalizedPath();
  const { copy } = useDashboardResourcesCopy();

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <DashboardMetricCard
          label={copy.metricTotalLocales}
          value={String(metrics.totalLocales)}
        />
        <DashboardMetricCard
          label={copy.metricActiveLocales}
          value={String(metrics.activeLocales)}
        />
        <DashboardMetricCard
          label={copy.metricTotalTranslations}
          value={String(metrics.totalTranslations)}
        />
        <DashboardMetricCard
          label={copy.metricSelectedLocaleTranslations}
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
          {permissions.locales.canRead ? (
            <Button
              asChild
              variant={
                currentSection === DASHBOARD_RESOURCES_SECTION.locales
                  ? "default"
                  : "secondary"
              }
              className="justify-between"
            >
              <Link to={to(buildDashboardResourcesLocalesHref())}>
                <span className="flex items-center gap-2">
                  <Globe className="size-4" aria-hidden="true" />
                  {copy.localeTabLabel}
                </span>
                <span>{metrics.totalLocales}</span>
              </Link>
            </Button>
          ) : null}
          {permissions.translations.canRead ? (
            <Button
              asChild
              variant={
                currentSection === DASHBOARD_RESOURCES_SECTION.translations
                  ? "default"
                  : "secondary"
              }
              className="justify-between"
            >
              <Link
                to={to(
                  buildDashboardResourcesTranslationsHref({
                    translationLocale: selectedTranslationLocale,
                    translationPage: translationPagination.currentPage,
                    translationSearch: translationSearchQuery,
                  }),
                )}
              >
                <span className="flex items-center gap-2">
                  <TableProperties className="size-4" aria-hidden="true" />
                  {copy.translationTabLabel}
                </span>
                <span>{metrics.selectedLocaleTranslations}</span>
              </Link>
            </Button>
          ) : null}
        </div>
      </DashboardPanel>

      {actionError ? (
        <DashboardPanel className="bg-destructive text-destructive-foreground">
          <p className="font-sans text-sm font-bold" role="alert">
            {actionError}
          </p>
        </DashboardPanel>
      ) : null}

      {children}
    </div>
  );
}

export function DashboardResourcesAccessDeniedScreen({
  viewerRole,
}: {
  viewerRole: string;
}) {
  const { copy } = useDashboardResourcesCopy();

  return (
    <DashboardAuthorizationAccessDeniedScreen
      currentRoleLabel={copy.currentRoleLabel}
      description={copy.restrictedDescription}
      title={copy.restrictedTitle}
      viewerRole={viewerRole}
    />
  );
}

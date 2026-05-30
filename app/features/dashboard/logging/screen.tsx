import { Link } from "react-router";

import { DashboardAuthorizationAccessDeniedScreen } from "~/shared/authz/components/dashboard-authorization-access-denied-screen";
import { DashboardMetricCard } from "~/components/dashboard/metric-card";
import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardPaginationControls } from "~/components/dashboard/pagination-controls";
import { DataTable, type DataTableColumn } from "~/components/ui/data-table";
import { Button } from "~/components/ui/button";
import { useLocalizedPath } from "~/shared/i18n/i18n-react";
import {
  LOGGING_MUTATION_INTENT,
  LOGGING_PAGINATION_DIRECTION,
} from "~/domain/logging/model";

import { LocalDateTime } from "~/components/ui/local-date-time";
import { DashboardLoggingRangeForm } from "./components/range-form";
import {
  buildDashboardLoggingHref,
  DASHBOARD_LOGGING_TAB,
  type DashboardLoggingRangeFormState,
  type DashboardLoggingLoaderData,
} from "./state";
import { useDashboardLoggingCopy } from "./copy";

export interface DashboardLoggingScreenProps {
  loaderData: Extract<DashboardLoggingLoaderData, { access: "granted" }>;
  notice?: string;
  rangeForm: DashboardLoggingRangeFormState;
}

export function DashboardLoggingScreen({
  loaderData,
  notice,
  rangeForm,
}: DashboardLoggingScreenProps) {
  const to = useLocalizedPath();
  const { copy, labels } = useDashboardLoggingCopy();
  const isHistoryTab = loaderData.selectedTab === DASHBOARD_LOGGING_TAB.history;
  const currentPagination = isHistoryTab
    ? loaderData.pagination.history
    : loaderData.pagination.errors;
  const exportIntent = isHistoryTab
    ? LOGGING_MUTATION_INTENT.exportHistory
    : LOGGING_MUTATION_INTENT.exportErrors;
  const deleteIntent = isHistoryTab
    ? LOGGING_MUTATION_INTENT.deleteHistory
    : LOGGING_MUTATION_INTENT.deleteErrors;
  const canExportCurrentTab = isHistoryTab
    ? loaderData.permissions.canExportHistory
    : loaderData.permissions.canExportErrors;
  const visibleTabs = [
    loaderData.permissions.canReadHistory
      ? {
          label: copy.historyTab,
          tab: DASHBOARD_LOGGING_TAB.history,
          total: loaderData.totals.history,
        }
      : null,
    loaderData.permissions.canReadErrors
      ? {
          label: copy.systemTab,
          tab: DASHBOARD_LOGGING_TAB.errors,
          total: loaderData.totals.errors,
        }
      : null,
  ].filter(
    (
      value,
    ): value is {
      label: string;
      tab: (typeof DASHBOARD_LOGGING_TAB)[keyof typeof DASHBOARD_LOGGING_TAB];
      total: number;
    } => value !== null,
  );
  const historyColumns: DataTableColumn<(typeof loaderData.entries.history)[number]>[] =
    [
      {
        header: labels.createdAt,
        id: "createdAt",
        render: (row) => <LocalDateTime value={row.createdAt} />,
      },
      { header: labels.resource, id: "resource", render: (row) => row.resource },
      { header: labels.action, id: "action", render: (row) => row.action },
      { header: labels.result, id: "result", render: (row) => row.result },
      {
        header: labels.statusCode,
        id: "statusCode",
        render: (row) => String(row.statusCode),
      },
      { header: labels.message, id: "message", render: (row) => row.message },
      { header: labels.method, id: "method", render: (row) => row.method },
      { header: labels.path, id: "path", render: (row) => row.path },
      {
        header: labels.requestId,
        id: "requestId",
        render: (row) => row.requestId,
      },
      {
        header: labels.user,
        id: "user",
        render: (row) => row.userRole ?? row.userId ?? "-",
      },
      {
        header: labels.target,
        id: "target",
        render: (row) => row.targetLabel ?? row.targetId ?? "-",
      },
    ];
  const errorColumns: DataTableColumn<(typeof loaderData.entries.errors)[number]>[] = [
    {
      header: labels.createdAt,
      id: "createdAt",
      render: (row) => <LocalDateTime value={row.createdAt} />,
    },
    { header: labels.severity, id: "severity", render: (row) => row.severity },
    { header: labels.category, id: "category", render: (row) => row.category },
    { header: labels.code, id: "code", render: (row) => row.code },
    {
      header: labels.statusCode,
      id: "statusCode",
      render: (row) => String(row.statusCode),
    },
    { header: labels.message, id: "message", render: (row) => row.message },
    { header: labels.method, id: "method", render: (row) => row.method },
    { header: labels.requestId, id: "requestId", render: (row) => row.requestId },
    { header: labels.path, id: "path", render: (row) => row.path },
    {
      header: labels.user,
      id: "user",
      render: (row) => row.userRole ?? row.userId ?? "-",
    },
    {
      header: labels.locale,
      id: "locale",
      render: (row) => row.locale ?? "-",
    },
    {
      header: labels.fingerprint,
      id: "fingerprint",
      render: (row) => row.fingerprint,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {loaderData.permissions.canReadHistory ? (
          <DashboardMetricCard
            label={copy.metricsHistory}
            value={String(loaderData.totals.history)}
          />
        ) : null}
        {loaderData.permissions.canReadErrors ? (
          <DashboardMetricCard
            label={copy.metricsErrors}
            value={String(loaderData.totals.errors)}
          />
        ) : null}
      </section>

      <DashboardPanel className="space-y-4">
        <p className="text-muted-foreground font-sans text-xs font-bold tracking-[0.18em] uppercase">
          {copy.pageEyebrow}
        </p>
        <h1 className="font-display text-4xl leading-none md:text-5xl">
          {copy.pageTitle}
        </h1>

        <div className="grid gap-3 md:grid-cols-2">
          {visibleTabs.map((tab) => (
            <Button
              key={tab.tab}
              asChild
              variant={loaderData.selectedTab === tab.tab ? "default" : "secondary"}
              className="justify-between"
            >
              <Link
                to={to(
                  buildDashboardLoggingHref({
                    tab: tab.tab,
                  }),
                )}
              >
                <span>{tab.label}</span>
                <span>{tab.total}</span>
              </Link>
            </Button>
          ))}
        </div>
      </DashboardPanel>

      {notice ? (
        <DashboardPanel>
          <p className="font-sans text-sm font-bold">{notice}</p>
        </DashboardPanel>
      ) : null}

      <div className="space-y-6">
        <DashboardPanel className="space-y-4">
          <h2 className="font-sans text-sm font-bold uppercase">
            {copy.rangeFormTitle}
          </h2>
          <DashboardLoggingRangeForm
            canDeleteCurrentTab={
              isHistoryTab
                ? loaderData.permissions.canDeleteHistory
                : loaderData.permissions.canDeleteErrors
            }
            canExportCurrentTab={canExportCurrentTab}
            deleteActionLabel={copy.deleteAction}
            deleteIntent={deleteIntent}
            endLabel={copy.filterEndLabel}
            errorMessage={rangeForm.errors?.form}
            exportAction={to("/dashboard/logging/export")}
            exportActionLabel={copy.exportAction}
            exportIntent={exportIntent}
            rangeForm={rangeForm}
            startLabel={copy.filterStartLabel}
          />
        </DashboardPanel>

        <DashboardPanel className="grid gap-4 md:grid-cols-2">
          <div>
            <h2 className="font-sans text-sm font-bold uppercase">
              {isHistoryTab ? copy.auditExportTitle : copy.errorExportTitle}
            </h2>
            <p className="text-muted-foreground mt-2 font-sans text-sm">
              {isHistoryTab ? copy.auditExportDescription : copy.errorExportDescription}
            </p>
          </div>
          <div>
            <h2 className="font-sans text-sm font-bold uppercase">
              {isHistoryTab ? copy.auditDeleteTitle : copy.errorDeleteTitle}
            </h2>
            <p className="text-muted-foreground mt-2 font-sans text-sm">
              {isHistoryTab ? copy.auditDeleteDescription : copy.errorDeleteDescription}
            </p>
          </div>
        </DashboardPanel>

        <DashboardPanel className="space-y-4 overflow-x-auto p-4">
          {isHistoryTab ? (
            <DataTable
              columns={historyColumns}
              emptyState={copy.emptyHistory}
              getRowKey={(row) => row.id}
              rows={loaderData.entries.history}
            />
          ) : (
            <DataTable
              columns={errorColumns}
              emptyState={copy.emptyErrors}
              getRowKey={(row) => row.id}
              rows={loaderData.entries.errors}
            />
          )}

          {currentPagination.hasNextPage || currentPagination.hasPreviousPage ? (
            <DashboardPaginationControls
              nextHref={
                currentPagination.hasNextPage && currentPagination.nextCursor
                  ? buildDashboardLoggingHref({
                      cursor: currentPagination.nextCursor,
                      direction: LOGGING_PAGINATION_DIRECTION.next,
                      tab: loaderData.selectedTab,
                    })
                  : null
              }
              nextLabel={copy.paginationNextLabel}
              previousHref={
                currentPagination.hasPreviousPage && currentPagination.previousCursor
                  ? buildDashboardLoggingHref({
                      cursor: currentPagination.previousCursor,
                      direction: LOGGING_PAGINATION_DIRECTION.previous,
                      tab: loaderData.selectedTab,
                    })
                  : null
              }
              previousLabel={copy.paginationPreviousLabel}
            />
          ) : null}
        </DashboardPanel>
      </div>
    </div>
  );
}

export function DashboardLoggingAccessDeniedScreen({
  viewerRole,
}: {
  viewerRole: string;
}) {
  const { copy } = useDashboardLoggingCopy();

  return (
    <DashboardAuthorizationAccessDeniedScreen
      currentRoleLabel={copy.currentRoleLabel}
      description={copy.restrictedDescription}
      title={copy.restrictedTitle}
      viewerRole={viewerRole}
    />
  );
}

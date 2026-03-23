import { Form, Link } from "react-router";

import { DashboardAuthorizationAccessDeniedScreen } from "~/shared/authz/components/dashboard-authorization-access-denied-screen";
import { DashboardMetricCard } from "~/components/dashboard/metric-card";
import { DashboardPanel } from "~/components/dashboard/panel";
import { DataTable, type DataTableColumn } from "~/components/ui/data-table";
import { Button } from "~/components/ui/button";
import { FormError, TextField } from "~/components/ui/form-field";
import { useLocalizedPath } from "~/shared/i18n/i18n-react";

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
  const historyColumns: DataTableColumn<(typeof loaderData.entries.history)[number]>[] =
    [
      {
        header: labels.createdAt,
        id: "createdAt",
        render: (row) => row.createdAt.toISOString(),
      },
      { header: labels.action, id: "action", render: (row) => row.action },
      { header: labels.result, id: "result", render: (row) => row.result },
      { header: labels.message, id: "message", render: (row) => row.message },
      { header: labels.path, id: "path", render: (row) => row.path },
      {
        header: labels.user,
        id: "user",
        render: (row) => row.userRole ?? row.userId ?? "-",
      },
    ];
  const errorColumns: DataTableColumn<(typeof loaderData.entries.errors)[number]>[] = [
    {
      header: labels.createdAt,
      id: "createdAt",
      render: (row) => row.createdAt.toISOString(),
    },
    { header: labels.severity, id: "severity", render: (row) => row.severity },
    { header: labels.code, id: "code", render: (row) => row.code },
    { header: labels.message, id: "message", render: (row) => row.message },
    { header: labels.requestId, id: "requestId", render: (row) => row.requestId },
    { header: labels.path, id: "path", render: (row) => row.path },
  ];

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DashboardMetricCard
          label={copy.metricsHistory}
          value={String(loaderData.totals.history)}
        />
        <DashboardMetricCard
          label={copy.metricsErrors}
          value={String(loaderData.totals.errors)}
        />
      </section>

      <DashboardPanel className="space-y-4">
        <p className="text-muted-foreground font-sans text-xs font-bold tracking-[0.18em] uppercase">
          {copy.pageEyebrow}
        </p>
        <h1 className="font-display text-4xl leading-none md:text-5xl">
          {copy.pageTitle}
        </h1>

        <div className="grid gap-3 md:grid-cols-2">
          <Button
            asChild
            variant={
              loaderData.selectedTab === DASHBOARD_LOGGING_TAB.history
                ? "default"
                : "secondary"
            }
            className="justify-between"
          >
            <Link to={to(buildDashboardLoggingHref(DASHBOARD_LOGGING_TAB.history))}>
              <span>{copy.historyTab}</span>
              <span>{loaderData.totals.history}</span>
            </Link>
          </Button>
          <Button
            asChild
            variant={
              loaderData.selectedTab === DASHBOARD_LOGGING_TAB.errors
                ? "default"
                : "secondary"
            }
            className="justify-between"
          >
            <Link to={to(buildDashboardLoggingHref(DASHBOARD_LOGGING_TAB.errors))}>
              <span>{copy.systemTab}</span>
              <span>{loaderData.totals.errors}</span>
            </Link>
          </Button>
        </div>
      </DashboardPanel>

      {notice ? (
        <DashboardPanel>
          <p className="font-sans text-sm font-bold">{notice}</p>
        </DashboardPanel>
      ) : null}

      {loaderData.selectedTab === DASHBOARD_LOGGING_TAB.history ? (
        <DashboardPanel className="overflow-x-auto p-0">
          <DataTable
            columns={historyColumns}
            emptyState={copy.emptyHistory}
            getRowKey={(row) => row.id}
            rows={loaderData.entries.history}
          />
        </DashboardPanel>
      ) : (
        <div className="space-y-6">
          <DashboardPanel className="space-y-4">
            <h2 className="font-sans text-sm font-bold uppercase">
              {copy.rangeFormTitle}
            </h2>
            <Form method="post" className="grid gap-4 md:grid-cols-2">
              <TextField
                label={copy.filterStartLabel}
                name="startAt"
                type="datetime-local"
                defaultValue={rangeForm.values.startAt}
                error={rangeForm.errors?.startAt}
              />
              <TextField
                label={copy.filterEndLabel}
                name="endAt"
                type="datetime-local"
                defaultValue={rangeForm.values.endAt}
                error={rangeForm.errors?.endAt}
              />
              <div className="md:col-span-2">
                <FormError message={rangeForm.errors?.form} />
              </div>
              <div className="flex flex-wrap gap-3 md:col-span-2">
                {loaderData.permissions.canExport ? (
                  <Button type="submit" name="intent" value="export-errors">
                    {copy.exportAction}
                  </Button>
                ) : null}
                {loaderData.permissions.canDelete ? (
                  <Button
                    type="submit"
                    variant="destructive"
                    name="intent"
                    value="delete-errors"
                  >
                    {copy.deleteAction}
                  </Button>
                ) : null}
              </div>
            </Form>
          </DashboardPanel>

          <DashboardPanel className="grid gap-4 md:grid-cols-2">
            <div>
              <h2 className="font-sans text-sm font-bold uppercase">
                {copy.exportTitle}
              </h2>
              <p className="text-muted-foreground mt-2 font-sans text-sm">
                {copy.exportDescription}
              </p>
            </div>
            <div>
              <h2 className="font-sans text-sm font-bold uppercase">
                {copy.deleteTitle}
              </h2>
              <p className="text-muted-foreground mt-2 font-sans text-sm">
                {copy.deleteDescription}
              </p>
            </div>
          </DashboardPanel>

          <DashboardPanel className="overflow-x-auto p-0">
            <DataTable
              columns={errorColumns}
              emptyState={copy.emptyErrors}
              getRowKey={(row) => row.id}
              rows={loaderData.entries.errors}
            />
          </DashboardPanel>
        </div>
      )}
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

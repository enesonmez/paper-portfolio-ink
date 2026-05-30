import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Form, Link, useSubmit } from "react-router";

import { ConfirmModal } from "~/components/dashboard/confirm-modal";

import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardStatusBadge } from "~/components/dashboard/status-badge";
import { Button } from "~/components/ui/button";
import { DataTable, type DataTableColumn } from "~/components/ui/data-table";
import { useLocalizedPath, useT } from "~/shared/i18n/i18n-react";
import {
  RESOURCE_FORM_FIELD,
  RESOURCE_MUTATION_INTENT,
} from "~/domain/resources/contract";
import type { LocaleResourceRecord } from "~/lib/resources/resources.server";

import {
  DASHBOARD_RESOURCES_MODAL,
  buildDashboardResourcesLocalesHref,
} from "../../routing/href";

export function DashboardResourcesLocalesTable({
  canDelete,
  canUpdate,
  locales,
}: {
  canDelete: boolean;
  canUpdate: boolean;
  locales: LocaleResourceRecord[];
}) {
  const [confirmingLocaleCode, setConfirmingLocaleCode] = useState<string | null>(null);
  const submit = useSubmit();
  const to = useLocalizedPath();
  const t = useT();
  const canManageLocaleRows = canUpdate || canDelete;
  const columns: DataTableColumn<LocaleResourceRecord>[] = [
    {
      cellClassName: "align-top",
      header: t("dashboard.resources.tableLocaleCodeLabel"),
      id: "code",
      render: (localeRow) => (
        <div className="space-y-2">
          <p className="font-display text-3xl leading-none uppercase">
            {localeRow.code}
          </p>
          <p className="text-muted-foreground font-sans text-xs font-bold tracking-[0.16em] uppercase">
            {localeRow.label}
          </p>
        </div>
      ),
    },
    {
      cellClassName: "align-top",
      header: t("dashboard.resources.tableLocaleStatusLabel"),
      id: "status",
      render: (localeRow) => (
        <div className="flex flex-wrap gap-2">
          <DashboardStatusBadge
            label={localeRow.isActive ? t("common.active") : t("common.inactive")}
            tone={localeRow.isActive ? "success" : "danger"}
          />
          {localeRow.isDefault ? (
            <DashboardStatusBadge
              label={t("dashboard.resources.defaultBadge")}
              tone="warning"
            />
          ) : null}
        </div>
      ),
    },
    {
      cellClassName: "align-top",
      header: t("dashboard.resources.tableLocaleMetaLabel"),
      id: "meta",
      render: (localeRow) => (
        <div className="text-muted-foreground space-y-2 font-sans text-[11px] font-bold tracking-[0.14em] uppercase">
          <p>{`${t("dashboard.resources.tableSortPrefix")} ${localeRow.sortOrder}`}</p>
          <p>{`${t("dashboard.resources.tableTranslationsPrefix")} ${localeRow.translationCount}`}</p>
          <p>{`${t("dashboard.resources.tableUpdatedPrefix")} ${localeRow.updatedAtLabel}`}</p>
        </div>
      ),
    },
  ];

  if (canManageLocaleRows) {
    columns.push({
      cellClassName: "align-top",
      header: t("dashboard.resources.tableActionsLabel"),
      headerClassName: "text-right",
      id: "actions",
      render: (localeRow) => (
        <div className="flex justify-end gap-2">
          {canUpdate ? (
            <Button
              asChild
              size="iconSm"
              className="hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              aria-label={`${t("common.edit")} ${localeRow.code}`}
            >
              <Link
                to={to(
                  buildDashboardResourcesLocalesHref({
                    editLocaleCode: localeRow.code,
                    modal: DASHBOARD_RESOURCES_MODAL.editLocale,
                  }),
                )}
              >
                <Pencil className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          ) : null}
          {canDelete ? (
            <Form
              id={`delete-locale-form-${localeRow.code}`}
              method="post"
              onSubmit={(e) => {
                e.preventDefault();
                setConfirmingLocaleCode(localeRow.code);
              }}
            >
              <input
                type="hidden"
                name={RESOURCE_FORM_FIELD.intent}
                value={RESOURCE_MUTATION_INTENT.deleteLocale}
              />
              <input
                type="hidden"
                name={RESOURCE_FORM_FIELD.originalCode}
                value={localeRow.code}
              />
              <Button
                type="submit"
                variant="destructive"
                size="iconSm"
                className="cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                aria-label={`${t("common.delete")} ${localeRow.code}`}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </Form>
          ) : null}
        </div>
      ),
    });
  }

  return (
    <DashboardPanel className="overflow-x-auto p-0">
      <DataTable
        bodyClassName="font-sans"
        columns={columns}
        emptyState={t("dashboard.resources.emptyLocales")}
        getRowKey={(localeRow) => localeRow.code}
        rows={locales}
      />

      <ConfirmModal
        isOpen={confirmingLocaleCode !== null}
        title={t("common.confirmDeleteTitle")}
        description={t("common.confirmDeleteDescription")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        onConfirm={() => {
          if (confirmingLocaleCode) {
            const form = document.getElementById(
              `delete-locale-form-${confirmingLocaleCode}`,
            ) as HTMLFormElement | null;
            if (form) {
              void submit(new FormData(form), { method: "post" });
            }
          }
          setConfirmingLocaleCode(null);
        }}
        onCancel={() => setConfirmingLocaleCode(null)}
        variant="destructive"
      />
    </DashboardPanel>
  );
}

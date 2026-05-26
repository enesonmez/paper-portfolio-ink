import { Pencil, Trash2 } from "lucide-react";
import { Form, Link } from "react-router";

import { DashboardPaginationControls } from "~/components/dashboard/pagination-controls";
import { DashboardPanel } from "~/components/dashboard/panel";
import { Button } from "~/components/ui/button";
import { DataTable, type DataTableColumn } from "~/components/ui/data-table";
import { useLocalizedPath, useT } from "~/shared/i18n/i18n-react";
import {
  RESOURCE_FORM_FIELD,
  RESOURCE_MUTATION_INTENT,
} from "~/domain/resources/contract";
import type { TranslationResourceRecord } from "~/lib/resources/resources.server";

import {
  DASHBOARD_RESOURCES_MODAL,
  buildDashboardResourcesTranslationsHref,
} from "../../routing/href";
import type { DashboardResourcesTranslationPagination } from "../../state";

function buildValuePreview(value: string) {
  return value.length > 100 ? `${value.slice(0, 100)}...` : value;
}

export function DashboardResourcesTranslationsTable({
  canDelete,
  canUpdate,
  emptyState,
  pagination,
  paginationNextLabel,
  paginationPreviousLabel,
  selectedTranslationLocale,
  translationCursor,
  translationDirection,
  translationSearchQuery,
  translations,
}: {
  canDelete: boolean;
  canUpdate: boolean;
  emptyState?: string;
  pagination: DashboardResourcesTranslationPagination;
  paginationNextLabel: string;
  paginationPreviousLabel: string;
  selectedTranslationLocale: string;
  translationCursor: string | null;
  translationDirection: "next" | "previous";
  translationSearchQuery: string;
  translations: TranslationResourceRecord[];
}) {
  const to = useLocalizedPath();
  const t = useT();
  const canManageTranslations = canUpdate || canDelete;
  const translationsViewState = {
    translationCursor,
    translationDirection,
    translationLocale: selectedTranslationLocale,
    translationSearch: translationSearchQuery,
  } as const;
  const hasPreviousPage = pagination.hasPreviousPage;
  const hasNextPage = pagination.hasNextPage;
  const columns: DataTableColumn<TranslationResourceRecord>[] = [
    {
      cellClassName: "align-top",
      header: t("dashboard.resources.tableTranslationKeyLabel"),
      id: "key",
      render: (translationRow) => (
        <div className="space-y-2">
          <p className="font-display text-3xl leading-none">{translationRow.key}</p>
          <p className="text-muted-foreground font-sans text-xs font-bold tracking-[0.16em] uppercase">
            {translationRow.locale}
          </p>
        </div>
      ),
    },
    {
      cellClassName: "align-top",
      header: t("dashboard.resources.tableTranslationValueLabel"),
      id: "value",
      render: (translationRow) => (
        <p className="font-sans text-sm font-bold wrap-break-word">
          {buildValuePreview(translationRow.value)}
        </p>
      ),
    },
    {
      cellClassName: "align-top",
      header: t("dashboard.resources.tableTranslationUpdatedLabel"),
      id: "updatedAt",
      render: (translationRow) => (
        <div className="text-muted-foreground space-y-2 font-sans text-[11px] font-bold tracking-[0.14em] uppercase">
          <p>{`${t("dashboard.resources.tableCreatedPrefix")} ${translationRow.createdAtLabel}`}</p>
          <p>{`${t("dashboard.resources.tableUpdatedPrefix")} ${translationRow.updatedAtLabel}`}</p>
        </div>
      ),
    },
  ];

  if (canManageTranslations) {
    columns.push({
      cellClassName: "align-top",
      header: t("dashboard.resources.tableActionsLabel"),
      headerClassName: "text-right",
      id: "actions",
      render: (translationRow) => (
        <div className="flex justify-end gap-2">
          {canUpdate ? (
            <Button
              asChild
              size="iconSm"
              className="hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              aria-label={`${t("common.edit")} ${translationRow.key}`}
            >
              <Link
                to={to(
                  buildDashboardResourcesTranslationsHref(translationsViewState, {
                    editTranslationKey: translationRow.key,
                    editTranslationLocale: translationRow.locale,
                    modal: DASHBOARD_RESOURCES_MODAL.editTranslation,
                  }),
                )}
              >
                <Pencil className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          ) : null}
          {canDelete ? (
            <Form method="post">
              <input
                type="hidden"
                name={RESOURCE_FORM_FIELD.intent}
                value={RESOURCE_MUTATION_INTENT.deleteTranslation}
              />
              <input
                type="hidden"
                name={RESOURCE_FORM_FIELD.originalLocale}
                value={translationRow.locale}
              />
              <input
                type="hidden"
                name={RESOURCE_FORM_FIELD.originalKey}
                value={translationRow.key}
              />
              <Button
                type="submit"
                variant="destructive"
                size="iconSm"
                className="cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                aria-label={`${t("common.delete")} ${translationRow.key}`}
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
    <DashboardPanel className="space-y-4 overflow-x-auto p-4">
      <DataTable
        bodyClassName="font-sans"
        columns={columns}
        emptyState={emptyState ?? t("dashboard.resources.emptyTranslations")}
        getRowKey={(translationRow) =>
          `${selectedTranslationLocale}:${translationRow.key}`
        }
        rows={translations}
      />

      {pagination.totalItems > 0 ? (
        <DashboardPaginationControls
          align="between"
          nextHref={
            hasNextPage
              ? buildDashboardResourcesTranslationsHref({
                  ...translationsViewState,
                  translationCursor: pagination.nextCursor,
                  translationDirection: "next",
                })
              : null
          }
          nextLabel={paginationNextLabel}
          previousHref={
            hasPreviousPage
              ? buildDashboardResourcesTranslationsHref({
                  ...translationsViewState,
                  translationCursor: pagination.previousCursor,
                  translationDirection: "previous",
                })
              : null
          }
          previousLabel={paginationPreviousLabel}
          summary={`${translations.length} / ${pagination.totalItems}`}
        />
      ) : null}
    </DashboardPanel>
  );
}

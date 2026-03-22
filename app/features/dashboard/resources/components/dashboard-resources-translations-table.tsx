import { Pencil, Trash2 } from "lucide-react";
import { Form, Link } from "react-router";

import { DashboardPanel } from "~/components/dashboard/panel";
import { Button } from "~/components/ui/button";
import { DataTable, type DataTableColumn } from "~/components/ui/data-table";
import { useLocalizedPath, useT } from "~/shared/i18n/i18n-react";
import {
  DASHBOARD_RESOURCES_MODAL,
  RESOURCE_FORM_FIELD,
  RESOURCE_MUTATION_INTENT,
} from "~/features/resources/resource.shared";
import type { TranslationResourceRecord } from "~/lib/resources/resources.server";

import { buildDashboardResourcesTranslationsHref } from "../dashboard-resources.shared";

function buildValuePreview(value: string) {
  return value.length > 100 ? `${value.slice(0, 100)}...` : value;
}

export function DashboardResourcesTranslationsTable({
  emptyState,
  pagination,
  selectedTranslationLocale,
  paginationNextLabel,
  paginationPreviousLabel,
  translationPage,
  translationSearchQuery,
  translations,
}: {
  emptyState?: string;
  pagination: {
    currentPage: number;
    pageCount: number;
    pageSize: number;
    totalItems: number;
  };
  paginationNextLabel: string;
  paginationPreviousLabel: string;
  selectedTranslationLocale: string;
  translationPage: number;
  translationSearchQuery: string;
  translations: TranslationResourceRecord[];
}) {
  const to = useLocalizedPath();
  const t = useT();
  const translationsViewState = {
    translationLocale: selectedTranslationLocale,
    translationPage,
    translationSearch: translationSearchQuery,
  } as const;
  const hasPreviousPage = pagination.currentPage > 1;
  const hasNextPage = pagination.currentPage < pagination.pageCount;
  const rangeStart =
    pagination.totalItems === 0
      ? 0
      : (pagination.currentPage - 1) * pagination.pageSize + 1;
  const rangeEnd =
    pagination.totalItems === 0 ? 0 : rangeStart + translations.length - 1;
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
        <p className="font-sans text-sm font-bold break-words">
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
    {
      cellClassName: "align-top",
      header: t("dashboard.resources.tableActionsLabel"),
      headerClassName: "text-right",
      id: "actions",
      render: (translationRow) => (
        <div className="flex justify-end gap-2">
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
        </div>
      ),
    },
  ];

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
        <div className="flex flex-col gap-3 border-t-2 border-black pt-4 md:flex-row md:items-center md:justify-between">
          <p className="text-muted-foreground font-sans text-xs font-bold tracking-[0.14em] uppercase">
            {`${rangeStart}-${rangeEnd} / ${pagination.totalItems}`}
          </p>
          <div className="flex items-center gap-2 self-end md:self-auto">
            <Button
              asChild={hasPreviousPage}
              disabled={!hasPreviousPage}
              size="sm"
              variant="secondary"
            >
              {hasPreviousPage ? (
                <Link
                  to={to(
                    buildDashboardResourcesTranslationsHref({
                      ...translationsViewState,
                      translationPage: pagination.currentPage - 1,
                    }),
                  )}
                >
                  {paginationPreviousLabel}
                </Link>
              ) : (
                <span>{paginationPreviousLabel}</span>
              )}
            </Button>
            <p className="font-sans text-xs font-bold tracking-[0.14em] uppercase">
              {`${pagination.currentPage} / ${pagination.pageCount}`}
            </p>
            <Button
              asChild={hasNextPage}
              disabled={!hasNextPage}
              size="sm"
              variant="secondary"
            >
              {hasNextPage ? (
                <Link
                  to={to(
                    buildDashboardResourcesTranslationsHref({
                      ...translationsViewState,
                      translationPage: pagination.currentPage + 1,
                    }),
                  )}
                >
                  {paginationNextLabel}
                </Link>
              ) : (
                <span>{paginationNextLabel}</span>
              )}
            </Button>
          </div>
        </div>
      ) : null}
    </DashboardPanel>
  );
}

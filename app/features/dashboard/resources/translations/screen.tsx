import { Form, Link } from "react-router";
import { Languages, Plus, Search } from "lucide-react";

import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardSectionHeading } from "~/components/dashboard/section-heading";
import { Button } from "~/components/ui/button";
import { TextField } from "~/components/ui/form-field";
import { useLocalizedPath } from "~/shared/i18n/i18n-react";

import { useDashboardResourcesCopy } from "../copy";
import {
  DASHBOARD_RESOURCES_MODAL,
  buildDashboardResourcesTranslationsHref,
} from "../routing/href";
import { useDashboardResourcesRouteContext } from "../layout/context";
import { DASHBOARD_PAGINATION_DIRECTION } from "../../shared/pagination";
import { DASHBOARD_RESOURCES_FORM_MODE } from "../state";
import { DashboardResourcesTranslationModal } from "./components/dashboard-resources-translation-modal";
import { DashboardResourcesTranslationsTable } from "./components/dashboard-resources-translations-table";

export default function DashboardResourcesTranslationsScreen() {
  const to = useLocalizedPath();
  const { copy, formCopy } = useDashboardResourcesCopy();
  const {
    locales,
    permissions,
    selectedTranslationLocale,
    translationForm,
    translationPagination,
    translationSearchQuery,
    translations,
  } = useDashboardResourcesRouteContext();
  const translationsViewState = {
    translationCursor: translationPagination.currentCursor,
    translationDirection: translationPagination.direction,
    translationLocale: selectedTranslationLocale,
    translationSearch: translationSearchQuery,
  } as const;

  return (
    <>
      <section className="space-y-4">
        <DashboardSectionHeading
          action={
            permissions.translations.canCreate ? (
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
            ) : null
          }
          eyebrow={copy.translationInventoryEyebrow}
          title={copy.registryTitle}
        />

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
                        translationCursor: null,
                        translationDirection: DASHBOARD_PAGINATION_DIRECTION.next,
                        translationLocale: localeRow.code,
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
                name="translationLocale"
                value={selectedTranslationLocale}
              />
              <TextField
                defaultValue={translationSearchQuery}
                label={formCopy.translation.search.label}
                name="translationSearch"
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
                      translationCursor: null,
                      translationDirection: DASHBOARD_PAGINATION_DIRECTION.next,
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
            canDelete={permissions.translations.canDelete}
            canUpdate={permissions.translations.canUpdate}
            emptyState={translationSearchQuery ? copy.searchEmptyState : undefined}
            pagination={translationPagination}
            paginationNextLabel={copy.paginationNextLabel}
            paginationPreviousLabel={copy.paginationPreviousLabel}
            selectedTranslationLocale={selectedTranslationLocale}
            translationCursor={translationPagination.currentCursor}
            translationDirection={translationPagination.direction}
            translationSearchQuery={translationSearchQuery}
            translations={translations}
          />
        </div>
      </section>

      <DashboardResourcesTranslationModal
        canSubmit={
          permissions.translations.canCreate ||
          (translationForm.mode === DASHBOARD_RESOURCES_FORM_MODE.edit &&
            permissions.translations.canUpdate)
        }
        form={translationForm}
        locales={locales}
        selectedTranslationLocale={selectedTranslationLocale}
        translationCursor={translationPagination.currentCursor}
        translationDirection={translationPagination.direction}
        translationSearchQuery={translationSearchQuery}
      />
    </>
  );
}

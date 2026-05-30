import { Link } from "react-router";
import { Plus } from "lucide-react";

import { DashboardSectionHeading } from "~/components/dashboard/section-heading";
import { Button } from "~/components/ui/button";
import { useLocalizedPath } from "~/shared/i18n/i18n-react";

import { useDashboardResourcesCopy } from "../copy";
import {
  DASHBOARD_RESOURCES_MODAL,
  buildDashboardResourcesLocalesHref,
} from "../routing/href";
import { useDashboardResourcesRouteContext } from "../layout/context";
import { DASHBOARD_RESOURCES_FORM_MODE } from "../state";
import { DashboardResourcesLocaleModal } from "./components/dashboard-resources-locale-modal";
import { DashboardResourcesLocalesTable } from "./components/dashboard-resources-locales-table";

export default function DashboardResourcesLocalesScreen() {
  const to = useLocalizedPath();
  const { copy } = useDashboardResourcesCopy();
  const { localeForm, locales, permissions } = useDashboardResourcesRouteContext();

  return (
    <>
      <section className="space-y-4">
        <DashboardSectionHeading
          action={
            permissions.locales.canCreate ? (
              <Button
                asChild
                className="hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              >
                <Link
                  to={to(
                    buildDashboardResourcesLocalesHref({
                      modal: DASHBOARD_RESOURCES_MODAL.createLocale,
                    }),
                  )}
                >
                  <Plus className="size-4" aria-hidden="true" />
                  {copy.createLocaleActionLabel}
                </Link>
              </Button>
            ) : null
          }
          eyebrow={copy.localeInventoryEyebrow}
          title={copy.registryTitle}
        />

        <DashboardResourcesLocalesTable
          canDelete={permissions.locales.canDelete}
          canUpdate={permissions.locales.canUpdate}
          locales={locales}
        />
      </section>

      <DashboardResourcesLocaleModal
        canSubmit={
          permissions.locales.canCreate ||
          (localeForm.mode === DASHBOARD_RESOURCES_FORM_MODE.edit &&
            permissions.locales.canUpdate)
        }
        form={localeForm}
      />
    </>
  );
}

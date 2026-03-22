import { Plus } from "lucide-react";
import { Form, Link } from "react-router";

import { DashboardModal } from "~/components/dashboard/modal";
import { Button } from "~/components/ui/button";
import { FormError, SelectField, TextField } from "~/components/ui/form-field";
import { useLocalizedPath } from "~/shared/i18n/i18n-react";
import {
  DASHBOARD_RESOURCES_TAB,
  RESOURCE_FORM_FIELD,
  RESOURCE_MUTATION_INTENT,
} from "~/features/resources/resource.shared";

import { useDashboardResourcesCopy } from "../dashboard-resources.constants";
import {
  buildDashboardResourcesHref,
  type DashboardResourcesLocaleFormState,
} from "../dashboard-resources.shared";

export function DashboardResourcesLocaleModal({
  form,
}: {
  form: DashboardResourcesLocaleFormState;
}) {
  const to = useLocalizedPath();
  const { copy, formCopy } = useDashboardResourcesCopy();

  if (!form.isOpen || !form.mode) {
    return null;
  }

  const isEditMode = form.mode === "edit";
  const modalCopy = isEditMode
    ? {
        actionLabel: copy.editLocaleActionLabel,
        description: copy.editLocaleDescription,
        intent: RESOURCE_MUTATION_INTENT.updateLocale,
        title: copy.editLocaleTitle,
      }
    : {
        actionLabel: copy.createLocaleActionLabel,
        description: copy.createLocaleDescription,
        intent: RESOURCE_MUTATION_INTENT.createLocale,
        title: copy.createLocaleTitle,
      };

  return (
    <DashboardModal
      description={modalCopy.description}
      title={modalCopy.title}
      to={to(buildDashboardResourcesHref({ tab: DASHBOARD_RESOURCES_TAB.locales }))}
    >
      <Form method="post" className="space-y-4">
        <input
          type="hidden"
          name={RESOURCE_FORM_FIELD.intent}
          value={modalCopy.intent}
        />
        {isEditMode && form.editingCode ? (
          <input
            type="hidden"
            name={RESOURCE_FORM_FIELD.originalCode}
            value={form.editingCode}
          />
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            error={form.errors?.code}
            defaultValue={form.values.code}
            label={formCopy.locale.code.label}
            name={RESOURCE_FORM_FIELD.code}
            placeholder={formCopy.locale.code.placeholder}
          />
          <TextField
            error={form.errors?.label}
            defaultValue={form.values.label}
            label={formCopy.locale.label.label}
            name={RESOURCE_FORM_FIELD.label}
            placeholder={formCopy.locale.label.placeholder}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <TextField
            defaultValue={form.values.sortOrder}
            error={form.errors?.sortOrder}
            label={formCopy.locale.sortOrder.label}
            name={RESOURCE_FORM_FIELD.sortOrder}
            placeholder={formCopy.locale.sortOrder.placeholder}
            type="number"
          />
          <SelectField
            defaultValue={form.values.isActive}
            error={form.errors?.isActive}
            label={formCopy.locale.activeLabel}
            name={RESOURCE_FORM_FIELD.isActive}
            options={[
              {
                label: formCopy.locale.activeOptions.true,
                value: "true",
              },
              {
                label: formCopy.locale.activeOptions.false,
                value: "false",
              },
            ]}
          />
          <SelectField
            defaultValue={form.values.isDefault}
            error={form.errors?.isDefault}
            label={formCopy.locale.defaultLabel}
            name={RESOURCE_FORM_FIELD.isDefault}
            options={[
              {
                label: formCopy.locale.defaultOptions.false,
                value: "false",
              },
              {
                label: formCopy.locale.defaultOptions.true,
                value: "true",
              },
            ]}
          />
        </div>

        <FormError message={form.errors?.form} />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button asChild variant="secondary" className="tracking-[0.14em]">
            <Link
              to={to(
                buildDashboardResourcesHref({ tab: DASHBOARD_RESOURCES_TAB.locales }),
              )}
            >
              {formCopy.cancelLabel}
            </Link>
          </Button>
          <Button
            type="submit"
            className="tracking-[0.14em] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          >
            <Plus className="size-4" aria-hidden="true" />
            {modalCopy.actionLabel}
          </Button>
        </div>
      </Form>
    </DashboardModal>
  );
}

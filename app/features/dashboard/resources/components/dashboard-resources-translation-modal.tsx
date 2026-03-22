import { Plus } from "lucide-react";
import { Form, Link } from "react-router";

import { DashboardModal } from "~/components/dashboard/modal";
import { Button } from "~/components/ui/button";
import {
  FormError,
  SelectField,
  TextField,
  TextareaField,
} from "~/components/ui/form-field";
import { useLocalizedPath } from "~/shared/i18n/i18n-react";
import {
  RESOURCE_FORM_FIELD,
  RESOURCE_MUTATION_INTENT,
} from "~/domain/resources/contract";
import type { LocaleResourceRecord } from "~/lib/resources/resources.server";

import { useDashboardResourcesCopy } from "../copy";
import { buildDashboardResourcesTranslationsHref } from "../href";
import type { DashboardResourcesTranslationFormState } from "../state";

export function DashboardResourcesTranslationModal({
  form,
  locales,
  selectedTranslationLocale,
  translationPage,
  translationSearchQuery,
}: {
  form: DashboardResourcesTranslationFormState;
  locales: LocaleResourceRecord[];
  selectedTranslationLocale: string;
  translationPage: number;
  translationSearchQuery: string;
}) {
  const to = useLocalizedPath();
  const { copy, formCopy } = useDashboardResourcesCopy();
  const translationsViewState = {
    translationLocale: selectedTranslationLocale,
    translationPage,
    translationSearch: translationSearchQuery,
  } as const;

  if (!form.isOpen || !form.mode) {
    return null;
  }

  const isEditMode = form.mode === "edit";
  const modalCopy = isEditMode
    ? {
        actionLabel: copy.editTranslationActionLabel,
        description: copy.editTranslationDescription,
        intent: RESOURCE_MUTATION_INTENT.updateTranslation,
        title: copy.editTranslationTitle,
      }
    : {
        actionLabel: copy.createTranslationActionLabel,
        description: copy.createTranslationDescription,
        intent: RESOURCE_MUTATION_INTENT.createTranslation,
        title: copy.createTranslationTitle,
      };

  return (
    <DashboardModal
      description={modalCopy.description}
      title={modalCopy.title}
      to={to(buildDashboardResourcesTranslationsHref(translationsViewState))}
    >
      <Form method="post" className="space-y-4">
        <input
          type="hidden"
          name={RESOURCE_FORM_FIELD.intent}
          value={modalCopy.intent}
        />
        {isEditMode && form.editingLocale && form.editingKey ? (
          <>
            <input
              type="hidden"
              name={RESOURCE_FORM_FIELD.originalLocale}
              value={form.editingLocale}
            />
            <input
              type="hidden"
              name={RESOURCE_FORM_FIELD.originalKey}
              value={form.editingKey}
            />
          </>
        ) : null}

        <SelectField
          defaultValue={form.values.locale}
          error={form.errors?.locale}
          label={formCopy.translation.locale.label}
          name={RESOURCE_FORM_FIELD.locale}
          options={locales.map((localeRow) => ({
            label: `${localeRow.code.toUpperCase()} / ${localeRow.label}`,
            value: localeRow.code,
          }))}
        />
        <TextField
          defaultValue={form.values.key}
          error={form.errors?.key}
          label={formCopy.translation.key.label}
          name={RESOURCE_FORM_FIELD.key}
          placeholder={formCopy.translation.key.placeholder}
        />
        <TextareaField
          defaultValue={form.values.value}
          error={form.errors?.value}
          label={formCopy.translation.value.label}
          name={RESOURCE_FORM_FIELD.value}
          placeholder={formCopy.translation.value.placeholder}
          rows={8}
        />

        <FormError message={form.errors?.form} />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button asChild variant="secondary" className="tracking-[0.14em]">
            <Link
              to={to(buildDashboardResourcesTranslationsHref(translationsViewState))}
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

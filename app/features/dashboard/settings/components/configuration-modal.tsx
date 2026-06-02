import { Form, Link } from "react-router";
import { Pencil } from "lucide-react";

import { DashboardModal } from "~/components/dashboard/modal";
import { Button } from "~/components/ui/button";
import { FormError, SelectField, TextField } from "~/components/ui/form-field";
import {
  ACCOUNT_CONFIGURATION_DEFINITIONS,
  ACCOUNT_CONFIGURATION_FORM_FIELD,
  ACCOUNT_CONFIGURATION_KEY,
  ACCOUNT_CONFIGURATION_SECTION,
} from "~/domain/configuration/model";
import { useLocalizedPath, useT } from "~/shared/i18n/i18n-react";

import { SETTINGS_MUTATION_FORM_FIELD, SETTINGS_MUTATION_INTENT } from "../contracts";
import { useDashboardSettingsCopy } from "../copy";
import {
  buildDashboardSettingsHref,
  DASHBOARD_SETTINGS_TAB,
  type DashboardSettingsGrantedLoaderData,
} from "../state";

export function DashboardSettingsConfigurationModal({
  form,
}: {
  form: DashboardSettingsGrantedLoaderData["accountForm"];
}) {
  const copy = useDashboardSettingsCopy();
  const t = useT();
  const to = useLocalizedPath();

  if (!form.isOpen || !form.mode || !form.editingKey) {
    return null;
  }

  const fieldCopy = copy.accountFields[form.editingKey];
  const definition = ACCOUNT_CONFIGURATION_DEFINITIONS.find(
    (item) => item.key === form.editingKey,
  );

  if (!definition) {
    return null;
  }

  const isSelectAppearance =
    definition.section === ACCOUNT_CONFIGURATION_SECTION.appearance;

  let selectOptions: readonly { label: string; value: string }[] = [];
  if (form.editingKey === ACCOUNT_CONFIGURATION_KEY.appearancePrimaryColor) {
    selectOptions = copy.appearanceColorOptions;
  } else if (form.editingKey === ACCOUNT_CONFIGURATION_KEY.appearanceHeadingFont) {
    selectOptions = copy.appearanceHeadingFontOptions;
  } else if (form.editingKey === ACCOUNT_CONFIGURATION_KEY.appearanceBodyFont) {
    selectOptions = copy.appearanceBodyFontOptions;
  }

  const targetTab =
    definition.section === ACCOUNT_CONFIGURATION_SECTION.appearance
      ? DASHBOARD_SETTINGS_TAB.appearance
      : DASHBOARD_SETTINGS_TAB.account;

  return (
    <DashboardModal
      description={copy.configurationEditDescription}
      title={copy.configurationEditTitle}
      to={to(buildDashboardSettingsHref(targetTab))}
    >
      <Form method="post" className="space-y-4">
        <input
          type="hidden"
          name={SETTINGS_MUTATION_FORM_FIELD.intent}
          value={SETTINGS_MUTATION_INTENT.updateAccountConfiguration}
        />
        <input
          type="hidden"
          name={ACCOUNT_CONFIGURATION_FORM_FIELD.key}
          value={form.values.key}
        />

        {isSelectAppearance ? (
          <SelectField
            defaultValue={form.values.value}
            error={form.errors?.value}
            label={fieldCopy.label}
            name={ACCOUNT_CONFIGURATION_FORM_FIELD.value}
            options={selectOptions}
          />
        ) : (
          <TextField
            defaultValue={form.values.value}
            error={form.errors?.value}
            label={fieldCopy.label}
            name={ACCOUNT_CONFIGURATION_FORM_FIELD.value}
            placeholder={fieldCopy.hint}
            type={definition.inputType}
          />
        )}

        <FormError message={form.errors?.form} />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button asChild variant="secondary" className="tracking-[0.14em]">
            <Link to={to(buildDashboardSettingsHref(targetTab))}>
              {t("common.dismiss")}
            </Link>
          </Button>
          <Button
            type="submit"
            className="tracking-[0.14em] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          >
            <Pencil className="size-4" aria-hidden="true" />
            {copy.configurationActionLabel}
          </Button>
        </div>
      </Form>
    </DashboardModal>
  );
}

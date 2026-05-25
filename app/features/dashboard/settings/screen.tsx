import { Form, Link } from "react-router";
import {
  PaintBucket,
  Pencil,
  ServerCog,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { DashboardAuthorizationAccessDeniedScreen } from "~/shared/authz/components/dashboard-authorization-access-denied-screen";
import { DashboardModal } from "~/components/dashboard/modal";
import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardSectionHeading } from "~/components/dashboard/section-heading";
import { Button } from "~/components/ui/button";
import { FormError, TextField } from "~/components/ui/form-field";
import {
  ACCOUNT_CONFIGURATION_DEFINITIONS,
  ACCOUNT_CONFIGURATION_FORM_FIELD,
  ACCOUNT_CONFIGURATION_MUTATION_INTENT,
  type AccountConfigurationKey,
} from "~/domain/configuration/model";
import { useLocalizedPath, useT } from "~/shared/i18n/i18n-react";

import { useDashboardSettingsCopy } from "./copy";
import {
  buildDashboardSettingsHref,
  buildDashboardSettingsModalHref,
  DASHBOARD_SETTINGS_MODAL,
  DASHBOARD_SETTINGS_TAB,
  type DashboardSettingsGrantedLoaderData,
  type DashboardSettingsTab,
} from "./state";

const DASHBOARD_SETTINGS_TAB_ICON: Record<DashboardSettingsTab, LucideIcon> = {
  [DASHBOARD_SETTINGS_TAB.account]: UserRound,
  [DASHBOARD_SETTINGS_TAB.appearance]: PaintBucket,
  [DASHBOARD_SETTINGS_TAB.runtime]: ServerCog,
  [DASHBOARD_SETTINGS_TAB.security]: ShieldCheck,
};

function renderStaticCardRows(
  rows: readonly { hint: string; label: string; value: string }[],
) {
  return rows.map((row) => (
    <div
      key={row.label}
      className="border-t-2 border-black pt-3 first:border-t-0 first:pt-0"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-sans text-xs font-bold tracking-[0.18em] uppercase">
            {row.label}
          </p>
          <p className="text-muted-foreground mt-1 font-sans text-xs font-bold">
            {row.hint}
          </p>
        </div>
        <p className="font-sans text-sm font-bold break-all md:text-right">
          {row.value}
        </p>
      </div>
    </div>
  ));
}

function DashboardSettingsAccountCards({
  accountValues,
  selectedTab,
}: {
  accountValues: Record<AccountConfigurationKey, string>;
  selectedTab: DashboardSettingsTab;
}) {
  const copy = useDashboardSettingsCopy();
  const to = useLocalizedPath();

  return copy.accountCards.map((card) => {
    const rows = ACCOUNT_CONFIGURATION_DEFINITIONS.filter(
      (definition) => definition.section === card.section,
    );

    return (
      <DashboardPanel key={card.title} className="space-y-4">
        <div className="space-y-2">
          <p className="text-muted-foreground font-sans text-xs font-bold tracking-[0.18em] uppercase">
            {card.eyebrow}
          </p>
          <h3 className="font-display text-3xl leading-none">{card.title}</h3>
          <p className="text-muted-foreground font-sans text-sm font-bold">
            {card.description}
          </p>
        </div>

        <div className="space-y-3">
          {rows.map((row) => {
            const fieldCopy = copy.accountFields[row.key];
            const value = accountValues[row.key] || copy.accountValueFallback;

            return (
              <Link
                key={row.key}
                to={to(
                  buildDashboardSettingsModalHref({
                    key: row.key,
                    modal: DASHBOARD_SETTINGS_MODAL.editAccount,
                    tab: selectedTab,
                  }),
                )}
                className="block border-t-2 border-black pt-3 first:border-t-0 first:pt-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                <span className="flex w-full flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <span>
                    <span className="font-sans text-xs font-bold tracking-[0.18em] uppercase">
                      {fieldCopy.label}
                    </span>
                    <span className="text-muted-foreground mt-1 block font-sans text-xs font-bold">
                      {fieldCopy.hint}
                    </span>
                  </span>
                  <span className="flex items-start gap-3 md:justify-end">
                    <span className="font-sans text-sm font-bold break-all md:text-right">
                      {value}
                    </span>
                    <Pencil className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </DashboardPanel>
    );
  });
}

function DashboardSettingsAccountModal({
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

  return (
    <DashboardModal
      description={copy.accountEditDescription}
      title={copy.accountEditTitle}
      to={to(buildDashboardSettingsHref(DASHBOARD_SETTINGS_TAB.account))}
    >
      <Form method="post" className="space-y-4">
        <input
          type="hidden"
          name={ACCOUNT_CONFIGURATION_FORM_FIELD.intent}
          value={ACCOUNT_CONFIGURATION_MUTATION_INTENT.update}
        />
        <input
          type="hidden"
          name={ACCOUNT_CONFIGURATION_FORM_FIELD.key}
          value={form.values.key}
        />

        <TextField
          defaultValue={form.values.value}
          error={form.errors?.value}
          label={fieldCopy.label}
          name={ACCOUNT_CONFIGURATION_FORM_FIELD.value}
          placeholder={fieldCopy.hint}
          type={definition.inputType}
        />

        <FormError message={form.errors?.form} />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button asChild variant="secondary" className="tracking-[0.14em]">
            <Link to={to(buildDashboardSettingsHref(DASHBOARD_SETTINGS_TAB.account))}>
              {t("common.dismiss")}
            </Link>
          </Button>
          <Button
            type="submit"
            className="tracking-[0.14em] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          >
            <Pencil className="size-4" aria-hidden="true" />
            {copy.accountActionLabel}
          </Button>
        </div>
      </Form>
    </DashboardModal>
  );
}

export function DashboardSettingsScreen({
  loaderData,
}: {
  loaderData: DashboardSettingsGrantedLoaderData;
}) {
  const to = useLocalizedPath();
  const copy = useDashboardSettingsCopy();
  const selectedContent = copy.content[loaderData.selectedTab];
  const isAccountTab = loaderData.selectedTab === DASHBOARD_SETTINGS_TAB.account;

  return (
    <div className="space-y-8">
      <DashboardSectionHeading eyebrow={copy.pageEyebrow} title={copy.pageTitle} />

      <DashboardPanel className="space-y-5">
        <div className="space-y-2">
          <p className="text-muted-foreground font-sans text-xs font-bold tracking-[0.18em] uppercase">
            {selectedContent.eyebrow}
          </p>
          <h2 className="font-display text-4xl leading-none md:text-5xl">
            {selectedContent.title}
          </h2>
          <p className="text-muted-foreground font-sans text-sm font-bold">
            {copy.pageDescription}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {copy.tabs.map((tab) => {
            const TabIcon = DASHBOARD_SETTINGS_TAB_ICON[tab.tab];

            return (
              <Button
                key={tab.tab}
                asChild
                className="h-auto w-full items-start justify-between px-4 py-4 text-left whitespace-normal"
                variant={loaderData.selectedTab === tab.tab ? "default" : "secondary"}
              >
                <Link to={to(buildDashboardSettingsHref(tab.tab))}>
                  <span className="flex min-w-0 flex-1 items-start gap-3">
                    <TabIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0 space-y-1">
                      <span className="block">{tab.label}</span>
                      <span className="block text-xs leading-snug break-words normal-case opacity-80">
                        {tab.description}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 self-start text-sm">{tab.total}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </DashboardPanel>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,1fr)]">
        <div className="grid gap-6 lg:grid-cols-2">
          {isAccountTab ? (
            <DashboardSettingsAccountCards
              accountValues={loaderData.accountValues}
              selectedTab={loaderData.selectedTab}
            />
          ) : (
            selectedContent.cards.map((card) => (
              <DashboardPanel key={card.title} className="space-y-4">
                <div className="space-y-2">
                  <p className="text-muted-foreground font-sans text-xs font-bold tracking-[0.18em] uppercase">
                    {card.eyebrow}
                  </p>
                  <h3 className="font-display text-3xl leading-none">{card.title}</h3>
                  <p className="text-muted-foreground font-sans text-sm font-bold">
                    {card.description}
                  </p>
                </div>

                <div className="space-y-3">{renderStaticCardRows(card.rows)}</div>
              </DashboardPanel>
            ))
          )}
        </div>

        <DashboardPanel className="space-y-4">
          <div className="space-y-2">
            <p className="text-muted-foreground font-sans text-xs font-bold tracking-[0.18em] uppercase">
              {copy.pageEyebrow}
            </p>
            <h3 className="font-display text-3xl leading-none">
              {selectedContent.checklist.title}
            </h3>
            <p className="text-muted-foreground font-sans text-sm font-bold">
              {selectedContent.checklist.description}
            </p>
          </div>

          <ul className="space-y-3">
            {selectedContent.checklist.items.map((item) => (
              <li
                key={item}
                className="bg-muted border-2 border-black px-4 py-3 font-sans text-sm font-bold dark:bg-stone-800"
              >
                {item}
              </li>
            ))}
          </ul>
        </DashboardPanel>
      </div>

      <DashboardSettingsAccountModal form={loaderData.accountForm} />
    </div>
  );
}

export function DashboardSettingsAccessDeniedScreen({
  viewerRole,
}: {
  viewerRole: string;
}) {
  const copy = useDashboardSettingsCopy();

  return (
    <DashboardAuthorizationAccessDeniedScreen
      currentRoleLabel={copy.currentRoleLabel}
      description={copy.restrictedDescription}
      title={copy.restrictedTitle}
      viewerRole={viewerRole}
    />
  );
}

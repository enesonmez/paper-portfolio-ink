import { Link } from "react-router";
import {
  PaintBucket,
  ServerCog,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { DashboardAuthorizationAccessDeniedScreen } from "~/shared/authz/components/dashboard-authorization-access-denied-screen";
import { DashboardPanel } from "~/components/dashboard/panel";
import { DashboardSectionHeading } from "~/components/dashboard/section-heading";
import { Button } from "~/components/ui/button";
import { useLocalizedPath } from "~/shared/i18n/i18n-react";

import { DashboardSettingsAccountCards } from "./components/account-cards";
import { DashboardSettingsAppearanceCards } from "./components/appearance-cards";
import { DashboardSettingsConfigurationModal } from "./components/configuration-modal";
import { useDashboardSettingsCopy } from "./copy";
import {
  buildDashboardSettingsHref,
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
                      <span className="block text-xs leading-snug wrap-break-word normal-case opacity-80">
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
          ) : loaderData.selectedTab === DASHBOARD_SETTINGS_TAB.appearance ? (
            <DashboardSettingsAppearanceCards
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

      <DashboardSettingsConfigurationModal form={loaderData.accountForm} />
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

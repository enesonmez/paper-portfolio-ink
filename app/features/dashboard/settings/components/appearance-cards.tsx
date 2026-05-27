import { Link } from "react-router";
import { Pencil } from "lucide-react";

import { DashboardPanel } from "~/components/dashboard/panel";
import {
  ACCOUNT_CONFIGURATION_DEFINITIONS,
  type AccountConfigurationKey,
} from "~/domain/configuration/model";
import { useLocalizedPath } from "~/shared/i18n/i18n-react";

import { useDashboardSettingsCopy } from "../copy";
import {
  buildDashboardSettingsModalHref,
  DASHBOARD_SETTINGS_MODAL,
  type DashboardSettingsTab,
} from "../state";

export function DashboardSettingsAppearanceCards({
  accountValues,
  selectedTab,
}: {
  accountValues: Record<AccountConfigurationKey, string>;
  selectedTab: DashboardSettingsTab;
}) {
  const copy = useDashboardSettingsCopy();
  const to = useLocalizedPath();

  return copy.appearanceCards.map((card) => {
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
            const rawValue = accountValues[row.key];
            let displayValue = rawValue || copy.configurationValueFallback;

            if (row.key === "appearance.primaryColor") {
              const option = copy.appearanceColorOptions.find(
                (opt) => opt.value === rawValue,
              );
              if (option) {
                displayValue = option.label;
              }
            } else if (row.key === "appearance.headingFont") {
              const option = copy.appearanceHeadingFontOptions.find(
                (opt) => opt.value === rawValue,
              );
              if (option) {
                displayValue = option.label;
              }
            } else if (row.key === "appearance.bodyFont") {
              const option = copy.appearanceBodyFontOptions.find(
                (opt) => opt.value === rawValue,
              );
              if (option) {
                displayValue = option.label;
              }
            }

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
                      {displayValue}
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

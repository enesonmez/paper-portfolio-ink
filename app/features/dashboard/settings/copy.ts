import { useT } from "~/shared/i18n/i18n-react";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";

import { DASHBOARD_SETTINGS_TAB, type DashboardSettingsTab } from "./state";

export interface DashboardSettingsMetric {
  accent?: "primary" | "surface";
  label: string;
  meta?: string;
  value: string;
}

export interface DashboardSettingsTabLink {
  description: string;
  label: string;
  tab: DashboardSettingsTab;
  total: string;
}

export interface DashboardSettingsCardRow {
  hint: string;
  label: string;
  value: string;
}

export interface DashboardSettingsCard {
  description: string;
  eyebrow: string;
  rows: readonly DashboardSettingsCardRow[];
  title: string;
}

export interface DashboardSettingsChecklist {
  description: string;
  items: readonly string[];
  title: string;
}

export interface DashboardSettingsTabContent {
  cards: readonly DashboardSettingsCard[];
  checklist: DashboardSettingsChecklist;
  description: string;
  eyebrow: string;
  title: string;
}

function buildDashboardSettingsTabs(
  t: I18nTranslator,
): readonly DashboardSettingsTabLink[] {
  return [
    {
      description: t("dashboard.settings.account.description"),
      label: t("dashboard.settings.tab.account"),
      tab: DASHBOARD_SETTINGS_TAB.account,
      total: "07",
    },
    {
      description: t("dashboard.settings.appearance.description"),
      label: t("dashboard.settings.tab.appearance"),
      tab: DASHBOARD_SETTINGS_TAB.appearance,
      total: "06",
    },
    {
      description: t("dashboard.settings.security.description"),
      label: t("dashboard.settings.tab.security"),
      tab: DASHBOARD_SETTINGS_TAB.security,
      total: "03",
    },
    {
      description: t("dashboard.settings.runtime.description"),
      label: t("dashboard.settings.tab.runtime"),
      tab: DASHBOARD_SETTINGS_TAB.runtime,
      total: "05",
    },
  ] as const;
}

function buildDashboardSettingsContent(
  t: I18nTranslator,
): Record<DashboardSettingsTab, DashboardSettingsTabContent> {
  return {
    [DASHBOARD_SETTINGS_TAB.account]: {
      cards: [
        {
          description: t("dashboard.settings.account.cardIdentityDescription"),
          eyebrow: t("dashboard.settings.account.cardIdentityEyebrow"),
          rows: [
            {
              hint: "Mock key: site.name",
              label: "Project name",
              value: "Paper Portfolio Ink",
            },
            {
              hint: "Mock key: site.domain",
              label: "Domain",
              value: "https://paper-portfolio-ink.dev",
            },
            {
              hint: "Mock key: contact.email",
              label: "Primary email",
              value: "admin@paper-portfolio-ink.dev",
            },
          ],
          title: t("dashboard.settings.account.cardIdentityTitle"),
        },
        {
          description: t("dashboard.settings.account.cardPresenceDescription"),
          eyebrow: t("dashboard.settings.account.cardPresenceEyebrow"),
          rows: [
            {
              hint: "Mock key: social.linkedin",
              label: "LinkedIn",
              value: "linkedin.com/in/enes-ink",
            },
            {
              hint: "Mock key: social.github",
              label: "GitHub",
              value: "github.com/enesonmez",
            },
            {
              hint: "Mock key: social.instagram",
              label: "Instagram",
              value: "instagram.com/paperportfolioink",
            },
            {
              hint: "Mock key: social.x",
              label: "X",
              value: "x.com/paperinkdev",
            },
          ],
          title: t("dashboard.settings.account.cardPresenceTitle"),
        },
      ],
      checklist: {
        description: t("dashboard.settings.account.checklistDescription"),
        items: [
          "Account rows stay list-first, not form-first.",
          "Popup edit intent will attach to each row in the next task.",
          "Configuration cache purge will sit in this surface after persistence lands.",
        ],
        title: t("dashboard.settings.account.checklistTitle"),
      },
      description: t("dashboard.settings.account.description"),
      eyebrow: t("dashboard.settings.account.eyebrow"),
      title: t("dashboard.settings.account.title"),
    },
    [DASHBOARD_SETTINGS_TAB.appearance]: {
      cards: [
        {
          description: t("dashboard.settings.appearance.cardChromeDescription"),
          eyebrow: t("dashboard.settings.appearance.cardChromeEyebrow"),
          rows: [
            {
              hint: "Theme direction",
              label: "Surface mode",
              value: "Paper Comic / Comic Noir",
            },
            {
              hint: "Typography lock",
              label: "Heading font",
              value: "VT323",
            },
            {
              hint: "Typography lock",
              label: "Body font",
              value: "JetBrains Mono",
            },
          ],
          title: t("dashboard.settings.appearance.cardChromeTitle"),
        },
        {
          description: t("dashboard.settings.appearance.cardVoiceDescription"),
          eyebrow: t("dashboard.settings.appearance.cardVoiceEyebrow"),
          rows: [
            {
              hint: "Content rhythm",
              label: "Dashboard tone",
              value: "Minimal, direct, operation-first",
            },
            {
              hint: "Localization shape",
              label: "Copy coverage",
              value: "TR / EN seed-backed",
            },
            {
              hint: "Density policy",
              label: "Panel spacing",
              value: "Compact grid with hard borders",
            },
          ],
          title: t("dashboard.settings.appearance.cardVoiceTitle"),
        },
      ],
      checklist: {
        description: t("dashboard.settings.appearance.checklistDescription"),
        items: [
          "No glow, no rounded enterprise shells.",
          "Focus states remain high-contrast and visible.",
          "A future appearance preference layer should not break SSR defaults.",
        ],
        title: t("dashboard.settings.appearance.checklistTitle"),
      },
      description: t("dashboard.settings.appearance.description"),
      eyebrow: t("dashboard.settings.appearance.eyebrow"),
      title: t("dashboard.settings.appearance.title"),
    },
    [DASHBOARD_SETTINGS_TAB.security]: {
      cards: [
        {
          description: t("dashboard.settings.security.cardSessionDescription"),
          eyebrow: t("dashboard.settings.security.cardSessionEyebrow"),
          rows: [
            {
              hint: "Cookie contract",
              label: "Session storage",
              value: "HttpOnly / Secure / SameSite=Lax",
            },
            {
              hint: "Audit contract",
              label: "Mutation logging",
              value: "Required for future settings writes",
            },
            {
              hint: "Edge policy",
              label: "Runtime posture",
              value: "Cloudflare Worker-compatible only",
            },
          ],
          title: t("dashboard.settings.security.cardSessionTitle"),
        },
        {
          description: t("dashboard.settings.security.cardAccessDescription"),
          eyebrow: t("dashboard.settings.security.cardAccessEyebrow"),
          rows: [
            {
              hint: "Claim gate",
              label: "Page access",
              value: "settings.manage",
            },
            {
              hint: "Route strategy",
              label: "Data flow",
              value: "Loader-first, server-authorized",
            },
            {
              hint: "Future review",
              label: "Claim editor",
              value: "User modal task pending",
            },
          ],
          title: t("dashboard.settings.security.cardAccessTitle"),
        },
      ],
      checklist: {
        description: t("dashboard.settings.security.checklistDescription"),
        items: [
          "Never expose settings mutations without row-level intent validation.",
          "Cache purge must remain explicit after config changes.",
          "Authorization updates should preserve revision-based invalidation.",
        ],
        title: t("dashboard.settings.security.checklistTitle"),
      },
      description: t("dashboard.settings.security.description"),
      eyebrow: t("dashboard.settings.security.eyebrow"),
      title: t("dashboard.settings.security.title"),
    },
    [DASHBOARD_SETTINGS_TAB.runtime]: {
      cards: [
        {
          description: t("dashboard.settings.runtime.cardCacheDescription"),
          eyebrow: t("dashboard.settings.runtime.cardCacheEyebrow"),
          rows: [
            {
              hint: "Existing flow",
              label: "I18n cache",
              value: "Warm after first request",
            },
            {
              hint: "Next flow",
              label: "Configuration cache",
              value: "Pending D1-backed key-value layer",
            },
            {
              hint: "Operator action",
              label: "Purge trigger",
              value: "Planned from settings surface",
            },
          ],
          title: t("dashboard.settings.runtime.cardCacheTitle"),
        },
        {
          description: t("dashboard.settings.runtime.cardDeliveryDescription"),
          eyebrow: t("dashboard.settings.runtime.cardDeliveryEyebrow"),
          rows: [
            {
              hint: "Runtime target",
              label: "Platform",
              value: "Cloudflare Pages + D1",
            },
            {
              hint: "Portability line",
              label: "Adaptation",
              value: "Provider abstractions stay shared",
            },
            {
              hint: "Observability",
              label: "Debug trail",
              value: "Request id + centralized error pipeline",
            },
          ],
          title: t("dashboard.settings.runtime.cardDeliveryTitle"),
        },
      ],
      checklist: {
        description: t("dashboard.settings.runtime.checklistDescription"),
        items: [
          "Add cache clear button after configuration persistence lands.",
          "Keep warm-up and invalidation utilities outside the route module.",
          "Do not couple runtime status cards to client-only polling by default.",
        ],
        title: t("dashboard.settings.runtime.checklistTitle"),
      },
      description: t("dashboard.settings.runtime.description"),
      eyebrow: t("dashboard.settings.runtime.eyebrow"),
      title: t("dashboard.settings.runtime.title"),
    },
  };
}

export function useDashboardSettingsCopy() {
  const t = useT();

  return {
    content: buildDashboardSettingsContent(t),
    currentRoleLabel: t("dashboard.settings.currentRoleLabel"),
    mockBadge: t("dashboard.settings.mockBadge"),
    mockDescription: t("dashboard.settings.mockDescription"),
    pageDescription: t("dashboard.settings.pageDescription"),
    pageEyebrow: t("dashboard.settings.pageEyebrow"),
    pageTitle: t("dashboard.settings.pageTitle"),
    restrictedDescription: t("dashboard.settings.restrictedDescription"),
    restrictedTitle: t("dashboard.settings.restrictedTitle"),
    tabs: buildDashboardSettingsTabs(t),
  };
}

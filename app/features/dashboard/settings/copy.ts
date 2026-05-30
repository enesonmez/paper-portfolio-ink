import {
  ACCOUNT_CONFIGURATION_KEY,
  APPEARANCE_BODY_FONTS,
  APPEARANCE_HEADING_FONTS,
  APPEARANCE_PRIMARY_COLORS,
  type AccountConfigurationKey,
} from "~/domain/configuration/model";
import { useT } from "~/shared/i18n/i18n-react";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";

import { DASHBOARD_SETTINGS_TAB, type DashboardSettingsTab } from "./state";

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

export interface DashboardSettingsAccountCard {
  description: string;
  eyebrow: string;
  section: "identity" | "presence" | "appearance";
  title: string;
}

export interface DashboardSettingsAccountFieldCopy {
  hint: string;
  label: string;
}

export type DashboardSettingsAccountFieldCopyMap = Record<
  AccountConfigurationKey,
  DashboardSettingsAccountFieldCopy
>;

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

function buildDashboardSettingsAccountFieldCopy(
  t: I18nTranslator,
): DashboardSettingsAccountFieldCopyMap {
  return {
    [ACCOUNT_CONFIGURATION_KEY.contactEmail]: {
      hint: t("dashboard.settings.account.field.contact.email.hint"),
      label: t("dashboard.settings.account.field.contact.email.label"),
    },
    [ACCOUNT_CONFIGURATION_KEY.projectDomainUrl]: {
      hint: t("dashboard.settings.account.field.site.domainUrl.hint"),
      label: t("dashboard.settings.account.field.site.domainUrl.label"),
    },
    [ACCOUNT_CONFIGURATION_KEY.projectName]: {
      hint: t("dashboard.settings.account.field.site.name.hint"),
      label: t("dashboard.settings.account.field.site.name.label"),
    },
    [ACCOUNT_CONFIGURATION_KEY.socialGithub]: {
      hint: t("dashboard.settings.account.field.social.github.hint"),
      label: t("dashboard.settings.account.field.social.github.label"),
    },
    [ACCOUNT_CONFIGURATION_KEY.socialInstagram]: {
      hint: t("dashboard.settings.account.field.social.instagram.hint"),
      label: t("dashboard.settings.account.field.social.instagram.label"),
    },
    [ACCOUNT_CONFIGURATION_KEY.socialLinkedin]: {
      hint: t("dashboard.settings.account.field.social.linkedin.hint"),
      label: t("dashboard.settings.account.field.social.linkedin.label"),
    },
    [ACCOUNT_CONFIGURATION_KEY.socialX]: {
      hint: t("dashboard.settings.account.field.social.x.hint"),
      label: t("dashboard.settings.account.field.social.x.label"),
    },
    [ACCOUNT_CONFIGURATION_KEY.appearancePrimaryColor]: {
      hint: t("dashboard.settings.appearance.field.primaryColor.hint"),
      label: t("dashboard.settings.appearance.field.primaryColor.label"),
    },
    [ACCOUNT_CONFIGURATION_KEY.appearanceHeadingFont]: {
      hint: t("dashboard.settings.appearance.field.headingFont.hint"),
      label: t("dashboard.settings.appearance.field.headingFont.label"),
    },
    [ACCOUNT_CONFIGURATION_KEY.appearanceBodyFont]: {
      hint: t("dashboard.settings.appearance.field.bodyFont.hint"),
      label: t("dashboard.settings.appearance.field.bodyFont.label"),
    },
  };
}

function buildDashboardSettingsContent(
  t: I18nTranslator,
): Record<DashboardSettingsTab, DashboardSettingsTabContent> {
  return {
    [DASHBOARD_SETTINGS_TAB.account]: {
      cards: [],
      checklist: {
        description: t("dashboard.settings.account.checklistDescription"),
        items: [
          t("dashboard.settings.account.checklist.item1"),
          t("dashboard.settings.account.checklist.item2"),
          t("dashboard.settings.account.checklist.item3"),
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
              hint: t("dashboard.settings.appearance.cardChrome.row1.hint"),
              label: t("dashboard.settings.appearance.cardChrome.row1.label"),
              value: t("dashboard.settings.appearance.cardChrome.row1.value"),
            },
            {
              hint: t("dashboard.settings.appearance.cardChrome.row2.hint"),
              label: t("dashboard.settings.appearance.cardChrome.row2.label"),
              value: t("dashboard.settings.appearance.cardChrome.row2.value"),
            },
            {
              hint: t("dashboard.settings.appearance.cardChrome.row3.hint"),
              label: t("dashboard.settings.appearance.cardChrome.row3.label"),
              value: t("dashboard.settings.appearance.cardChrome.row3.value"),
            },
          ],
          title: t("dashboard.settings.appearance.cardChromeTitle"),
        },
        {
          description: t("dashboard.settings.appearance.cardVoiceDescription"),
          eyebrow: t("dashboard.settings.appearance.cardVoiceEyebrow"),
          rows: [
            {
              hint: t("dashboard.settings.appearance.cardVoice.row1.hint"),
              label: t("dashboard.settings.appearance.cardVoice.row1.label"),
              value: t("dashboard.settings.appearance.cardVoice.row1.value"),
            },
            {
              hint: t("dashboard.settings.appearance.cardVoice.row2.hint"),
              label: t("dashboard.settings.appearance.cardVoice.row2.label"),
              value: t("dashboard.settings.appearance.cardVoice.row2.value"),
            },
            {
              hint: t("dashboard.settings.appearance.cardVoice.row3.hint"),
              label: t("dashboard.settings.appearance.cardVoice.row3.label"),
              value: t("dashboard.settings.appearance.cardVoice.row3.value"),
            },
          ],
          title: t("dashboard.settings.appearance.cardVoiceTitle"),
        },
      ],
      checklist: {
        description: t("dashboard.settings.appearance.checklistDescription"),
        items: [
          t("dashboard.settings.appearance.checklist.item1"),
          t("dashboard.settings.appearance.checklist.item2"),
          t("dashboard.settings.appearance.checklist.item3"),
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
              hint: t("dashboard.settings.security.cardSession.row1.hint"),
              label: t("dashboard.settings.security.cardSession.row1.label"),
              value: t("dashboard.settings.security.cardSession.row1.value"),
            },
            {
              hint: t("dashboard.settings.security.cardSession.row2.hint"),
              label: t("dashboard.settings.security.cardSession.row2.label"),
              value: t("dashboard.settings.security.cardSession.row2.value"),
            },
            {
              hint: t("dashboard.settings.security.cardSession.row3.hint"),
              label: t("dashboard.settings.security.cardSession.row3.label"),
              value: t("dashboard.settings.security.cardSession.row3.value"),
            },
          ],
          title: t("dashboard.settings.security.cardSessionTitle"),
        },
        {
          description: t("dashboard.settings.security.cardAccessDescription"),
          eyebrow: t("dashboard.settings.security.cardAccessEyebrow"),
          rows: [
            {
              hint: t("dashboard.settings.security.cardAccess.row1.hint"),
              label: t("dashboard.settings.security.cardAccess.row1.label"),
              value: t("dashboard.settings.security.cardAccess.row1.value"),
            },
            {
              hint: t("dashboard.settings.security.cardAccess.row2.hint"),
              label: t("dashboard.settings.security.cardAccess.row2.label"),
              value: t("dashboard.settings.security.cardAccess.row2.value"),
            },
            {
              hint: t("dashboard.settings.security.cardAccess.row3.hint"),
              label: t("dashboard.settings.security.cardAccess.row3.label"),
              value: t("dashboard.settings.security.cardAccess.row3.value"),
            },
          ],
          title: t("dashboard.settings.security.cardAccessTitle"),
        },
      ],
      checklist: {
        description: t("dashboard.settings.security.checklistDescription"),
        items: [
          t("dashboard.settings.security.checklist.item1"),
          t("dashboard.settings.security.checklist.item2"),
          t("dashboard.settings.security.checklist.item3"),
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
              hint: t("dashboard.settings.runtime.cardCache.row1.hint"),
              label: t("dashboard.settings.runtime.cardCache.row1.label"),
              value: t("dashboard.settings.runtime.cardCache.row1.value"),
            },
            {
              hint: t("dashboard.settings.runtime.cardCache.row2.hint"),
              label: t("dashboard.settings.runtime.cardCache.row2.label"),
              value: t("dashboard.settings.runtime.cardCache.row2.value"),
            },
            {
              hint: t("dashboard.settings.runtime.cardCache.row3.hint"),
              label: t("dashboard.settings.runtime.cardCache.row3.label"),
              value: t("dashboard.settings.runtime.cardCache.row3.value"),
            },
          ],
          title: t("dashboard.settings.runtime.cardCacheTitle"),
        },
        {
          description: t("dashboard.settings.runtime.cardDeliveryDescription"),
          eyebrow: t("dashboard.settings.runtime.cardDeliveryEyebrow"),
          rows: [
            {
              hint: t("dashboard.settings.runtime.cardDelivery.row1.hint"),
              label: t("dashboard.settings.runtime.cardDelivery.row1.label"),
              value: t("dashboard.settings.runtime.cardDelivery.row1.value"),
            },
            {
              hint: t("dashboard.settings.runtime.cardDelivery.row2.hint"),
              label: t("dashboard.settings.runtime.cardDelivery.row2.label"),
              value: t("dashboard.settings.runtime.cardDelivery.row2.value"),
            },
            {
              hint: t("dashboard.settings.runtime.cardDelivery.row3.hint"),
              label: t("dashboard.settings.runtime.cardDelivery.row3.label"),
              value: t("dashboard.settings.runtime.cardDelivery.row3.value"),
            },
          ],
          title: t("dashboard.settings.runtime.cardDeliveryTitle"),
        },
      ],
      checklist: {
        description: t("dashboard.settings.runtime.checklistDescription"),
        items: [
          t("dashboard.settings.runtime.checklist.item1"),
          t("dashboard.settings.runtime.checklist.item2"),
          t("dashboard.settings.runtime.checklist.item3"),
        ],
        title: t("dashboard.settings.runtime.checklistTitle"),
      },
      description: t("dashboard.settings.runtime.description"),
      eyebrow: t("dashboard.settings.runtime.eyebrow"),
      title: t("dashboard.settings.runtime.title"),
    },
  };
}

function buildDashboardSettingsAccountCards(
  t: I18nTranslator,
): readonly DashboardSettingsAccountCard[] {
  return [
    {
      description: t("dashboard.settings.account.cardIdentityDescription"),
      eyebrow: t("dashboard.settings.account.cardIdentityEyebrow"),
      section: "identity",
      title: t("dashboard.settings.account.cardIdentityTitle"),
    },
    {
      description: t("dashboard.settings.account.cardPresenceDescription"),
      eyebrow: t("dashboard.settings.account.cardPresenceEyebrow"),
      section: "presence",
      title: t("dashboard.settings.account.cardPresenceTitle"),
    },
  ] as const;
}

function buildDashboardSettingsAppearanceCards(
  t: I18nTranslator,
): readonly DashboardSettingsAccountCard[] {
  return [
    {
      description: t("dashboard.settings.appearance.cardChromeDescription"),
      eyebrow: t("dashboard.settings.appearance.cardChromeEyebrow"),
      section: "appearance",
      title: t("dashboard.settings.appearance.cardChromeTitle"),
    },
  ] as const;
}

export function useDashboardSettingsCopy() {
  const t = useT();

  return {
    configurationActionLabel: t("dashboard.settings.configuration.actionLabel"),
    accountCards: buildDashboardSettingsAccountCards(t),
    appearanceCards: buildDashboardSettingsAppearanceCards(t),
    configurationEditDescription: t("dashboard.settings.configuration.editDescription"),
    configurationEditTitle: t("dashboard.settings.configuration.editTitle"),
    accountFields: buildDashboardSettingsAccountFieldCopy(t),
    configurationValueFallback: t("dashboard.settings.configuration.valueFallback"),
    content: buildDashboardSettingsContent(t),
    currentRoleLabel: t("dashboard.settings.currentRoleLabel"),
    pageDescription: t("dashboard.settings.pageDescription"),
    pageEyebrow: t("dashboard.settings.pageEyebrow"),
    pageTitle: t("dashboard.settings.pageTitle"),
    restrictedDescription: t("dashboard.settings.restrictedDescription"),
    restrictedTitle: t("dashboard.settings.restrictedTitle"),
    tabs: buildDashboardSettingsTabs(t),
    securityNoSessions: t("dashboard.settings.security.noSessions"),
    securityNoOtherSessionsDescription: t(
      "dashboard.settings.security.noOtherSessionsDescription",
    ),
    securityCurrentSession: t("dashboard.settings.security.currentSession"),
    securityRevokeSession: t("dashboard.settings.security.revokeSession"),
    securityRevokeSessionConfirm: t("dashboard.settings.security.revokeSessionConfirm"),
    securityIpAddress: t("dashboard.settings.security.ipAddress"),
    securityUnknown: t("dashboard.settings.security.unknown"),
    securityCreatedAt: t("dashboard.settings.security.createdAt"),
    securityExpiresAt: t("dashboard.settings.security.expiresAt"),
    securityUnknownDevice: t("dashboard.settings.security.unknownDevice"),
    securityRevokeOtherSessionsTitle: t(
      "dashboard.settings.security.revokeOtherSessionsTitle",
    ),
    securityRevokeOtherSessionsLabel: t(
      "dashboard.settings.security.revokeOtherSessionsLabel",
    ),
    securityRevokeOtherSessionsDescription: t(
      "dashboard.settings.security.revokeOtherSessionsDescription",
    ),
    securityRevokeOtherSessionsButton: t(
      "dashboard.settings.security.revokeOtherSessionsButton",
    ),
    securityRevokeOtherSessionsConfirm: t(
      "dashboard.settings.security.revokeOtherSessionsConfirm",
    ),
    securityRevokeAllSessionsTitle: t(
      "dashboard.settings.security.revokeAllSessionsTitle",
    ),
    securityRevokeAllSessionsLabel: t(
      "dashboard.settings.security.revokeAllSessionsLabel",
    ),
    securityRevokeAllSessionsDescription: t(
      "dashboard.settings.security.revokeAllSessionsDescription",
    ),
    securityRevokeAllSessionsButton: t(
      "dashboard.settings.security.revokeAllSessionsButton",
    ),
    securityRevokeAllSessionsConfirm: t(
      "dashboard.settings.security.revokeAllSessionsConfirm",
    ),
    securityCancelLabel: t("dashboard.settings.security.cancelLabel"),
    appearanceColorOptions: [
      {
        value: APPEARANCE_PRIMARY_COLORS.yellow,
        label: t("dashboard.settings.appearance.color.yellow"),
      },
      {
        value: APPEARANCE_PRIMARY_COLORS.orange,
        label: t("dashboard.settings.appearance.color.orange"),
      },
      {
        value: APPEARANCE_PRIMARY_COLORS.green,
        label: t("dashboard.settings.appearance.color.green"),
      },
      {
        value: APPEARANCE_PRIMARY_COLORS.cyan,
        label: t("dashboard.settings.appearance.color.cyan"),
      },
      {
        value: APPEARANCE_PRIMARY_COLORS.red,
        label: t("dashboard.settings.appearance.color.red"),
      },
    ],
    appearanceHeadingFontOptions: [
      {
        value: APPEARANCE_HEADING_FONTS.vt323,
        label: t("dashboard.settings.appearance.font.heading.vt323"),
      },
      {
        value: APPEARANCE_HEADING_FONTS.outfit,
        label: t("dashboard.settings.appearance.font.heading.outfit"),
      },
      {
        value: APPEARANCE_HEADING_FONTS.sans,
        label: t("dashboard.settings.appearance.font.heading.sans"),
      },
      {
        value: APPEARANCE_HEADING_FONTS.serif,
        label: t("dashboard.settings.appearance.font.heading.serif"),
      },
    ],
    appearanceBodyFontOptions: [
      {
        value: APPEARANCE_BODY_FONTS.mono,
        label: t("dashboard.settings.appearance.font.body.mono"),
      },
      {
        value: APPEARANCE_BODY_FONTS.inter,
        label: t("dashboard.settings.appearance.font.body.inter"),
      },
      {
        value: APPEARANCE_BODY_FONTS.sans,
        label: t("dashboard.settings.appearance.font.body.sans"),
      },
      {
        value: APPEARANCE_BODY_FONTS.serif,
        label: t("dashboard.settings.appearance.font.body.serif"),
      },
    ],
  };
}

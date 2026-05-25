export const ACCOUNT_CONFIGURATION_KEY = {
  contactEmail: "contact.email",
  projectDomainUrl: "site.domainUrl",
  projectName: "site.name",
  socialGithub: "social.github",
  socialInstagram: "social.instagram",
  socialLinkedin: "social.linkedin",
  socialX: "social.x",
} as const;

export type AccountConfigurationKey =
  (typeof ACCOUNT_CONFIGURATION_KEY)[keyof typeof ACCOUNT_CONFIGURATION_KEY];

export const ACCOUNT_CONFIGURATION_SECTION = {
  identity: "identity",
  presence: "presence",
} as const;

export type AccountConfigurationSection =
  (typeof ACCOUNT_CONFIGURATION_SECTION)[keyof typeof ACCOUNT_CONFIGURATION_SECTION];

export const ACCOUNT_CONFIGURATION_VALUE_KIND = {
  email: "email",
  text: "text",
  url: "url",
} as const;

export type AccountConfigurationValueKind =
  (typeof ACCOUNT_CONFIGURATION_VALUE_KIND)[keyof typeof ACCOUNT_CONFIGURATION_VALUE_KIND];

export interface AccountConfigurationDefinition {
  defaultValue: string;
  inputType: "email" | "text" | "url";
  isPublicLink?: boolean;
  isRequired?: boolean;
  key: AccountConfigurationKey;
  publicLinkKey?: "github" | "instagram" | "linkedin" | "mail" | "x";
  publicLinkOrder?: number;
  section: AccountConfigurationSection;
  valueKind: AccountConfigurationValueKind;
}

export const ACCOUNT_CONFIGURATION_DEFINITIONS = [
  {
    defaultValue: "Paper Ink",
    inputType: "text",
    isRequired: true,
    key: ACCOUNT_CONFIGURATION_KEY.projectName,
    section: ACCOUNT_CONFIGURATION_SECTION.identity,
    valueKind: ACCOUNT_CONFIGURATION_VALUE_KIND.text,
  },
  {
    defaultValue: "https://paper-portfolio-ink.dev",
    inputType: "url",
    isRequired: true,
    key: ACCOUNT_CONFIGURATION_KEY.projectDomainUrl,
    section: ACCOUNT_CONFIGURATION_SECTION.identity,
    valueKind: ACCOUNT_CONFIGURATION_VALUE_KIND.url,
  },
  {
    defaultValue: "admin@paper-portfolio-ink.dev",
    inputType: "email",
    isPublicLink: true,
    isRequired: true,
    key: ACCOUNT_CONFIGURATION_KEY.contactEmail,
    publicLinkKey: "mail",
    publicLinkOrder: 50,
    section: ACCOUNT_CONFIGURATION_SECTION.identity,
    valueKind: ACCOUNT_CONFIGURATION_VALUE_KIND.email,
  },
  {
    defaultValue: "https://linkedin.com/in/enes-ink",
    inputType: "url",
    isPublicLink: true,
    key: ACCOUNT_CONFIGURATION_KEY.socialLinkedin,
    publicLinkKey: "linkedin",
    publicLinkOrder: 20,
    section: ACCOUNT_CONFIGURATION_SECTION.presence,
    valueKind: ACCOUNT_CONFIGURATION_VALUE_KIND.url,
  },
  {
    defaultValue: "https://github.com/enesonmez",
    inputType: "url",
    isPublicLink: true,
    key: ACCOUNT_CONFIGURATION_KEY.socialGithub,
    publicLinkKey: "github",
    publicLinkOrder: 10,
    section: ACCOUNT_CONFIGURATION_SECTION.presence,
    valueKind: ACCOUNT_CONFIGURATION_VALUE_KIND.url,
  },
  {
    defaultValue: "https://x.com/paperinkdev",
    inputType: "url",
    isPublicLink: true,
    key: ACCOUNT_CONFIGURATION_KEY.socialX,
    publicLinkKey: "x",
    publicLinkOrder: 30,
    section: ACCOUNT_CONFIGURATION_SECTION.presence,
    valueKind: ACCOUNT_CONFIGURATION_VALUE_KIND.url,
  },
  {
    defaultValue: "https://instagram.com/paperportfolioink",
    inputType: "url",
    isPublicLink: true,
    key: ACCOUNT_CONFIGURATION_KEY.socialInstagram,
    publicLinkKey: "instagram",
    publicLinkOrder: 40,
    section: ACCOUNT_CONFIGURATION_SECTION.presence,
    valueKind: ACCOUNT_CONFIGURATION_VALUE_KIND.url,
  },
] as const satisfies readonly AccountConfigurationDefinition[];

export const ACCOUNT_CONFIGURATION_KEYS = ACCOUNT_CONFIGURATION_DEFINITIONS.map(
  (definition) => definition.key,
);

export const ACCOUNT_CONFIGURATION_MUTATION_INTENT = {
  update: "update-account-configuration",
} as const;

export type AccountConfigurationMutationIntent =
  (typeof ACCOUNT_CONFIGURATION_MUTATION_INTENT)[keyof typeof ACCOUNT_CONFIGURATION_MUTATION_INTENT];

export const ACCOUNT_CONFIGURATION_FORM_FIELD = {
  intent: "intent",
  key: "key",
  value: "value",
} as const;

export function isAccountConfigurationKey(
  value: string,
): value is AccountConfigurationKey {
  return ACCOUNT_CONFIGURATION_KEYS.includes(value as AccountConfigurationKey);
}

export function isAccountConfigurationMutationIntent(
  value: string,
): value is AccountConfigurationMutationIntent {
  return value === ACCOUNT_CONFIGURATION_MUTATION_INTENT.update;
}

export function getAccountConfigurationDefinition(key: AccountConfigurationKey) {
  return ACCOUNT_CONFIGURATION_DEFINITIONS.find((definition) => definition.key === key);
}

export function getDefaultAccountConfigurationValue(key: AccountConfigurationKey) {
  return getAccountConfigurationDefinition(key)?.defaultValue ?? "";
}

export function getDefaultAccountConfigurationRecord() {
  return Object.fromEntries(
    ACCOUNT_CONFIGURATION_DEFINITIONS.map((definition) => [
      definition.key,
      definition.defaultValue,
    ]),
  ) as Record<AccountConfigurationKey, string>;
}

export function isOptionalAccountConfigurationKey(key: AccountConfigurationKey) {
  const definition = getAccountConfigurationDefinition(key);

  return !definition || !("isRequired" in definition) || definition.isRequired !== true;
}

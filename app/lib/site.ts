import { useRouteLoaderData } from "react-router";

import type { loader as rootLoader } from "~/root";
import {
  ACCOUNT_CONFIGURATION_DEFINITIONS,
  ACCOUNT_CONFIGURATION_KEY,
  getDefaultAccountConfigurationRecord,
  type AccountConfigurationKey,
} from "~/domain/configuration/model";

type ConfigurationStore = Partial<Record<AccountConfigurationKey, string>>;
type PublicSocialLinkKey = "github" | "instagram" | "linkedin" | "mail" | "x";
type PublicSocialLink = {
  href: string;
  key: PublicSocialLinkKey;
};

export type RootLoaderData = Exclude<Awaited<ReturnType<typeof rootLoader>>, Response>;

const defaultAccountConfiguration = getDefaultAccountConfigurationRecord();

function normalizeConfiguration(configuration?: ConfigurationStore) {
  return {
    ...defaultAccountConfiguration,
    ...configuration,
  };
}

export function buildSiteConfig(configuration?: ConfigurationStore) {
  const normalized = normalizeConfiguration(configuration);

  return {
    name: normalized[ACCOUNT_CONFIGURATION_KEY.projectName],
    url: normalized[ACCOUNT_CONFIGURATION_KEY.projectDomainUrl],
  } as const;
}

export function buildPrimaryContactHref(configuration?: ConfigurationStore) {
  const normalized = normalizeConfiguration(configuration);

  return `mailto:${normalized[ACCOUNT_CONFIGURATION_KEY.contactEmail]}`;
}

export function buildPublicSocialLinks(configuration?: ConfigurationStore) {
  const normalized = normalizeConfiguration(configuration);

  return ACCOUNT_CONFIGURATION_DEFINITIONS.filter(
    (
      definition,
    ): definition is (typeof ACCOUNT_CONFIGURATION_DEFINITIONS)[number] & {
      isPublicLink: true;
      publicLinkKey: PublicSocialLinkKey;
      publicLinkOrder: number;
    } =>
      "isPublicLink" in definition &&
      definition.isPublicLink === true &&
      "publicLinkKey" in definition &&
      typeof definition.publicLinkKey === "string" &&
      "publicLinkOrder" in definition &&
      typeof definition.publicLinkOrder === "number",
  )
    .map((definition) => {
      const rawValue = normalized[definition.key].trim();

      return {
        href:
          definition.key === ACCOUNT_CONFIGURATION_KEY.contactEmail
            ? buildPrimaryContactHref(normalized)
            : rawValue,
        key: definition.publicLinkKey,
        order: definition.publicLinkOrder,
        rawValue,
      };
    })
    .filter((link) => link.rawValue.length > 0)
    .sort((left, right) => left.order - right.order)
    .map(({ href, key }) => ({ href, key })) as readonly PublicSocialLink[];
}

function isRootLoaderData(value: unknown): value is RootLoaderData {
  return (
    typeof value === "object" &&
    value !== null &&
    "configuration" in value &&
    typeof value.configuration === "object" &&
    value.configuration !== null
  );
}

export function getRootLoaderDataFromMatches(
  matches: ReadonlyArray<{ data?: unknown; id?: string } | undefined> | undefined,
) {
  for (const match of matches ?? []) {
    if (match?.id === "root" && isRootLoaderData(match.data)) {
      return match.data;
    }
  }

  return null;
}

export function useOptionalRootLoaderData() {
  try {
    return useRouteLoaderData<RootLoaderData>("root");
  } catch {
    return undefined;
  }
}

export function useRootSiteConfig() {
  const data = useOptionalRootLoaderData();

  return buildSiteConfig(data?.configuration);
}

export function useRootPublicSocialLinks() {
  const data = useOptionalRootLoaderData();

  return buildPublicSocialLinks(data?.configuration);
}

export function usePrimaryContactHref() {
  const data = useOptionalRootLoaderData();

  return buildPrimaryContactHref(data?.configuration);
}

export const siteConfig = buildSiteConfig();

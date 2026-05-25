import {
  ACCOUNT_CONFIGURATION_KEY,
  getDefaultAccountConfigurationRecord,
} from "~/domain/configuration/model";

const defaultAccountConfiguration = getDefaultAccountConfigurationRecord();

export const siteConfig = {
  name: defaultAccountConfiguration[ACCOUNT_CONFIGURATION_KEY.projectName],
  url: defaultAccountConfiguration[ACCOUNT_CONFIGURATION_KEY.projectDomainUrl],
} as const;

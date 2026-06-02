export const SETTINGS_MUTATION_INTENT = {
  refreshRuntimeCache: "refresh-runtime-cache",
  revokeAllSessions: "revoke-all-sessions",
  revokeOtherSessions: "revoke-other-sessions",
  revokeSession: "revoke-session",
  updateAccountConfiguration: "update-account-configuration",
} as const;

export type SettingsMutationIntent =
  (typeof SETTINGS_MUTATION_INTENT)[keyof typeof SETTINGS_MUTATION_INTENT];

export const SETTINGS_MUTATION_FORM_FIELD = {
  cacheId: "cacheId",
  intent: "intent",
  sessionId: "sessionId",
} as const;

export function isSettingsMutationIntent(
  value: string,
): value is SettingsMutationIntent {
  return Object.values(SETTINGS_MUTATION_INTENT).includes(
    value as SettingsMutationIntent,
  );
}

export function isSettingsSecurityMutationIntent(intent: SettingsMutationIntent) {
  return (
    intent === SETTINGS_MUTATION_INTENT.revokeSession ||
    intent === SETTINGS_MUTATION_INTENT.revokeOtherSessions ||
    intent === SETTINGS_MUTATION_INTENT.revokeAllSessions
  );
}

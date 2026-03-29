export const LOGGING_FORM_FIELD = {
  endAt: "endAt",
  intent: "intent",
  startAt: "startAt",
} as const;

export const LOGGING_MUTATION_INTENT = {
  deleteErrors: "delete-errors",
  exportErrors: "export-errors",
} as const;

export type LoggingMutationIntent =
  (typeof LOGGING_MUTATION_INTENT)[keyof typeof LOGGING_MUTATION_INTENT];

export function isLoggingMutationIntent(value: string): value is LoggingMutationIntent {
  return Object.values(LOGGING_MUTATION_INTENT).includes(
    value as LoggingMutationIntent,
  );
}

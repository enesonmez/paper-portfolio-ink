import { z } from "zod";

export const LOGGING_FORM_FIELD = {
  endAt: "endAt",
  endAtOffsetMinutes: "endAtOffsetMinutes",
  intent: "intent",
  startAt: "startAt",
  startAtOffsetMinutes: "startAtOffsetMinutes",
} as const;

export const LOGGING_MUTATION_INTENT = {
  deleteHistory: "delete-history",
  deleteErrors: "delete-errors",
  exportHistory: "export-history",
  exportErrors: "export-errors",
} as const;

export type LoggingMutationIntent =
  (typeof LOGGING_MUTATION_INTENT)[keyof typeof LOGGING_MUTATION_INTENT];

export function isLoggingMutationIntent(value: string): value is LoggingMutationIntent {
  return Object.values(LOGGING_MUTATION_INTENT).includes(
    value as LoggingMutationIntent,
  );
}

export const LOGGING_ACTION_INTENT = {
  deleteHistory: LOGGING_MUTATION_INTENT.deleteHistory,
  deleteErrors: LOGGING_MUTATION_INTENT.deleteErrors,
} as const;

export type LoggingActionIntent =
  (typeof LOGGING_ACTION_INTENT)[keyof typeof LOGGING_ACTION_INTENT];

export function isLoggingActionIntent(value: string): value is LoggingActionIntent {
  return Object.values(LOGGING_ACTION_INTENT).includes(value as LoggingActionIntent);
}

export const LOGGING_QUERY_PARAM = {
  cursor: "cursor",
  direction: "direction",
  tab: "tab",
} as const;

export const LOGGING_PAGINATION_DIRECTION = {
  next: "next",
  previous: "previous",
} as const;

export type LoggingPaginationDirection =
  (typeof LOGGING_PAGINATION_DIRECTION)[keyof typeof LOGGING_PAGINATION_DIRECTION];

const loggingCursorSchema = z.object({
  createdAtIso: z.string().datetime(),
  id: z.string().trim().min(1),
});

export type LoggingCursor = z.infer<typeof loggingCursorSchema>;

export function buildLoggingCursor(input: { createdAt: Date; id: string }): string {
  return JSON.stringify({
    createdAtIso: input.createdAt.toISOString(),
    id: input.id,
  } satisfies LoggingCursor);
}

export function parseLoggingCursor(value: string | null): LoggingCursor | null {
  if (!value) {
    return null;
  }

  try {
    return loggingCursorSchema.parse(JSON.parse(value));
  } catch {
    return null;
  }
}

export function normalizeLoggingPaginationDirection(
  value: string | null,
): LoggingPaginationDirection {
  return value === LOGGING_PAGINATION_DIRECTION.previous
    ? LOGGING_PAGINATION_DIRECTION.previous
    : LOGGING_PAGINATION_DIRECTION.next;
}

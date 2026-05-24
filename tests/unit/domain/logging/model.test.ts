import { describe, expect, it } from "vitest";

import {
  buildLoggingCursor,
  isLoggingActionIntent,
  LOGGING_MUTATION_INTENT,
  normalizeLoggingPaginationDirection,
  parseLoggingCursor,
  isLoggingMutationIntent,
} from "~/domain/logging/model";

describe("logging domain model", () => {
  it("recognizes supported logging mutation intents", () => {
    expect(isLoggingMutationIntent(LOGGING_MUTATION_INTENT.deleteHistory)).toBe(true);
    expect(isLoggingMutationIntent(LOGGING_MUTATION_INTENT.deleteErrors)).toBe(true);
    expect(isLoggingMutationIntent(LOGGING_MUTATION_INTENT.exportHistory)).toBe(true);
    expect(isLoggingMutationIntent(LOGGING_MUTATION_INTENT.exportErrors)).toBe(true);
    expect(isLoggingMutationIntent("archive-errors")).toBe(false);
  });

  it("limits action intents to delete mutations", () => {
    expect(isLoggingActionIntent(LOGGING_MUTATION_INTENT.deleteHistory)).toBe(true);
    expect(isLoggingActionIntent(LOGGING_MUTATION_INTENT.deleteErrors)).toBe(true);
    expect(isLoggingActionIntent(LOGGING_MUTATION_INTENT.exportHistory)).toBe(false);
    expect(isLoggingActionIntent(LOGGING_MUTATION_INTENT.exportErrors)).toBe(false);
  });

  it("encodes and parses pagination cursors safely", () => {
    const createdAt = new Date("2026-03-30T09:00:00.000Z");
    const cursor = buildLoggingCursor({
      createdAt,
      id: "history-1",
    });

    expect(parseLoggingCursor(cursor)).toEqual({
      createdAtIso: createdAt.toISOString(),
      id: "history-1",
    });
    expect(parseLoggingCursor("{")).toBeNull();
    expect(parseLoggingCursor(null)).toBeNull();
  });

  it("normalizes pagination direction to next by default", () => {
    expect(normalizeLoggingPaginationDirection("previous")).toBe("previous");
    expect(normalizeLoggingPaginationDirection("invalid")).toBe("next");
    expect(normalizeLoggingPaginationDirection(null)).toBe("next");
  });
});

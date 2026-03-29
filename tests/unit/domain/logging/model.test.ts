import { describe, expect, it } from "vitest";

import {
  LOGGING_MUTATION_INTENT,
  isLoggingMutationIntent,
} from "~/domain/logging/model";

describe("logging domain model", () => {
  it("recognizes supported logging mutation intents", () => {
    expect(isLoggingMutationIntent(LOGGING_MUTATION_INTENT.deleteErrors)).toBe(true);
    expect(isLoggingMutationIntent(LOGGING_MUTATION_INTENT.exportErrors)).toBe(true);
    expect(isLoggingMutationIntent("archive-errors")).toBe(false);
  });
});

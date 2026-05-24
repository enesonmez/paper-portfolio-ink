import { describe, expect, it } from "vitest";

import {
  parseLoggingRangeFormData,
  parseLoggingRangeSearchParams,
} from "~/lib/logging/logging-range-form.server";
import type { I18nTranslator } from "~/shared/i18n/i18n.shared";

const t: I18nTranslator = (key) => key;

describe("logging range form parser", () => {
  it("converts datetime-local values into UTC date ranges using the submitted offsets", () => {
    const formData = new FormData();
    formData.set("startAt", "2026-03-31T12:46");
    formData.set("startAtOffsetMinutes", "-180");
    formData.set("endAt", "2026-03-31T13:15");
    formData.set("endAtOffsetMinutes", "-180");
    formData.set("intent", "export-history");

    const parsed = parseLoggingRangeFormData(formData, t);

    expect(parsed.startAt.toISOString()).toBe("2026-03-31T09:46:00.000Z");
    expect(parsed.endAt.toISOString()).toBe("2026-03-31T10:15:59.999Z");
  });

  it("applies the same timezone-safe conversion for GET export query params", () => {
    const searchParams = new URLSearchParams({
      endAt: "2026-03-31T13:15",
      endAtOffsetMinutes: "120",
      intent: "export-errors",
      startAt: "2026-03-31T12:46",
      startAtOffsetMinutes: "120",
    });

    const parsed = parseLoggingRangeSearchParams(searchParams, t);

    expect(parsed.startAt.toISOString()).toBe("2026-03-31T14:46:00.000Z");
    expect(parsed.endAt.toISOString()).toBe("2026-03-31T15:15:59.999Z");
  });

  it("rejects submissions that omit timezone offsets for datetime-local values", () => {
    const formData = new FormData();
    formData.set("startAt", "2026-03-31T12:46");
    formData.set("endAt", "2026-03-31T13:15");
    formData.set("intent", "delete-errors");

    try {
      parseLoggingRangeFormData(formData, t);
      throw new Error("Expected parser to reject missing timezone offsets");
    } catch (error) {
      expect(error).toMatchObject({
        code: "logging.range.validation",
        status: 400,
      });
    }
  });
});

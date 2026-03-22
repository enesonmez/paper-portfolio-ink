import { describe, expect, it } from "vitest";

import {
  PUBLIC_THEME,
  PUBLIC_THEME_FORM_FIELD,
  PUBLIC_THEME_INTENT,
  normalizePublicTheme,
} from "~/features/public/layout/theme";

describe("public theme helpers", () => {
  it("normalizes only the dark token and falls back to light", () => {
    expect(normalizePublicTheme(PUBLIC_THEME.dark)).toBe("dark");
    expect(normalizePublicTheme(PUBLIC_THEME.light)).toBe("light");
    expect(normalizePublicTheme("unknown")).toBe("light");
    expect(normalizePublicTheme(null)).toBe("light");
  });

  it("keeps theme intent and field names stable", () => {
    expect(PUBLIC_THEME_INTENT).toEqual({
      setTheme: "set-theme",
    });
    expect(PUBLIC_THEME_FORM_FIELD).toEqual({
      intent: "intent",
      redirectTo: "redirectTo",
      theme: "theme",
    });
  });
});

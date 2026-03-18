import {
  buildThemeCookie,
  getThemeFromRequest,
  parseThemeFormData,
} from "../../app/features/public/layout/public-theme.server";
import { PUBLIC_THEME } from "../../app/features/public/layout/public-layout.shared";

describe("public theme server helpers", () => {
  it("defaults to light theme when the cookie is missing", () => {
    const request = new Request("https://paper-enes-ink.dev/");

    expect(getThemeFromRequest(request)).toBe(PUBLIC_THEME.light);
  });

  it("reads the dark theme from the cookie header", () => {
    const request = new Request("https://paper-enes-ink.dev/blog", {
      headers: {
        Cookie: "paper-theme=dark",
      },
    });

    expect(getThemeFromRequest(request)).toBe(PUBLIC_THEME.dark);
  });

  it("sanitizes external redirect targets from the toggle form", () => {
    const formData = new FormData();
    formData.set("intent", "set-theme");
    formData.set("theme", "dark");
    formData.set("redirectTo", "https://evil.example");

    expect(parseThemeFormData(formData)).toEqual({
      intent: "set-theme",
      redirectTo: "/",
      theme: PUBLIC_THEME.dark,
    });
  });

  it("builds an httpOnly cookie for the selected theme", () => {
    expect(buildThemeCookie(PUBLIC_THEME.dark)).toContain("HttpOnly");
    expect(buildThemeCookie(PUBLIC_THEME.dark)).toContain("paper-theme=dark");
  });
});

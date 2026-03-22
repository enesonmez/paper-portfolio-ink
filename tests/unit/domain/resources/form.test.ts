import { describe, expect, it } from "vitest";

import {
  buildLocaleFormValues,
  buildTranslationFormValues,
  toResourceBooleanValue,
} from "~/domain/resources/form";

describe("resource form values", () => {
  it("converts booleans into resource form values", () => {
    expect(toResourceBooleanValue(true)).toBe("true");
    expect(toResourceBooleanValue(false)).toBe("false");
  });

  it("builds locale defaults and merges overrides", () => {
    expect(buildLocaleFormValues()).toEqual({
      code: "",
      isActive: "true",
      isDefault: "false",
      label: "",
      sortOrder: "0",
    });
    expect(
      buildLocaleFormValues({
        code: "tr",
        isDefault: "true",
        label: "Turkish",
      }),
    ).toMatchObject({
      code: "tr",
      isActive: "true",
      isDefault: "true",
      label: "Turkish",
      sortOrder: "0",
    });
  });

  it("builds translation defaults and merges overrides", () => {
    expect(buildTranslationFormValues()).toEqual({
      key: "",
      locale: "",
      value: "",
    });
    expect(
      buildTranslationFormValues({
        key: "dashboard.layout.navProjects",
        locale: "tr",
        value: "Projeler",
      }),
    ).toEqual({
      key: "dashboard.layout.navProjects",
      locale: "tr",
      value: "Projeler",
    });
  });
});

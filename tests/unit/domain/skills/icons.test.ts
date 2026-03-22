import { describe, expect, it } from "vitest";

import {
  SKILL_DEFAULT_ICON,
  SKILL_ICON,
  buildSkillIconOptions,
  getSkillIcon,
  getSkillIconOption,
  isSkillIconKey,
} from "~/domain/skills/icons";
import { createTranslator, getSeedMessages } from "~/shared/i18n/i18n.shared";

const t = createTranslator(getSeedMessages("tr"));

describe("skill icon helpers", () => {
  it("builds translated icon options and recognizes valid icon keys", () => {
    const options = buildSkillIconOptions(t);

    expect(options).toHaveLength(Object.keys(SKILL_ICON).length);
    expect(options[0]).toMatchObject({
      label: t("skillIcon.cloud.label"),
      value: "cloud",
    });
    expect(isSkillIconKey("workflow")).toBe(true);
    expect(isSkillIconKey("invalid")).toBe(false);
  });

  it("falls back to the default icon for unknown values", () => {
    expect(getSkillIconOption(SKILL_DEFAULT_ICON).value).toBe(SKILL_DEFAULT_ICON);
    expect(getSkillIcon("invalid")).toBe(getSkillIconOption(SKILL_DEFAULT_ICON).icon);
    expect(getSkillIcon("cloud")).toBe(getSkillIconOption("cloud").icon);
  });
});

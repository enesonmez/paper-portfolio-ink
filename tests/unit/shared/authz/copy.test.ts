import { describe, expect, it } from "vitest";

import { buildDashboardAuthorizationCopy } from "~/shared/authz/copy";
import { createTranslator, getSeedMessages } from "~/shared/i18n/i18n.shared";

describe("dashboard authorization copy", () => {
  it("uses the shared default messages when no feature override is provided", () => {
    const t = createTranslator(getSeedMessages("tr"));

    expect(buildDashboardAuthorizationCopy(t)).toEqual({
      actionBlockedTitle: "Islem reddedildi",
      currentRoleLabel: "Oturum rolu",
      forbiddenError: "Bu islemi gerceklestirme yetkiniz bulunmuyor.",
      restrictedDescription: "Bu alani goruntuleme yetkiniz bulunmuyor.",
      restrictedTitle: "Erisim reddedildi",
    });
  });

  it("allows features to override any shared authz message key", () => {
    const t = createTranslator(getSeedMessages("tr"));

    expect(
      buildDashboardAuthorizationCopy(t, {
        actionBlockedTitle: "dashboard.skills.actionBlockedTitle",
        currentRoleLabel: "dashboard.skills.currentRoleLabel",
        forbiddenError: "dashboard.skills.form.error.forbidden",
        restrictedDescription: "dashboard.skills.restrictedDescription",
        restrictedTitle: "dashboard.skills.restrictedTitle",
      }),
    ).toEqual({
      actionBlockedTitle: "Aksiyon engellendi",
      currentRoleLabel: "Mevcut rol",
      forbiddenError: "Bu flow icin erisim yetkiniz yoktur.",
      restrictedDescription: "Bu flow icin erisim yetkiniz yoktur.",
      restrictedTitle: "Kisitli akis",
    });
  });
});

import { describe, expect, it } from "vitest";

import {
  PROJECT_DEFAULT_STATUS,
  PROJECT_FORM_FIELD,
  PROJECT_MUTATION_INTENT,
  PROJECT_STATUS_VALUES,
  buildProjectStatusOptions,
} from "~/domain/projects/model";
import { createTranslator, getSeedMessages } from "~/shared/i18n/i18n.shared";

const t = createTranslator(getSeedMessages("tr"));

describe("project model contracts", () => {
  it("keeps status values and labels stable", () => {
    expect(PROJECT_DEFAULT_STATUS).toBe("draft");
    expect(PROJECT_STATUS_VALUES).toEqual(["draft", "published", "archived"]);
    expect(buildProjectStatusOptions(t)).toEqual([
      {
        label: t("model.projectStatus.draft"),
        value: "draft",
      },
      {
        label: t("model.projectStatus.published"),
        value: "published",
      },
      {
        label: t("model.projectStatus.archived"),
        value: "archived",
      },
    ]);
  });

  it("keeps project mutation intents and form field names stable", () => {
    expect(PROJECT_MUTATION_INTENT).toEqual({
      create: "create",
      delete: "delete",
      update: "update",
    });
    expect(PROJECT_FORM_FIELD).toMatchObject({
      isFeatured: "isFeatured",
      liveUrl: "liveUrl",
      projectId: "projectId",
      sortOrder: "sortOrder",
    });
  });
});

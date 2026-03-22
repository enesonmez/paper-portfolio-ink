import { describe, expect, it } from "vitest";

import {
  POST_DEFAULT_STATUS,
  POST_FORM_FIELD,
  POST_MUTATION_INTENT,
  POST_STATUS_VALUES,
  buildPostStatusOptions,
} from "~/domain/posts/model";
import { createTranslator, getSeedMessages } from "~/shared/i18n/i18n.shared";

const t = createTranslator(getSeedMessages("tr"));

describe("post model contracts", () => {
  it("keeps status values and labels stable", () => {
    expect(POST_DEFAULT_STATUS).toBe("draft");
    expect(POST_STATUS_VALUES).toEqual(["draft", "published", "archived"]);
    expect(buildPostStatusOptions(t)).toEqual([
      {
        label: t("model.postStatus.draft"),
        value: "draft",
      },
      {
        label: t("model.postStatus.published"),
        value: "published",
      },
      {
        label: t("model.postStatus.archived"),
        value: "archived",
      },
    ]);
  });

  it("keeps post mutation intents and form field names stable", () => {
    expect(POST_MUTATION_INTENT).toEqual({
      create: "create",
      delete: "delete",
      update: "update",
    });
    expect(POST_FORM_FIELD).toMatchObject({
      content: "content",
      postId: "postId",
      publishedAt: "publishedAt",
      status: "status",
    });
  });
});

import { describe, expect, it } from "vitest";

import { authorizeLocaleMutationOrThrow } from "~/features/dashboard/resources/locales/operations/_shared/authorization.server";
import { authorizeTranslationMutationOrThrow } from "~/features/dashboard/resources/translations/operations/_shared/authorization.server";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";

const formCopy = {
  cancelLabel: "cancel",
  errors: {
    createLocaleDuplicateCode: "create-locale-duplicate",
    createTranslationDuplicateKey: "create-translation-duplicate",
    deleteLocaleMissing: "delete-locale-missing",
    deleteLocaleRestricted: "delete-locale-restricted",
    deleteTranslationMissing: "delete-translation-missing",
    forbidden: "forbidden",
    localeMissing: "locale-missing",
    translationLocaleMissing: "translation-locale-missing",
    translationMissing: "translation-missing",
    updateLocaleDuplicateCode: "update-locale-duplicate",
    updateLocaleMissing: "update-locale-missing",
    updateTranslationDuplicateKey: "update-translation-duplicate",
    updateTranslationMissing: "update-translation-missing",
  },
  locale: {
    activeLabel: "active",
    activeOptions: {
      false: "inactive",
      true: "active",
    },
    code: {
      label: "code",
      placeholder: "code",
    },
    defaultLabel: "default",
    defaultOptions: {
      false: "no",
      true: "yes",
    },
    label: {
      label: "label",
      placeholder: "label",
    },
    sortOrder: {
      label: "sort-order",
      placeholder: "sort-order",
    },
  },
  translation: {
    key: {
      label: "key",
      placeholder: "key",
    },
    locale: {
      label: "locale",
    },
    search: {
      label: "search",
      placeholder: "search",
    },
    value: {
      label: "value",
      placeholder: "value",
    },
  },
} as const;

describe("dashboard resources mutation authorization", () => {
  it("requires the claim mapped to locale intents", () => {
    let thrownError: unknown;

    try {
      authorizeLocaleMutationOrThrow({
        actor: {
          authzVersion: 1,
          claims: [AUTHORIZATION_CLAIM.resourcesLocalesCreate],
          role: "author",
          userId: "user-author",
        },
        formCopy,
        intent: "delete-locale",
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toMatchObject({
      code: "resources.locales.delete.forbidden",
      details: {
        intent: "delete-locale",
        requiredClaim: AUTHORIZATION_CLAIM.resourcesLocalesDelete,
      },
      responseData: {
        actionError: "forbidden",
      },
      status: 403,
    });
  });

  it("requires the claim mapped to translation intents", () => {
    let thrownError: unknown;

    try {
      authorizeTranslationMutationOrThrow({
        actor: {
          authzVersion: 1,
          claims: [AUTHORIZATION_CLAIM.resourcesTranslationsCreate],
          role: "author",
          userId: "user-author",
        },
        formCopy,
        intent: "update-translation",
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toMatchObject({
      code: "resources.translations.update.forbidden",
      details: {
        intent: "update-translation",
        requiredClaim: AUTHORIZATION_CLAIM.resourcesTranslationsUpdate,
      },
      responseData: {
        actionError: "forbidden",
      },
      status: 403,
    });
  });
});

import {
  APP_ERROR_ACTION,
  APP_ERROR_CODE,
  APP_ERROR_RESOURCE,
} from "~/shared/errors/contracts";
import { AppError } from "~/shared/errors/app-error.server";
import { assertSameOriginMutationRequest } from "~/shared/security/csrf.server";

describe("csrf security guard", () => {
  const requestUrl = "https://paper-portfolio-ink.dev/dashboard/posts";

  function captureGuardError(request: Request) {
    try {
      assertSameOriginMutationRequest({
        action: APP_ERROR_ACTION.mutate,
        code: APP_ERROR_CODE.security.csrf.invalidOrigin,
        request,
        resource: APP_ERROR_RESOURCE.posts,
      });
      return null;
    } catch (error) {
      return error;
    }
  }

  it("accepts matching origin headers", () => {
    const request = new Request(requestUrl, {
      headers: {
        origin: "https://paper-portfolio-ink.dev",
        "sec-fetch-site": "same-origin",
      },
      method: "POST",
    });

    expect(captureGuardError(request)).toBeNull();
  });

  it("accepts matching referer headers when origin is missing", () => {
    const request = new Request(requestUrl, {
      headers: {
        referer: "https://paper-portfolio-ink.dev/dashboard/posts?intent=create",
        "sec-fetch-site": "same-origin",
      },
      method: "POST",
    });

    expect(captureGuardError(request)).toBeNull();
  });

  it("rejects cross-site requests", () => {
    const request = new Request(requestUrl, {
      headers: {
        origin: "https://evil.example",
        "sec-fetch-site": "cross-site",
      },
      method: "POST",
    });

    expect(captureGuardError(request)).toMatchObject({
      code: "security.csrf.invalid_origin",
      status: 403,
    });
  });

  it("rejects requests missing both origin and referer", () => {
    const request = new Request(requestUrl, {
      headers: {
        "sec-fetch-site": "same-origin",
      },
      method: "POST",
    });

    expect(captureGuardError(request)).toBeInstanceOf(AppError);
    expect(captureGuardError(request)).toMatchObject({
      code: "security.csrf.invalid_origin",
      status: 403,
    });
  });
});

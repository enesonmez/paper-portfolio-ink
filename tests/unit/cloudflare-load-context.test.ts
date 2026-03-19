import { beforeEach, describe, expect, it, vi } from "vitest";

const { createAppDbMock, createRuntimeContextMock } = vi.hoisted(() => {
  return {
    createAppDbMock: vi.fn(),
    createRuntimeContextMock: vi.fn(),
  };
});

vi.mock("../../db", () => {
  return {
    createAppDb: createAppDbMock,
  };
});

vi.mock("../../app/runtime.server", () => {
  return {
    createRuntimeContext: createRuntimeContextMock,
  };
});

describe("cloudflare load context", () => {
  beforeEach(() => {
    createAppDbMock.mockReset();
    createRuntimeContextMock.mockReset();
  });

  it("maps Cloudflare env bindings into the app load context", async () => {
    const request = new Request("https://paper-portfolio-ink.dev/dashboard");
    const db = { query: {} };
    const runtime = { platform: "cloudflare" };
    const { createCloudflareLoadContext } = await import("../../workers/load-context");

    createAppDbMock.mockReturnValue(db);
    createRuntimeContextMock.mockReturnValue(runtime);

    expect(
      createCloudflareLoadContext({
        request,
        env: {
          DB: { prepare: vi.fn() } as unknown as D1Database,
          BETTER_AUTH_SECRET: "0123456789-0123456789-0123456789-0123",
          BETTER_AUTH_URL: "https://paper-portfolio-ink.dev",
        },
      }),
    ).toEqual({
      auth: {
        baseURL: "https://paper-portfolio-ink.dev",
        secret: "0123456789-0123456789-0123456789-0123",
        trustedOrigins: ["https://paper-portfolio-ink.dev"],
      },
      db,
      runtime,
    });
  });
});

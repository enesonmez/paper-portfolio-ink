import { describe, expect, it, vi } from "vitest";

const { handleDashboardResourcesActionMock } = vi.hoisted(() => ({
  handleDashboardResourcesActionMock: vi.fn(),
}));

vi.mock("~/features/dashboard/resources/server", () => ({
  handleDashboardResourcesAction: handleDashboardResourcesActionMock,
}));

import { action as indexAction } from "~/routes/dashboard/resources/index";
import { action as localesAction } from "~/routes/dashboard/resources/locales";
import { action as translationsAction } from "~/routes/dashboard/resources/translations";

function buildActionArgs<TAction extends (args: never) => unknown>(request: Request) {
  const context = {} as never;

  return {
    context,
    params: {},
    request,
    unstable_pattern: "",
  } as Parameters<TAction>[0];
}

describe("dashboard resources child route modules", () => {
  it("delegates index action submissions to the shared resources action", async () => {
    const request = new Request("https://example.com/tr/dashboard/resources", {
      method: "POST",
    });
    const response = new Response(null, { status: 204 });
    handleDashboardResourcesActionMock.mockResolvedValueOnce(response);
    const args = buildActionArgs<typeof indexAction>(request);

    const result = await indexAction(args);

    expect(handleDashboardResourcesActionMock).toHaveBeenCalledWith(
      args.context,
      request,
    );
    expect(result).toBe(response);
  });

  it("delegates locales action submissions to the shared resources action", async () => {
    const request = new Request("https://example.com/tr/dashboard/resources/locales", {
      method: "POST",
    });
    const response = new Response(null, { status: 204 });
    handleDashboardResourcesActionMock.mockResolvedValueOnce(response);
    const args = buildActionArgs<typeof localesAction>(request);

    const result = await localesAction(args);

    expect(handleDashboardResourcesActionMock).toHaveBeenCalledWith(
      args.context,
      request,
    );
    expect(result).toBe(response);
  });

  it("delegates translations action submissions to the shared resources action", async () => {
    const request = new Request(
      "https://example.com/tr/dashboard/resources/translations",
      {
        method: "POST",
      },
    );
    const response = new Response(null, { status: 204 });
    handleDashboardResourcesActionMock.mockResolvedValueOnce(response);
    const args = buildActionArgs<typeof translationsAction>(request);

    const result = await translationsAction(args);

    expect(handleDashboardResourcesActionMock).toHaveBeenCalledWith(
      args.context,
      request,
    );
    expect(result).toBe(response);
  });
});

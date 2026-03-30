import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, beforeEach, vi } from "vitest";

import { getSeedMessages, getSeedLocaleOptions } from "~/shared/i18n/i18n.shared";
import { PublicBlogScreen } from "~/features/public/blog/ui/screen";
import { meta } from "~/routes/public/blog/index";

const posts = [
  {
    authorName: "Enes Sonmez",
    coverImageUrl: "https://images.paper-portfolio-ink.dev/edge-observability.webp",
    excerpt:
      "Cloudflare edge runtime uzerinde izleme, log korelasyonu ve deploy ritmi icin notlar.",
    publishedAtIso: "2026-03-18T10:00:00.000Z",
    publishedAtLabel: "18 Mar 2026",
    readingTimeMinutes: 6,
    slug: "edge-observability-playbook",
    title: "Edge Observability Playbook",
  },
  {
    authorName: "Enes Sonmez",
    coverImageUrl: null,
    excerpt:
      "D1 migration sirasinda bozulmayan bir release akisi kurmak icin izledigim adimlar.",
    publishedAtIso: "2026-03-12T09:00:00.000Z",
    publishedAtLabel: "12 Mar 2026",
    readingTimeMinutes: 4,
    slug: "zero-downtime-d1-migrations",
    title: "Zero Downtime D1 Migrations",
  },
];

describe("blog route", () => {
  const intersectionObserverMock = vi.fn();

  beforeEach(() => {
    intersectionObserverMock.mockReset();
    class IntersectionObserverMock {
      constructor(callback: IntersectionObserverCallback) {
        intersectionObserverMock(callback);
      }

      disconnect() {}

      observe() {}

      unobserve() {}
    }

    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders a lead story feed with sidebar sections", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/blog",
          element: (
            <PublicBlogScreen
              nextCursor='{"createdAtIso":"2026-03-18T10:00:00.000Z","publishedAtIso":"2026-03-18T10:00:00.000Z","slug":"edge-observability-playbook","updatedAtIso":"2026-03-19T10:00:00.000Z"}'
              posts={posts}
            />
          ),
        },
      ],
      {
        initialEntries: ["/blog"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Field Notes From the Edge" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "Edge Observability Playbook" })[0],
    ).toHaveAttribute("href", "/blog/edge-observability-playbook");
    expect(screen.getByText("Notebook index")).toBeInTheDocument();
    expect(screen.getByText("Recent topics")).toBeInTheDocument();
    expect(screen.getByText("6 min read")).toBeInTheDocument();
    expect(screen.getByText("Scroll to load more notes")).toBeInTheDocument();
    expect(
      screen.getByText("Automatic loading continues as you scroll."),
    ).toBeInTheDocument();
  });

  it("returns SEO metadata for the public blog index", () => {
    const rootData = {
      locale: "tr" as const,
      messages: getSeedMessages("tr"),
      supportedLocales: getSeedLocaleOptions(),
      theme: "light" as const,
    };

    expect(
      meta({
        location: {
          hash: "",
          key: "default",
          pathname: "/blog",
          search: "",
          state: null,
          unstable_mask: undefined,
        },
        matches: [{ data: rootData, id: "root" }],
      } as never),
    ).toEqual(
      expect.arrayContaining([
        { title: "Blog | Paper Ink" },
        {
          name: "description",
          content: "Edge-first teknik notlar, mimari denemeler ve uygulama gunlukleri.",
        },
        {
          property: "og:title",
          content: "Blog | Paper Ink",
        },
      ]),
    );
  });
});

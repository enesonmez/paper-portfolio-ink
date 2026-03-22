import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PublicProjectsScreen } from "~/features/public/projects/screen";

const baseProjects = [
  {
    coverImageUrl: "https://images.paper-portfolio-ink.dev/paper-portfolio-ink.webp",
    createdAtLabel: "2026-03-18",
    description: "Public portfolio and publishing workflow on Cloudflare.",
    isFeatured: true,
    liveUrl: "https://paper-portfolio-ink.dev",
    repositoryUrl: "https://github.com/enesonmez/paper-portfolio-ink",
    slug: "paper-portfolio-ink",
    summary: "Portfolio, blog, and dashboard stack tuned for Cloudflare.",
    title: "Paper Enes Ink",
  },
];

const intersectionObserverMock = vi.fn();

describe("ProjectsPage", () => {
  beforeEach(() => {
    intersectionObserverMock.mockReset();

    class IntersectionObserverMock {
      disconnect = vi.fn();
      observe = intersectionObserverMock;
      unobserve = vi.fn();
    }

    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      writable: true,
      value: IntersectionObserverMock,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders published project cards and the scroll loading hint", () => {
    render(
      <RouterProvider
        router={createMemoryRouter(
          [
            {
              element: (
                <PublicProjectsScreen
                  nextCursor='{"createdAtIso":"2026-03-18T10:00:00.000Z","isFeatured":true,"slug":"paper-portfolio-ink","sortOrder":0}'
                  projects={baseProjects}
                  stats={{
                    featuredCount: 1,
                    liveCount: 1,
                    totalCount: 8,
                  }}
                />
              ),
              path: "/projects",
            },
            {
              loader: () => ({ nextCursor: null, projects: [] }),
              path: "/projects/feed",
            },
          ],
          {
            initialEntries: ["/projects"],
          },
        )}
      />,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Projects That Ship With Sharp Edges.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Paper Enes Ink")).toBeInTheDocument();
    expect(screen.getAllByText("Featured").length).toBeGreaterThan(0);
    expect(screen.getByText("Scroll to load more projects")).toBeInTheDocument();
    expect(intersectionObserverMock).toHaveBeenCalled();
  });

  it("renders an empty state when no published project exists", () => {
    render(
      <RouterProvider
        router={createMemoryRouter(
          [
            {
              element: (
                <PublicProjectsScreen
                  nextCursor={null}
                  projects={[]}
                  stats={{
                    featuredCount: 0,
                    liveCount: 0,
                    totalCount: 0,
                  }}
                />
              ),
              path: "/projects",
            },
          ],
          {
            initialEntries: ["/projects"],
          },
        )}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "No public projects yet." }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Scroll to load more projects")).not.toBeInTheDocument();
  });
});

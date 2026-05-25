import { render, screen } from "@testing-library/react";
import { createMemoryRouter, MemoryRouter, RouterProvider } from "react-router";
import type * as ReactRouterModule from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PublicHomeScreen } from "~/features/public/home/ui/screen";
import { getSeedMessages, getSeedLocaleOptions } from "~/shared/i18n/i18n.shared";
import { PublicSiteLayout } from "~/features/public/layout/layout";
import { PUBLIC_THEME } from "~/features/public/layout/theme";
import { meta } from "~/routes/public/home";

const { useRouteLoaderDataMock } = vi.hoisted(() => ({
  useRouteLoaderDataMock: vi.fn(),
}));

vi.mock("react-router", async (importOriginal) => {
  const actual: typeof ReactRouterModule = await importOriginal();

  return {
    ...actual,
    useRouteLoaderData: useRouteLoaderDataMock,
  };
});

const featuredProjects = [
  {
    createdAtLabel: "2026-03-18",
    description: "Edge-first portfolio stack with CMS-grade editorial flows.",
    liveUrl: "https://paper-portfolio-ink.dev",
    repositoryUrl: "https://github.com/enesonmez/paper-portfolio-ink",
    slug: "paper-portfolio-ink",
    summary: "Portfolio, blog, and dashboard stack tuned for Cloudflare.",
    title: "Paper Enes Ink",
  },
];

const skills = [
  {
    iconKey: "workflow" as const,
    name: "React Router",
    sortOrder: 0,
    summary: "Typed routing, loader/action data flows, and SSR-first delivery.",
  },
];

describe("HomePage", () => {
  beforeEach(() => {
    useRouteLoaderDataMock.mockReset();
    useRouteLoaderDataMock.mockReturnValue(undefined);
  });

  it("renders the hero, featured work, stack, and resume sections", () => {
    render(
      <MemoryRouter>
        <PublicHomeScreen featuredProjects={featuredProjects} skills={skills} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Hello, I am Paper/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View projects" })).toHaveAttribute(
      "href",
      "/projects",
    );
    expect(screen.getByRole("link", { name: "Read the blog" })).toHaveAttribute(
      "href",
      "/blog",
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "Featured projects" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Paper Enes Ink")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Tech stack" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Resume snapshot" }),
    ).toBeInTheDocument();
  });

  it("omits the featured projects section when there is no featured project", () => {
    render(
      <MemoryRouter>
        <PublicHomeScreen featuredProjects={[]} skills={skills} />
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole("heading", { level: 2, name: "Featured projects" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Tech stack" }),
    ).toBeInTheDocument();
  });

  it("omits the tech stack section when there is no skill entry", () => {
    render(
      <MemoryRouter>
        <PublicHomeScreen featuredProjects={featuredProjects} skills={[]} />
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole("heading", { level: 2, name: "Tech stack" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Resume snapshot" }),
    ).toBeInTheDocument();
  });

  it("uses configured site identity and contact links on the public surface", () => {
    useRouteLoaderDataMock.mockReturnValue({
      configuration: {
        "contact.email": "hello@example.dev",
        "site.domainUrl": "https://portfolio.example.dev",
        "site.name": "Example Portfolio",
        "social.github": "https://github.com/example",
        "social.instagram": "https://instagram.com/example",
        "social.linkedin": "https://linkedin.com/in/example",
        "social.x": "https://x.com/example",
      },
      locale: "en" as const,
      messages: getSeedMessages("en"),
      supportedLocales: getSeedLocaleOptions(),
      theme: PUBLIC_THEME.light,
    });

    const router = createMemoryRouter([
      {
        element: (
          <PublicSiteLayout theme={PUBLIC_THEME.light}>
            <PublicHomeScreen featuredProjects={featuredProjects} skills={skills} />
          </PublicSiteLayout>
        ),
        path: "/",
      },
    ]);

    render(<RouterProvider router={router} />);

    expect(screen.getAllByText("Example Portfolio").length).toBeGreaterThan(0);
    expect(
      screen
        .getAllByRole("link", { name: "GitHub" })
        .some((link) => link.getAttribute("href") === "https://github.com/example"),
    ).toBe(true);
    expect(
      screen
        .getAllByRole("link", { name: "LinkedIn" })
        .some(
          (link) => link.getAttribute("href") === "https://linkedin.com/in/example",
        ),
    ).toBe(true);
    expect(
      screen
        .getAllByRole("link", { name: "X" })
        .some((link) => link.getAttribute("href") === "https://x.com/example"),
    ).toBe(true);
    expect(
      screen
        .getAllByRole("link", { name: "Instagram" })
        .some((link) => link.getAttribute("href") === "https://instagram.com/example"),
    ).toBe(true);
    expect(document.querySelector('a[href="mailto:hello@example.dev"]')).not.toBeNull();
  });

  it("hides optional social links when their configuration value is empty", () => {
    useRouteLoaderDataMock.mockReturnValue({
      configuration: {
        "contact.email": "hello@example.dev",
        "site.domainUrl": "https://portfolio.example.dev",
        "site.name": "Example Portfolio",
        "social.github": "https://github.com/example",
        "social.instagram": "",
        "social.linkedin": "",
        "social.x": "",
      },
      locale: "en" as const,
      messages: getSeedMessages("en"),
      supportedLocales: getSeedLocaleOptions(),
      theme: PUBLIC_THEME.light,
    });

    const router = createMemoryRouter([
      {
        element: (
          <PublicSiteLayout theme={PUBLIC_THEME.light}>
            <PublicHomeScreen featuredProjects={featuredProjects} skills={skills} />
          </PublicSiteLayout>
        ),
        path: "/",
      },
    ]);

    render(<RouterProvider router={router} />);

    expect(
      document.querySelectorAll('a[href="https://github.com/example"]').length,
    ).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: /^X$/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^Instagram$/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^LinkedIn$/ })).not.toBeInTheDocument();
  });

  it("returns home metadata with the configured site name", () => {
    expect(
      meta({
        matches: [
          {
            data: {
              configuration: {
                "contact.email": "hello@example.dev",
                "site.domainUrl": "https://portfolio.example.dev",
                "site.name": "Example Portfolio",
                "social.github": "https://github.com/example",
                "social.instagram": "https://instagram.com/example",
                "social.linkedin": "https://linkedin.com/in/example",
                "social.x": "https://x.com/example",
              },
              locale: "en" as const,
              messages: getSeedMessages("en"),
              supportedLocales: getSeedLocaleOptions(),
              theme: PUBLIC_THEME.light,
            },
            id: "root",
          },
        ],
      } as never),
    ).toEqual(
      expect.arrayContaining([
        { title: "Example Portfolio | Edge-First Portfolio and Notes" },
      ]),
    );
  });
});

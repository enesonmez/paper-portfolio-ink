import { render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";

import { AppI18nProvider } from "~/shared/i18n/i18n-react";
import { getSeedMessages, getSeedLocaleOptions } from "~/shared/i18n/i18n.shared";
import { PUBLIC_THEME } from "~/features/public/layout/theme";
import { PublicSiteLayout } from "~/features/public/layout/layout";

describe("PublicSiteLayout", () => {
  it("renders the header navigation, theme toggle, and footer content", () => {
    const router = createMemoryRouter([
      {
        path: "/",
        element: (
          <PublicSiteLayout theme={PUBLIC_THEME.light}>
            <div>Home content</div>
          </PublicSiteLayout>
        ),
      },
    ]);

    render(<RouterProvider router={router} />);

    expect(
      screen
        .getAllByRole("link", { name: "Home" })
        .some((link) => link.getAttribute("href") === "/"),
    ).toBe(true);
    expect(
      screen
        .getAllByRole("link", { name: "Projects" })
        .some((link) => link.getAttribute("href") === "/projects"),
    ).toBe(true);
    expect(screen.getByLabelText("Toggle navigation")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Theme: Comic Noir/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to top" })).toHaveAttribute(
      "href",
      "#top",
    );
    expect(
      screen.getByText(/Edge-first notes, pixel-sharp interfaces/i),
    ).toBeInTheDocument();
  });

  it("uses locale-prefixed links and form actions when wrapped with i18n context", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/:locale/projects",
          element: (
            <AppI18nProvider
              value={{
                locale: "tr",
                messages: getSeedMessages("tr"),
                supportedLocales: getSeedLocaleOptions(),
              }}
            >
              <PublicSiteLayout theme={PUBLIC_THEME.light}>
                <div>Projects content</div>
              </PublicSiteLayout>
            </AppI18nProvider>
          ),
        },
      ],
      {
        initialEntries: ["/tr/projects"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen
        .getAllByRole("link", { name: "Ana sayfa" })
        .some((link) => link.getAttribute("href") === "/tr"),
    ).toBe(true);
    expect(
      screen
        .getAllByRole("link", { name: "Blog" })
        .some((link) => link.getAttribute("href") === "/tr/blog"),
    ).toBe(true);
    expect(
      screen
        .getAllByRole("link", { name: "Projeler" })
        .some((link) => link.getAttribute("href") === "/tr/projects"),
    ).toBe(true);

    const themeForm = screen.getByRole("button", { name: /Tema:/i }).closest("form");
    expect(themeForm).toHaveAttribute("action", "/tr/theme");

    expect(
      screen
        .getAllByRole("button", { name: "EN" })
        .some(
          (button) => button.closest("form")?.getAttribute("action") === "/tr/locale",
        ),
    ).toBe(true);
  });

  it("keeps the home nav item inactive on the projects page", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/projects",
          element: (
            <PublicSiteLayout theme={PUBLIC_THEME.light}>
              <div>Projects content</div>
            </PublicSiteLayout>
          ),
        },
      ],
      {
        initialEntries: ["/projects"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen
        .getAllByRole("link", { name: "Home" })
        .every((link) => link.getAttribute("aria-current") !== "page"),
    ).toBe(true);
    expect(
      screen
        .getAllByRole("link", { name: "Projects" })
        .some((link) => link.getAttribute("aria-current") === "page"),
    ).toBe(true);
  });

  it("renders locale switching inside the mobile menu panel", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/:locale/projects",
          element: (
            <AppI18nProvider
              value={{
                locale: "tr",
                messages: getSeedMessages("tr"),
                supportedLocales: getSeedLocaleOptions(),
              }}
            >
              <PublicSiteLayout theme={PUBLIC_THEME.light}>
                <div>Projects content</div>
              </PublicSiteLayout>
            </AppI18nProvider>
          ),
        },
      ],
      {
        initialEntries: ["/tr/projects"],
      },
    );

    render(<RouterProvider router={router} />);

    const mobileNavigation = screen.getByRole("navigation", {
      name: /Mobil public navigasyon/i,
    });
    const localeButtons = within(mobileNavigation).getAllByRole("button", {
      name: /TR|EN/,
    });

    expect(localeButtons).toHaveLength(2);
  });
});

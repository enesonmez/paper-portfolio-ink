import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";

import { PUBLIC_THEME } from "../../app/features/public/layout/public-layout.shared";
import { PublicSiteLayout } from "../../app/features/public/layout/public-site-layout";

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

    render(
      <RouterProvider router={router} />,
    );

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
    expect(screen.getByRole("button", { name: /Theme: Comic Noir/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back To Top" })).toHaveAttribute(
      "href",
      "#top",
    );
    expect(
      screen.getByText(/Edge-first notlar, piksel sertliginde arayuzler/i),
    ).toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

describe("dashboard layout", () => {
  it("renders the admin shell with sidebar, header, and child content", async () => {
    const { default: DashboardLayout } = await import("../../app/routes/dashboard");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard",
          loader: () => ({
            user: {
              displayName: "Enes Admin",
              email: "admin@paper-portfolio-ink.local",
              role: "admin",
              initials: "EA",
            },
          }),
          element: <DashboardLayout />,
          children: [
            {
              index: true,
              element: <section>Child dashboard content</section>,
            },
          ],
        },
      ],
      {
        initialEntries: ["/dashboard"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(await screen.findByText("Admin Portal")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Open navigation menu" }),
    ).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    expect(
      screen.getByRole("button", { name: "Open navigation menu" }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Dashboard Live" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Posts Live" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Users Live" })).toBeInTheDocument();
    expect(screen.getByText("System Status: Logged In")).toBeInTheDocument();
    expect(screen.getByText("Enes Admin")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Logout current admin session" }),
    ).toBeInTheDocument();
    const logoutForm = screen
      .getByRole("button", { name: "Logout current admin session" })
      .closest("form");
    expect(logoutForm).toHaveAttribute("action", "/logout");
    expect(screen.getByText("Child dashboard content")).toBeInTheDocument();
  });

  it("hides the users navigation link for non-admin roles", async () => {
    const { default: DashboardLayout } = await import("../../app/routes/dashboard");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard",
          loader: () => ({
            user: {
              displayName: "Ayla Author",
              email: "author@paper-portfolio-ink.local",
              role: "author",
              initials: "AA",
            },
          }),
          element: <DashboardLayout />,
          children: [
            {
              index: true,
              element: <section>Child dashboard content</section>,
            },
          ],
        },
      ],
      {
        initialEntries: ["/dashboard"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.queryByRole("link", { name: "Users Live" })).not.toBeInTheDocument();
  });
});

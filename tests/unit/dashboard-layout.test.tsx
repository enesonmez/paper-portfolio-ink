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
              email: "admin@paper-enes-ink.local",
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
});

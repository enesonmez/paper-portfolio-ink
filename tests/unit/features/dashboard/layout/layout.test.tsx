import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import { DashboardHeader } from "~/features/dashboard/layout/components/dashboard-header";
import { DashboardSidebar } from "~/features/dashboard/layout/components/dashboard-sidebar";

function DashboardLayoutHarness({
  child,
  user,
}: {
  child: string;
  user: {
    displayName: string;
    email: string;
    id: string;
    initials: string;
    role: "admin" | "author";
  };
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar
        isSidebarOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
      />
      <main className="flex flex-1 flex-col">
        <DashboardHeader
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((current) => !current)}
          user={user}
        />
        <div>{child}</div>
      </main>
    </div>
  );
}

describe("dashboard layout", () => {
  it("renders the admin shell with sidebar, header, and child content", async () => {
    const router = createMemoryRouter(
      [
        {
          path: "/dashboard",
          element: (
            <DashboardLayoutHarness
              child="Child dashboard content"
              user={{
                displayName: "Enes Admin",
                email: "admin@paper-portfolio-ink.local",
                id: "user-admin",
                initials: "EA",
                role: "admin",
              }}
            />
          ),
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
    expect(screen.getByRole("link", { name: "Resources Live" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Skills Live" })).toBeInTheDocument();
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
  }, 20000);

  it("hides the users navigation link for non-admin roles", async () => {
    const router = createMemoryRouter(
      [
        {
          path: "/dashboard",
          element: (
            <DashboardLayoutHarness
              child="Child dashboard content"
              user={{
                displayName: "Ayla Author",
                email: "author@paper-portfolio-ink.local",
                id: "user-author",
                initials: "AA",
                role: "author",
              }}
            />
          ),
        },
      ],
      {
        initialEntries: ["/dashboard"],
      },
    );

    render(<RouterProvider router={router} />);

    await screen.findByText("Admin Portal");
    expect(
      screen.queryByRole("link", { name: "Resources Live" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Users Live" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Skills Live" })).not.toBeInTheDocument();
  }, 20000);
});

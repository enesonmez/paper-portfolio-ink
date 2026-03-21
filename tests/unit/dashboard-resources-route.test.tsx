import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

const baseScreenProps = {
  activeTab: "locales" as const,
  localeForm: {
    editingCode: null,
    errors: {},
    isOpen: false,
    mode: null,
    values: {
      code: "",
      isActive: "true" as const,
      isDefault: "false" as const,
      label: "",
      sortOrder: "0",
    },
  },
  locales: [
    {
      code: "tr",
      createdAtLabel: "2026-03-21",
      isActive: true,
      isDefault: true,
      label: "TR",
      sortOrder: 0,
      translationCount: 4,
      updatedAtLabel: "2026-03-21",
    },
  ],
  metrics: {
    activeLocales: 1,
    selectedLocaleTranslations: 1,
    totalLocales: 1,
    totalTranslations: 4,
  },
  selectedTranslationLocale: "tr",
  translationPagination: {
    currentPage: 1,
    pageCount: 1,
    pageSize: 20,
    totalItems: 1,
  },
  translationSearchQuery: "",
  translationForm: {
    editingKey: null,
    editingLocale: null,
    errors: {},
    isOpen: false,
    mode: null,
    values: {
      key: "",
      locale: "tr",
      value: "",
    },
  },
  translations: [
    {
      createdAtLabel: "2026-03-21",
      key: "dashboard.layout.navDashboard",
      locale: "tr",
      updatedAtLabel: "2026-03-21",
      value: "Dashboard",
    },
  ],
};

describe("dashboard resources route", () => {
  it("renders the locale registry tab with create trigger", async () => {
    const { DashboardResourcesScreen } =
      await import("../../app/routes/dashboard.resources");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/resources",
          element: <DashboardResourcesScreen {...baseScreenProps} />,
        },
      ],
      {
        initialEntries: ["/dashboard/resources"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Resource settings" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Total locales")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create locale" })).toBeInTheDocument();
    expect(screen.getByText("Cache-first settings")).toBeInTheDocument();
    expect(screen.getByText("tr")).toBeInTheDocument();
  }, 20000);

  it("renders the translation tab and translation modal when requested", async () => {
    const { DashboardResourcesScreen } =
      await import("../../app/routes/dashboard.resources");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/resources",
          element: (
            <DashboardResourcesScreen
              {...baseScreenProps}
              activeTab="translations"
              translationPagination={{
                currentPage: 2,
                pageCount: 3,
                pageSize: 20,
                totalItems: 41,
              }}
              translationForm={{
                ...baseScreenProps.translationForm,
                isOpen: true,
                mode: "create",
              }}
            />
          ),
        },
      ],
      {
        initialEntries: [
          "/dashboard/resources?tab=translations&modal=create-translation",
        ],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText("Translation locale filter")).toBeInTheDocument();
    expect(screen.getByLabelText("Search")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Previous" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Next" })).toBeInTheDocument();
    expect(
      screen.getByRole("dialog", { name: "Create translation" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Message key")).toBeInTheDocument();
    expect(screen.getByLabelText("Value")).toBeInTheDocument();
  }, 20000);

  it("renders a restricted screen for non-admin viewers", async () => {
    const { DashboardResourcesAccessDeniedScreen } =
      await import("../../app/routes/dashboard.resources");

    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/resources",
          element: <DashboardResourcesAccessDeniedScreen viewerRole="author" />,
        },
      ],
      {
        initialEntries: ["/dashboard/resources"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Restricted flow" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Current role: author")).toBeInTheDocument();
  });
});

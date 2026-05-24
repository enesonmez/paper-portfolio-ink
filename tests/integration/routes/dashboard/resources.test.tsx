import { render, screen } from "@testing-library/react";
import { Outlet, createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import {
  DashboardResourcesAccessDeniedScreen,
  DashboardResourcesLayout,
} from "~/features/dashboard/resources/layout/screen";
import DashboardResourcesLocalesScreen from "~/features/dashboard/resources/locales/screen";
import DashboardResourcesTranslationsScreen from "~/features/dashboard/resources/translations/screen";

const baseRouteContext = {
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
  permissions: {
    locales: {
      canCreate: true,
      canDelete: true,
      canRead: true,
      canUpdate: true,
    },
    translations: {
      canCreate: true,
      canDelete: true,
      canRead: true,
      canUpdate: true,
    },
  },
  selectedTranslationLocale: "tr",
  translationPagination: {
    currentCursor: null,
    direction: "next" as const,
    hasNextPage: false,
    hasPreviousPage: false,
    nextCursor: null,
    pageSize: 20,
    previousCursor: null,
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
  it("renders the locale registry path with create trigger", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/resources",
          element: (
            <DashboardResourcesLayout
              currentSection="locales"
              metrics={baseRouteContext.metrics}
              permissions={baseRouteContext.permissions}
              selectedTranslationLocale={baseRouteContext.selectedTranslationLocale}
              translationPagination={baseRouteContext.translationPagination}
              translationSearchQuery={baseRouteContext.translationSearchQuery}
            >
              <Outlet context={baseRouteContext} />
            </DashboardResourcesLayout>
          ),
          children: [
            {
              path: "locales",
              element: <DashboardResourcesLocalesScreen />,
            },
          ],
        },
      ],
      {
        initialEntries: ["/dashboard/resources/locales"],
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
  });

  it("renders the translations path and translation modal when requested", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/dashboard/resources",
          element: (
            <DashboardResourcesLayout
              currentSection="translations"
              metrics={baseRouteContext.metrics}
              permissions={baseRouteContext.permissions}
              selectedTranslationLocale={baseRouteContext.selectedTranslationLocale}
              translationPagination={{
                currentCursor: '{"key":"dashboard.layout.navDashboard"}',
                direction: "next",
                hasNextPage: true,
                hasPreviousPage: true,
                nextCursor: '{"key":"dashboard.layout.navProjects"}',
                pageSize: 20,
                previousCursor: '{"key":"dashboard.layout.navAbout"}',
                totalItems: 41,
              }}
              translationSearchQuery={baseRouteContext.translationSearchQuery}
            >
              <Outlet
                context={{
                  ...baseRouteContext,
                  translationForm: {
                    ...baseRouteContext.translationForm,
                    isOpen: true,
                    mode: "create",
                  },
                  translationPagination: {
                    currentCursor: '{"key":"dashboard.layout.navDashboard"}',
                    direction: "next",
                    hasNextPage: true,
                    hasPreviousPage: true,
                    nextCursor: '{"key":"dashboard.layout.navProjects"}',
                    pageSize: 20,
                    previousCursor: '{"key":"dashboard.layout.navAbout"}',
                    totalItems: 41,
                  },
                }}
              />
            </DashboardResourcesLayout>
          ),
          children: [
            {
              path: "translations",
              element: <DashboardResourcesTranslationsScreen />,
            },
          ],
        },
      ],
      {
        initialEntries: ["/dashboard/resources/translations?modal=create-translation"],
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
  });

  it("renders a restricted screen for non-admin viewers", () => {
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
      screen.getByRole("heading", { level: 1, name: "Access denied" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Session role: author")).toBeInTheDocument();
  });
});

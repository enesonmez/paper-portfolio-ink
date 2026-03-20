import { render, screen, within } from "@testing-library/react";

describe("data table primitive", () => {
  it("renders typed columns and rows", async () => {
    const { DataTable } = await import("../../app/components/ui/data-table");

    render(
      <DataTable
        columns={[
          {
            header: "Name",
            id: "name",
            render: (item: { id: string; name: string }) => item.name,
          },
          {
            header: "Role",
            id: "role",
            render: (item: { id: string; role: string }) => item.role,
          },
        ]}
        emptyState="No rows"
        getRowKey={(item: { id: string }) => item.id}
        rows={[
          { id: "1", name: "Enes", role: "Admin" },
          { id: "2", name: "Ayla", role: "Editor" },
        ]}
      />,
    );

    const table = screen.getByRole("table");

    expect(
      within(table).getByRole("columnheader", { name: "Name" }),
    ).toBeInTheDocument();
    expect(within(table).getByText("Enes")).toBeInTheDocument();
    expect(within(table).getByText("Editor")).toBeInTheDocument();
  });

  it("renders empty state when rows are missing", async () => {
    const { DataTable } = await import("../../app/components/ui/data-table");

    render(
      <DataTable
        columns={[
          {
            header: "Name",
            id: "name",
            render: () => null,
          },
        ]}
        emptyState="No rows"
        getRowKey={(item: { id: string }) => item.id}
        rows={[]}
      />,
    );

    expect(screen.getByText("No rows")).toBeInTheDocument();
  });
});

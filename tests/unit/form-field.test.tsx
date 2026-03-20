import { render, screen } from "@testing-library/react";

describe("form field primitives", () => {
  it("renders a text field with label and validation message", async () => {
    const { TextField } = await import("../../app/components/ui/form-field");

    render(
      <TextField
        error="Email gerekli."
        label="Email"
        name="email"
        placeholder="admin@example.com"
        defaultValue="admin@example.com"
      />,
    );

    expect(screen.getByLabelText("Email")).toHaveAttribute("name", "email");
    expect(screen.getByRole("alert")).toHaveTextContent("Email gerekli.");
  });

  it("renders a select field from typed options", async () => {
    const { SelectField } = await import("../../app/components/ui/form-field");

    render(
      <SelectField
        label="Status"
        name="status"
        defaultValue="draft"
        options={[
          { label: "Draft", value: "draft" },
          { label: "Published", value: "published" },
        ]}
      />,
    );

    expect(screen.getByLabelText("Status")).toHaveValue("draft");
    expect(screen.getByRole("option", { name: "Published" })).toHaveValue("published");
  });
});

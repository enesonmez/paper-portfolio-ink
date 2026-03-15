import { render, screen } from "@testing-library/react";

import ProjectsPage from "../../app/routes/projects";

describe("ProjectsPage", () => {
  it("renders a stable placeholder page for the projects route", () => {
    render(<ProjectsPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Projeler listesi hazirlaniyor",
      }),
    ).toBeInTheDocument();
  });
});


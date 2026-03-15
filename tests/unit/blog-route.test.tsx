import { render, screen } from "@testing-library/react";

import BlogPage from "../../app/routes/blog";

describe("BlogPage", () => {
  it("renders a stable placeholder page for the blog route", () => {
    render(<BlogPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Yazilar yolda" }),
    ).toBeInTheDocument();
  });
});


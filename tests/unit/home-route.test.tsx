import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import HomePage from "../../app/routes/_index";

describe("HomePage", () => {
  it("renders the hero content and primary navigation links", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Enes Ink",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Projeleri Incele" }),
    ).toHaveAttribute("href", "/projects");
    expect(screen.getByRole("link", { name: "Yazilari Oku" })).toHaveAttribute(
      "href",
      "/blog",
    );
  });
});


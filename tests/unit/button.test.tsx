import { render, screen } from "@testing-library/react";

import { Button } from "../../app/components/ui/button";

describe("Button", () => {
  it("renders a neo-brutalist primary button shell", () => {
    render(<Button>Launch</Button>);

    const button = screen.getByRole("button", { name: "Launch" });

    expect(button.className).toContain("rounded-none");
    expect(button.className).toContain("border-2");
    expect(button.className).toContain("bg-primary");
  });

  it("supports rendering links with asChild", () => {
    render(
      <Button asChild>
        <a href="/projects">Projects</a>
      </Button>,
    );

    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "href",
      "/projects",
    );
  });
});

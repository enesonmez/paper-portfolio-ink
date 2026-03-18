import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { PublicHomeScreen } from "../../app/features/public/home/public-home-screen";

const featuredProjects = [
  {
    createdAtLabel: "2026-03-18",
    description: "Edge-first portfolio stack with CMS-grade editorial flows.",
    liveUrl: "https://paper-enes-ink.dev",
    repositoryUrl: "https://github.com/enesonmez/paper-enes-ink",
    slug: "paper-enes-ink",
    summary: "Portfolio, blog, and dashboard stack tuned for Cloudflare.",
    title: "Paper Enes Ink",
  },
];

describe("HomePage", () => {
  it("renders the hero, featured work, stack, and resume sections", () => {
    render(
      <MemoryRouter>
        <PublicHomeScreen featuredProjects={featuredProjects} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Hello, I am Enes/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Projects" })).toHaveAttribute(
      "href",
      "/projects",
    );
    expect(screen.getByRole("link", { name: "Read The Blog" })).toHaveAttribute(
      "href",
      "/blog",
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "Featured Projects" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Paper Enes Ink")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Tech Stack" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Resume Snapshot" }),
    ).toBeInTheDocument();
  });

  it("omits the featured projects section when there is no featured project", () => {
    render(
      <MemoryRouter>
        <PublicHomeScreen featuredProjects={[]} />
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole("heading", { level: 2, name: "Featured Projects" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Tech Stack" })).toBeInTheDocument();
  });
});

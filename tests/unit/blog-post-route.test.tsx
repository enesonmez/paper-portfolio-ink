import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import {
  getSeedMessages,
  getSeedLocaleOptions,
} from "../../app/shared/i18n/i18n.shared";
import { PublicBlogPostScreen } from "../../app/features/public/blog/public-blog-post-screen";
import {
  createEmptyPostContentDocument,
  serializePostContent,
} from "../../app/features/posts/post-content.shared";
import { meta } from "../../app/routes/blog_.$slug";

const storyContent = serializePostContent({
  content: [
    {
      attrs: { level: 2 },
      content: [{ text: "Deploy checklist", type: "text" }],
      type: "heading",
    },
    {
      content: [
        {
          text: "Queue draining, cache invalidation ve rollback penceresi ayni sayfada gorunmeli.",
          type: "text",
        },
      ],
      type: "paragraph",
    },
    {
      content: [
        {
          content: [
            {
              text: "Tail latency once yavas query kaynagini bul.",
              type: "text",
            },
          ],
          type: "paragraph",
        },
      ],
      type: "bulletList",
    },
  ],
  type: "doc",
});

const post = {
  authorBio:
    "Cloudflare tabanli uygulamalarda veri ve deploy akislari uzerine calisiyor.",
  authorName: "Enes Sonmez",
  content: storyContent,
  coverImageUrl: "https://images.paper-portfolio-ink.dev/edge-observability.webp",
  excerpt: "Deploy akisi, telemetry ve cache katmanini tek editorial akista toplar.",
  publishedAtIso: "2026-03-18T10:00:00.000Z",
  publishedAtLabel: "18 Mar 2026",
  readingTimeMinutes: 6,
  slug: "edge-observability-playbook",
  title: "Edge Observability Playbook",
  updatedAtIso: "2026-03-19T10:00:00.000Z",
  updatedAtLabel: "19 Mar 2026",
};

describe("blog detail route", () => {
  it("renders an article page with semantic content and companion rail", () => {
    render(
      <MemoryRouter>
        <PublicBlogPostScreen
          morePosts={[
            {
              authorName: "Enes Sonmez",
              coverImageUrl: null,
              excerpt: "D1 migrationlari icin yayina alma notlari.",
              publishedAtIso: "2026-03-12T09:00:00.000Z",
              publishedAtLabel: "12 Mar 2026",
              readingTimeMinutes: 4,
              slug: "zero-downtime-d1-migrations",
              title: "Zero Downtime D1 Migrations",
            },
          ]}
          post={post}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Edge Observability Playbook" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("article")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to blog" })).toHaveAttribute(
      "href",
      "/blog",
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "Deploy checklist" }),
    ).toBeInTheDocument();
    expect(screen.getByText("More notes")).toBeInTheDocument();
    expect(screen.getByText("6 min read")).toBeInTheDocument();
  });

  it("builds article-focused metadata from loader data", () => {
    expect(
      meta({
        data: {
          morePosts: [],
          post,
        },
        error: undefined,
        loaderData: {
          morePosts: [],
          post,
        },
        location: {
          hash: "",
          key: "default",
          pathname: `/blog/${post.slug}`,
          search: "",
          state: null,
          unstable_mask: undefined,
        },
        matches: [] as never,
        params: {
          slug: post.slug,
        },
      }),
    ).toEqual(
      expect.arrayContaining([
        { title: "Edge Observability Playbook | Blog | Enes Ink" },
        {
          name: "description",
          content:
            "Deploy akisi, telemetry ve cache katmanini tek editorial akista toplar.",
        },
        {
          property: "og:type",
          content: "article",
        },
        {
          property: "twitter:card",
          content: "summary_large_image",
        },
      ]),
    );
  });

  it("falls back to a safe document when loader data is missing", () => {
    const rootData = {
      locale: "en" as const,
      messages: getSeedMessages("en"),
      supportedLocales: getSeedLocaleOptions(),
      theme: "light" as const,
    };

    expect(
      meta({
        location: {
          hash: "",
          key: "default",
          pathname: "/blog/missing-story",
          search: "",
          state: null,
          unstable_mask: undefined,
        },
        matches: [{ data: rootData, id: "root" }] as never,
        params: {
          slug: "missing-story",
        },
      } as never),
    ).toEqual(expect.arrayContaining([{ title: "Blog Post | Enes Ink" }]));
  });

  it("renders a fallback paragraph for empty legacy content", () => {
    render(
      <MemoryRouter>
        <PublicBlogPostScreen
          morePosts={[]}
          post={{
            ...post,
            content: serializePostContent(createEmptyPostContentDocument()),
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("The post body will be updated soon.")).toBeInTheDocument();
  });

  it("renders image-only documents instead of falling back to the empty message", () => {
    render(
      <MemoryRouter>
        <PublicBlogPostScreen
          morePosts={[]}
          post={{
            ...post,
            content: serializePostContent({
              content: [
                {
                  attrs: {
                    alt: "Deployment board",
                    src: "https://images.paper-portfolio-ink.dev/deployment-board.webp",
                  },
                  type: "image",
                },
              ],
              type: "doc",
            }),
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("img", { name: "Deployment board" })).toBeInTheDocument();
    expect(
      screen.queryByText("The post body will be updated soon."),
    ).not.toBeInTheDocument();
  });

  it("does not render anchors for unsafe link protocols", () => {
    render(
      <MemoryRouter>
        <PublicBlogPostScreen
          morePosts={[]}
          post={{
            ...post,
            content: serializePostContent({
              content: [
                {
                  content: [
                    {
                      marks: [
                        {
                          attrs: {
                            href: "javascript:alert(1)",
                          },
                          type: "link",
                        },
                      ],
                      text: "Run exploit",
                      type: "text",
                    },
                  ],
                  type: "paragraph",
                },
              ],
              type: "doc",
            }),
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Run exploit")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Run exploit" })).not.toBeInTheDocument();
  });
});

import { and, asc, desc, eq, gt, like, lt, ne, or, sql } from "drizzle-orm";
import { z } from "zod";

import type { AppDb } from "../../../db";
import { posts, users } from "../../../db/schema";
import { getPostContentPlainText } from "~/domain/posts/content";
import { POST_STATUS, type PostStatus } from "~/domain/posts/model";
import { findNextAvailableSlug, suggestSlugFromTitle } from "~/lib/slug";

import type { PostSubmission } from "./post-form.server";

export interface PostOverview {
  authorId: string;
  coverImageUrl: string | null;
  createdAtLabel: string;
  excerpt: string;
  id: string;
  publishedAtLabel: string | null;
  slug: string;
  status: PostStatus;
  title: string;
  updatedAtLabel: string;
}

export interface PublicPostListItem {
  authorName: string;
  coverImageUrl: string | null;
  excerpt: string;
  publishedAtIso: string;
  publishedAtLabel: string;
  readingTimeMinutes: number;
  slug: string;
  title: string;
}

export interface EditablePost {
  content: string;
  coverImageUrl: string | null;
  excerpt: string;
  id: string;
  slug: string;
  status: PostStatus;
  title: string;
}

export interface PublicPostDetail extends PublicPostListItem {
  authorBio: string | null;
  content: string;
  updatedAtIso: string;
  updatedAtLabel: string;
}

export interface PublicPostsPage {
  items: PublicPostListItem[];
  nextCursor: string | null;
}

export interface DashboardPostListMetrics {
  draftCount: number;
  publishedCount: number;
  totalCount: number;
}

export interface DashboardPostsCursor {
  createdAtIso: string;
  slug: string;
  updatedAtIso: string;
}

export interface DashboardPostsPage {
  items: PostOverview[];
  metrics: DashboardPostListMetrics;
  pagination: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor: string | null;
    previousCursor: string | null;
  };
}

interface PublicPostRecord {
  authorName: string;
  coverImageUrl: string | null;
  createdAt: Date;
  excerpt: string | null;
  publishedAt: Date | null;
  readingTimeMinutes: number;
  slug: string;
  title: string;
  updatedAt: Date;
}

const PUBLIC_DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

const WORDS_PER_MINUTE = 180;

function formatDateLabel(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : null;
}

function formatPublicDateLabel(value: Date) {
  return PUBLIC_DATE_FORMATTER.format(value);
}

function formatDateIso(value: Date) {
  return value.toISOString();
}

function normalizeNullableUrl(value: string) {
  return value.length > 0 ? value : null;
}

function normalizeExcerpt(value: string) {
  return value.trim();
}

interface PublicPostsCursorInput {
  createdAtIso: string;
  publishedAtIso: string;
  slug: string;
  updatedAtIso: string;
}

interface PublicPostsCursorRecord {
  createdAt: Date;
  publishedAt: Date;
  slug: string;
  updatedAt: Date;
}

interface DashboardPostsCursorRecord {
  createdAt: Date;
  slug: string;
  updatedAt: Date;
}

const dashboardPostsCursorSchema = z.object({
  createdAtIso: z.string().datetime(),
  slug: z.string().trim().min(1),
  updatedAtIso: z.string().datetime(),
});

function encodePublicPostsCursor(cursor: PublicPostsCursorInput) {
  return JSON.stringify(cursor);
}

export function buildDashboardPostsCursor(cursor: DashboardPostsCursor) {
  return JSON.stringify(cursor);
}

export function parseDashboardPostsCursor(
  value: string | null,
): DashboardPostsCursorRecord | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = dashboardPostsCursorSchema.parse(JSON.parse(value));

    return {
      createdAt: new Date(parsed.createdAtIso),
      slug: parsed.slug,
      updatedAt: new Date(parsed.updatedAtIso),
    };
  } catch {
    return null;
  }
}

function buildPublicPostsCursorWhere(cursor: PublicPostsCursorRecord) {
  return or(
    lt(posts.publishedAt, cursor.publishedAt),
    and(
      eq(posts.publishedAt, cursor.publishedAt),
      lt(posts.updatedAt, cursor.updatedAt),
    ),
    and(
      eq(posts.publishedAt, cursor.publishedAt),
      eq(posts.updatedAt, cursor.updatedAt),
      lt(posts.createdAt, cursor.createdAt),
    ),
    and(
      eq(posts.publishedAt, cursor.publishedAt),
      eq(posts.updatedAt, cursor.updatedAt),
      eq(posts.createdAt, cursor.createdAt),
      gt(posts.slug, cursor.slug),
    ),
  );
}

function buildDashboardPostsCursorWhere(cursor: DashboardPostsCursorRecord) {
  return or(
    lt(posts.updatedAt, cursor.updatedAt),
    and(eq(posts.updatedAt, cursor.updatedAt), lt(posts.createdAt, cursor.createdAt)),
    and(
      eq(posts.updatedAt, cursor.updatedAt),
      eq(posts.createdAt, cursor.createdAt),
      gt(posts.slug, cursor.slug),
    ),
  );
}

function buildDashboardPostsPreviousCursorWhere(cursor: DashboardPostsCursorRecord) {
  return or(
    gt(posts.updatedAt, cursor.updatedAt),
    and(eq(posts.updatedAt, cursor.updatedAt), gt(posts.createdAt, cursor.createdAt)),
    and(
      eq(posts.updatedAt, cursor.updatedAt),
      eq(posts.createdAt, cursor.createdAt),
      lt(posts.slug, cursor.slug),
    ),
  );
}

function buildDashboardPostsSearchFilter(searchQuery: string) {
  if (searchQuery.length === 0) {
    return undefined;
  }

  const pattern = `%${searchQuery}%`;

  return or(
    like(posts.title, pattern),
    like(posts.slug, pattern),
    like(posts.excerpt, pattern),
  );
}

function buildDashboardPostsMetricsSelection() {
  return {
    draftCount: sql<number>`sum(case when ${posts.status} = 'draft' then 1 else 0 end)`,
    publishedCount: sql<number>`sum(case when ${posts.status} = 'published' then 1 else 0 end)`,
    totalCount: sql<number>`count(*)`,
  };
}

function toDashboardPostListMetrics(metrics?: {
  draftCount: number | null;
  publishedCount: number | null;
  totalCount: number | null;
}): DashboardPostListMetrics {
  return {
    draftCount: Number(metrics?.draftCount ?? 0),
    publishedCount: Number(metrics?.publishedCount ?? 0),
    totalCount: Number(metrics?.totalCount ?? 0),
  };
}

function getContentReadingTimeMinutes(content: string) {
  const wordCount = getPostContentPlainText(content)
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

function buildExcerpt(excerpt: string | null) {
  return excerpt?.trim() ?? "";
}

function resolvePublicPublishedDate(post: {
  createdAt: Date;
  publishedAt: Date | null;
  updatedAt: Date;
}) {
  return post.publishedAt ?? post.updatedAt ?? post.createdAt;
}

function resolvePublishedAt(submission: PostSubmission) {
  if (submission.status !== POST_STATUS.published) {
    return null;
  }

  return new Date();
}

function toPublicPostListItem(post: PublicPostRecord): PublicPostListItem {
  const publishedDate = resolvePublicPublishedDate(post);

  return {
    authorName: post.authorName,
    coverImageUrl: post.coverImageUrl,
    excerpt: buildExcerpt(post.excerpt),
    publishedAtIso: formatDateIso(publishedDate),
    publishedAtLabel: formatPublicDateLabel(publishedDate),
    readingTimeMinutes: post.readingTimeMinutes,
    slug: post.slug,
    title: post.title,
  };
}

function toPostOverview(post: {
  authorId: string;
  coverImageUrl: string | null;
  createdAt: Date;
  excerpt: string | null;
  id: string;
  publishedAt: Date | null;
  slug: string;
  status: PostStatus;
  title: string;
  updatedAt: Date;
}): PostOverview {
  return {
    authorId: post.authorId,
    coverImageUrl: post.coverImageUrl,
    createdAtLabel: formatDateLabel(post.createdAt) ?? "-",
    excerpt: post.excerpt ?? "",
    id: post.id,
    publishedAtLabel: formatDateLabel(post.publishedAt),
    slug: post.slug,
    status: post.status,
    title: post.title,
    updatedAtLabel: formatDateLabel(post.updatedAt) ?? "-",
  };
}

function toEditablePost(post: {
  content: string;
  coverImageUrl: string | null;
  excerpt: string | null;
  id: string;
  slug: string;
  status: PostStatus;
  title: string;
}): EditablePost {
  return {
    content: post.content,
    coverImageUrl: post.coverImageUrl,
    excerpt: post.excerpt ?? "",
    id: post.id,
    slug: post.slug,
    status: post.status,
    title: post.title,
  };
}

function buildPostPersistenceValues(submission: PostSubmission) {
  const normalizedExcerpt = normalizeExcerpt(submission.excerpt);

  return {
    content: submission.content,
    coverImageUrl: normalizeNullableUrl(submission.coverImageUrl),
    excerpt: normalizedExcerpt,
    publishedAt: resolvePublishedAt(submission),
    readingTimeMinutes: getContentReadingTimeMinutes(submission.content),
    slug: submission.slug,
    status: submission.status,
    title: submission.title,
  };
}

export async function listPosts(db: AppDb): Promise<PostOverview[]> {
  const result = await db
    .select({
      authorId: posts.authorId,
      coverImageUrl: posts.coverImageUrl,
      createdAt: posts.createdAt,
      excerpt: posts.excerpt,
      id: posts.id,
      publishedAt: posts.publishedAt,
      slug: posts.slug,
      status: posts.status,
      title: posts.title,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .orderBy(desc(posts.publishedAt), desc(posts.updatedAt), desc(posts.createdAt));

  return result.map((post) =>
    toPostOverview({
      ...post,
      status: post.status,
    }),
  );
}

export async function listPostsPage(
  db: AppDb,
  options: {
    authorId?: string;
    cursor?: DashboardPostsCursorRecord | null;
    direction?: "next" | "previous";
    pageSize: number;
    searchQuery?: string;
    status?: PostStatus;
  },
): Promise<DashboardPostsPage> {
  const direction = options.direction ?? "next";
  const filters = [
    options.authorId ? eq(posts.authorId, options.authorId) : undefined,
    options.status ? eq(posts.status, options.status) : undefined,
    buildDashboardPostsSearchFilter(options.searchQuery ?? ""),
    options.cursor
      ? direction === "previous"
        ? buildDashboardPostsPreviousCursorWhere(options.cursor)
        : buildDashboardPostsCursorWhere(options.cursor)
      : undefined,
  ].filter((filter) => filter !== undefined);
  const whereClause =
    filters.length === 0
      ? undefined
      : filters.length === 1
        ? filters[0]
        : and(...filters);
  let pageQuery = db
    .select({
      authorId: posts.authorId,
      coverImageUrl: posts.coverImageUrl,
      createdAt: posts.createdAt,
      excerpt: posts.excerpt,
      id: posts.id,
      publishedAt: posts.publishedAt,
      slug: posts.slug,
      status: posts.status,
      title: posts.title,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .$dynamic();

  if (whereClause) {
    pageQuery = pageQuery.where(whereClause);
  }

  const orderedRows = await pageQuery
    .orderBy(
      direction === "previous" ? asc(posts.updatedAt) : desc(posts.updatedAt),
      direction === "previous" ? asc(posts.createdAt) : desc(posts.createdAt),
      direction === "previous" ? desc(posts.slug) : asc(posts.slug),
    )
    .limit(options.pageSize + 1);
  const visibleRows = orderedRows.slice(0, options.pageSize);
  const items = direction === "previous" ? [...visibleRows].reverse() : visibleRows;
  const metricsFilters = [
    options.authorId ? eq(posts.authorId, options.authorId) : undefined,
    options.status ? eq(posts.status, options.status) : undefined,
    buildDashboardPostsSearchFilter(options.searchQuery ?? ""),
  ].filter((filter) => filter !== undefined);
  const metricsWhere =
    metricsFilters.length === 0
      ? undefined
      : metricsFilters.length === 1
        ? metricsFilters[0]
        : and(...metricsFilters);
  let metricsQuery = db
    .select(buildDashboardPostsMetricsSelection())
    .from(posts)
    .$dynamic();

  if (metricsWhere) {
    metricsQuery = metricsQuery.where(metricsWhere);
  }

  const [metrics] = await metricsQuery;
  const firstItem = items[0];
  const lastItem = items.at(-1);
  const hasExtraRow = orderedRows.length > options.pageSize;
  const hasNextPage = direction === "previous" ? Boolean(options.cursor) : hasExtraRow;
  const hasPreviousPage =
    direction === "previous" ? hasExtraRow : Boolean(options.cursor);

  return {
    items: items.map((post) =>
      toPostOverview({
        ...post,
        status: post.status,
      }),
    ),
    metrics: toDashboardPostListMetrics(metrics),
    pagination: {
      hasNextPage,
      hasPreviousPage,
      nextCursor:
        hasNextPage && lastItem
          ? buildDashboardPostsCursor({
              createdAtIso: lastItem.createdAt.toISOString(),
              slug: lastItem.slug,
              updatedAtIso: lastItem.updatedAt.toISOString(),
            })
          : null,
      previousCursor:
        hasPreviousPage && firstItem
          ? buildDashboardPostsCursor({
              createdAtIso: firstItem.createdAt.toISOString(),
              slug: firstItem.slug,
              updatedAtIso: firstItem.updatedAt.toISOString(),
            })
          : null,
    },
  };
}

export async function listPostsByAuthor(
  db: AppDb,
  authorId: string,
): Promise<PostOverview[]> {
  const result = await db
    .select({
      authorId: posts.authorId,
      coverImageUrl: posts.coverImageUrl,
      createdAt: posts.createdAt,
      excerpt: posts.excerpt,
      id: posts.id,
      publishedAt: posts.publishedAt,
      slug: posts.slug,
      status: posts.status,
      title: posts.title,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .where(eq(posts.authorId, authorId))
    .orderBy(desc(posts.publishedAt), desc(posts.updatedAt), desc(posts.createdAt));

  return result.map((post) =>
    toPostOverview({
      ...post,
      status: post.status,
    }),
  );
}

export async function listPublicPosts(db: AppDb): Promise<PublicPostListItem[]> {
  const result = await db
    .select({
      authorName: users.displayName,
      coverImageUrl: posts.coverImageUrl,
      createdAt: posts.createdAt,
      excerpt: posts.excerpt,
      publishedAt: posts.publishedAt,
      readingTimeMinutes: posts.readingTimeMinutes,
      slug: posts.slug,
      title: posts.title,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.status, POST_STATUS.published))
    .orderBy(desc(posts.publishedAt), desc(posts.updatedAt), desc(posts.createdAt));

  return result.map((post) => toPublicPostListItem(post));
}

export async function listPublicPostsPage(
  db: AppDb,
  pageSize: number,
  cursor?: PublicPostsCursorRecord | null,
): Promise<PublicPostsPage> {
  const result = await db
    .select({
      authorName: users.displayName,
      coverImageUrl: posts.coverImageUrl,
      createdAt: posts.createdAt,
      excerpt: posts.excerpt,
      publishedAt: posts.publishedAt,
      readingTimeMinutes: posts.readingTimeMinutes,
      slug: posts.slug,
      title: posts.title,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(
      cursor
        ? and(
            eq(posts.status, POST_STATUS.published),
            buildPublicPostsCursorWhere(cursor),
          )
        : eq(posts.status, POST_STATUS.published),
    )
    .orderBy(
      desc(posts.publishedAt),
      desc(posts.updatedAt),
      desc(posts.createdAt),
      asc(posts.slug),
    )
    .limit(pageSize + 1);

  const hasMore = result.length > pageSize;
  const visibleItems = result.slice(0, pageSize);
  const items = visibleItems.map((post) => toPublicPostListItem(post));
  const lastVisibleItem = visibleItems.at(-1);

  return {
    items,
    nextCursor:
      hasMore && lastVisibleItem?.publishedAt
        ? encodePublicPostsCursor({
            createdAtIso: lastVisibleItem.createdAt.toISOString(),
            publishedAtIso: lastVisibleItem.publishedAt.toISOString(),
            slug: lastVisibleItem.slug,
            updatedAtIso: lastVisibleItem.updatedAt.toISOString(),
          })
        : null,
  };
}

export async function listPublicCompanionPosts(
  db: AppDb,
  excludedSlug: string,
  limit: number,
): Promise<PublicPostListItem[]> {
  const result = await db
    .select({
      authorName: users.displayName,
      coverImageUrl: posts.coverImageUrl,
      createdAt: posts.createdAt,
      excerpt: posts.excerpt,
      publishedAt: posts.publishedAt,
      readingTimeMinutes: posts.readingTimeMinutes,
      slug: posts.slug,
      title: posts.title,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(and(eq(posts.status, POST_STATUS.published), ne(posts.slug, excludedSlug)))
    .orderBy(
      desc(posts.publishedAt),
      desc(posts.updatedAt),
      desc(posts.createdAt),
      asc(posts.slug),
    )
    .limit(limit);

  return result.map((post) => toPublicPostListItem(post));
}

export async function isPostSlugTaken(
  db: AppDb,
  slug: string,
  excludedPostId?: string,
) {
  const [post] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(
      excludedPostId
        ? and(eq(posts.slug, slug), ne(posts.id, excludedPostId))
        : eq(posts.slug, slug),
    )
    .limit(1);

  return Boolean(post);
}

export async function findAvailablePostSlug(
  db: AppDb,
  title: string,
  excludedPostId?: string,
) {
  const baseSlug = suggestSlugFromTitle(title);

  return findNextAvailableSlug(baseSlug, async (slug) =>
    isPostSlugTaken(db, slug, excludedPostId),
  );
}

export async function getPublicPostBySlug(
  db: AppDb,
  slug: string,
): Promise<PublicPostDetail | null> {
  const [post] = await db
    .select({
      authorBio: users.bio,
      authorName: users.displayName,
      content: posts.content,
      coverImageUrl: posts.coverImageUrl,
      createdAt: posts.createdAt,
      excerpt: posts.excerpt,
      publishedAt: posts.publishedAt,
      readingTimeMinutes: posts.readingTimeMinutes,
      slug: posts.slug,
      title: posts.title,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(and(eq(posts.slug, slug), eq(posts.status, POST_STATUS.published)))
    .limit(1);

  if (!post) {
    return null;
  }

  const publishedDate = resolvePublicPublishedDate(post);

  return {
    authorBio: post.authorBio,
    authorName: post.authorName,
    content: post.content,
    coverImageUrl: post.coverImageUrl,
    excerpt: buildExcerpt(post.excerpt),
    publishedAtIso: formatDateIso(publishedDate),
    publishedAtLabel: formatPublicDateLabel(publishedDate),
    readingTimeMinutes: post.readingTimeMinutes,
    slug: post.slug,
    title: post.title,
    updatedAtIso: formatDateIso(post.updatedAt),
    updatedAtLabel: formatPublicDateLabel(post.updatedAt),
  };
}

export async function createPost(
  db: AppDb,
  authorId: string,
  submission: PostSubmission,
) {
  await db.insert(posts).values({
    authorId,
    ...buildPostPersistenceValues(submission),
  });
}

export async function getPostById(
  db: AppDb,
  postId: string,
): Promise<EditablePost | null> {
  const [post] = await db
    .select({
      content: posts.content,
      coverImageUrl: posts.coverImageUrl,
      excerpt: posts.excerpt,
      id: posts.id,
      slug: posts.slug,
      status: posts.status,
      title: posts.title,
    })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) {
    return null;
  }

  return toEditablePost({
    ...post,
    status: post.status,
  });
}

export async function getPostByIdForAuthor(
  db: AppDb,
  postId: string,
  authorId: string,
): Promise<EditablePost | null> {
  const [post] = await db
    .select({
      content: posts.content,
      coverImageUrl: posts.coverImageUrl,
      excerpt: posts.excerpt,
      id: posts.id,
      slug: posts.slug,
      status: posts.status,
      title: posts.title,
    })
    .from(posts)
    .where(and(eq(posts.id, postId), eq(posts.authorId, authorId)))
    .limit(1);

  if (!post) {
    return null;
  }

  return toEditablePost({
    ...post,
    status: post.status,
  });
}

export async function getPostAuthorId(db: AppDb, postId: string) {
  const [post] = await db
    .select({
      authorId: posts.authorId,
    })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  return post?.authorId ?? null;
}

export async function updatePost(
  db: AppDb,
  postId: string,
  submission: PostSubmission,
) {
  await db
    .update(posts)
    .set({
      ...buildPostPersistenceValues(submission),
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId));
}

export async function deletePost(db: AppDb, postId: string) {
  await db.delete(posts).where(eq(posts.id, postId));
}

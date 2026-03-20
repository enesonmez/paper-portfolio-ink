import { and, asc, desc, eq, ne } from "drizzle-orm";

import type { AppDb } from "../../../db";
import { posts, users } from "../../../db/schema";
import { getPostContentPlainText } from "~/features/posts/post-content.shared";
import { POST_STATUS, type PostStatus } from "~/features/posts/post.shared";

import type { PostSubmission } from "./post-form.server";

export interface PostOverview {
  content: string;
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

export interface PublicPostDetail extends PublicPostListItem {
  authorBio: string | null;
  content: string;
  updatedAtIso: string;
  updatedAtLabel: string;
}

export interface PublicPostsPage {
  items: PublicPostListItem[];
  nextPage: number | null;
}

interface PublicPostRecord {
  authorName: string;
  content: string;
  coverImageUrl: string | null;
  createdAt: Date;
  excerpt: string | null;
  publishedAt: Date | null;
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

function getContentReadingTimeMinutes(content: string) {
  const wordCount = getPostContentPlainText(content)
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

function buildExcerpt(content: string, excerpt: string | null) {
  const normalizedExcerpt = excerpt?.trim() ?? "";

  if (normalizedExcerpt.length > 0) {
    return normalizedExcerpt;
  }

  return getPostContentPlainText(content).slice(0, 180).trim();
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
    excerpt: buildExcerpt(post.content, post.excerpt),
    publishedAtIso: formatDateIso(publishedDate),
    publishedAtLabel: formatPublicDateLabel(publishedDate),
    readingTimeMinutes: getContentReadingTimeMinutes(post.content),
    slug: post.slug,
    title: post.title,
  };
}

function toPostOverview(post: {
  content: string;
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
    content: post.content,
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

export async function listPosts(db: AppDb): Promise<PostOverview[]> {
  const result = await db
    .select({
      content: posts.content,
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

export async function listPublicPosts(db: AppDb): Promise<PublicPostListItem[]> {
  const result = await db
    .select({
      authorName: users.displayName,
      content: posts.content,
      coverImageUrl: posts.coverImageUrl,
      createdAt: posts.createdAt,
      excerpt: posts.excerpt,
      publishedAt: posts.publishedAt,
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
  page: number,
): Promise<PublicPostsPage> {
  const offset = (page - 1) * pageSize;
  const result = await db
    .select({
      authorName: users.displayName,
      content: posts.content,
      coverImageUrl: posts.coverImageUrl,
      createdAt: posts.createdAt,
      excerpt: posts.excerpt,
      publishedAt: posts.publishedAt,
      slug: posts.slug,
      title: posts.title,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.status, POST_STATUS.published))
    .orderBy(
      desc(posts.publishedAt),
      desc(posts.updatedAt),
      desc(posts.createdAt),
      asc(posts.slug),
    )
    .limit(pageSize + 1)
    .offset(offset);

  const hasMore = result.length > pageSize;
  const items = result.slice(0, pageSize).map((post) => toPublicPostListItem(post));

  return {
    items,
    nextPage: hasMore ? page + 1 : null,
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
      content: posts.content,
      coverImageUrl: posts.coverImageUrl,
      createdAt: posts.createdAt,
      excerpt: posts.excerpt,
      publishedAt: posts.publishedAt,
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
    excerpt: buildExcerpt(post.content, post.excerpt),
    publishedAtIso: formatDateIso(publishedDate),
    publishedAtLabel: formatPublicDateLabel(publishedDate),
    readingTimeMinutes: getContentReadingTimeMinutes(post.content),
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
    content: submission.content,
    coverImageUrl: normalizeNullableUrl(submission.coverImageUrl),
    excerpt: submission.excerpt,
    publishedAt: resolvePublishedAt(submission),
    slug: submission.slug,
    status: submission.status,
    title: submission.title,
  });
}

export async function updatePost(
  db: AppDb,
  postId: string,
  submission: PostSubmission,
) {
  await db
    .update(posts)
    .set({
      content: submission.content,
      coverImageUrl: normalizeNullableUrl(submission.coverImageUrl),
      excerpt: submission.excerpt,
      publishedAt: resolvePublishedAt(submission),
      slug: submission.slug,
      status: submission.status,
      title: submission.title,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId));
}

export async function deletePost(db: AppDb, postId: string) {
  await db.delete(posts).where(eq(posts.id, postId));
}

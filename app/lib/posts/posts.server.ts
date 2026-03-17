import { desc, eq } from "drizzle-orm";

import type { AppDb } from "../../../db";
import { posts } from "../../../db/schema";
import {
  POST_STATUS,
  type PostStatus,
} from "~/features/posts/post.shared";

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

function formatDateLabel(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : null;
}

function normalizeNullableUrl(value: string) {
  return value.length > 0 ? value : null;
}

function resolvePublishedAt(submission: PostSubmission) {
  if (submission.status !== POST_STATUS.published) {
    return null;
  }

  return new Date();
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

import { desc, eq, sql } from "drizzle-orm";
import type { AppDb } from "../../../db";
import { posts, projects, skills, users, logHistory } from "../../../db/schema";
import { actorHasAnyClaim, type AuthorizationActor } from "~/shared/authz/authz.server";
import { AUTHORIZATION_CLAIM } from "~/shared/authz/model";

export async function getOverviewStats(db: AppDb, actor: AuthorizationActor) {
  const canReadAnyPosts = actorHasAnyClaim(actor, [AUTHORIZATION_CLAIM.postsReadAny]);
  const canReadOwnPosts = actorHasAnyClaim(actor, [AUTHORIZATION_CLAIM.postsReadOwn]);
  const canReadProjects = actorHasAnyClaim(actor, [AUTHORIZATION_CLAIM.projectsRead]);
  const canReadUsers = actorHasAnyClaim(actor, [AUTHORIZATION_CLAIM.usersRead]);
  const canReadSkills = actorHasAnyClaim(actor, [AUTHORIZATION_CLAIM.skillsRead]);

  const postCountPromise = (async () => {
    if (canReadAnyPosts) {
      const [res] = await db
        .select({ count: sql<number>`count(${posts.id})` })
        .from(posts);
      return res?.count ?? 0;
    } else if (canReadOwnPosts) {
      const [res] = await db
        .select({ count: sql<number>`count(${posts.id})` })
        .from(posts)
        .where(eq(posts.authorId, actor.userId ?? ""));
      return res?.count ?? 0;
    }
    return null;
  })();

  const projectCountPromise = (async () => {
    if (canReadProjects) {
      const [res] = await db
        .select({ count: sql<number>`count(${projects.id})` })
        .from(projects);
      return res?.count ?? 0;
    }
    return null;
  })();

  const activeUserCountPromise = (async () => {
    if (canReadUsers) {
      const [res] = await db
        .select({ count: sql<number>`count(${users.id})` })
        .from(users)
        .where(eq(users.isActive, true));
      return res?.count ?? 0;
    }
    return null;
  })();

  const skillCountPromise = (async () => {
    if (canReadSkills) {
      const [res] = await db
        .select({ count: sql<number>`count(${skills.id})` })
        .from(skills);
      return res?.count ?? 0;
    }
    return null;
  })();

  const [postCount, projectCount, activeUserCount, skillCount] = await Promise.all([
    postCountPromise,
    projectCountPromise,
    activeUserCountPromise,
    skillCountPromise,
  ]);

  return {
    postCount,
    projectCount,
    activeUserCount,
    skillCount,
  };
}

export async function getOverviewRecentLogs(db: AppDb, actor: AuthorizationActor) {
  const canReadAnyLogs = actorHasAnyClaim(actor, [AUTHORIZATION_CLAIM.logsAuditRead]);

  let query = db
    .select({
      id: logHistory.id,
      action: logHistory.action,
      resource: logHistory.resource,
      result: logHistory.result,
      message: logHistory.message,
      createdAt: logHistory.createdAt,
    })
    .from(logHistory)
    .orderBy(desc(logHistory.createdAt), desc(logHistory.id))
    .$dynamic();

  if (!canReadAnyLogs) {
    query = query.where(eq(logHistory.userId, actor.userId ?? ""));
  }

  return query.limit(5);
}

export async function getOverviewRecentPosts(db: AppDb, actor: AuthorizationActor) {
  const canReadAnyPosts = actorHasAnyClaim(actor, [AUTHORIZATION_CLAIM.postsReadAny]);
  const canReadOwnPosts = actorHasAnyClaim(actor, [AUTHORIZATION_CLAIM.postsReadOwn]);

  if (!canReadAnyPosts && !canReadOwnPosts) {
    return [];
  }

  let query = db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      coverImageUrl: posts.coverImageUrl,
      readingTimeMinutes: posts.readingTimeMinutes,
      status: posts.status,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .orderBy(desc(posts.updatedAt), desc(posts.id))
    .$dynamic();

  if (!canReadAnyPosts) {
    query = query.where(eq(posts.authorId, actor.userId ?? ""));
  }

  return query.limit(3);
}

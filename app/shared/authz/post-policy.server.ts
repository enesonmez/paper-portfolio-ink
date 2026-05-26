import type { AppLoadContext } from "react-router";

import { getDbFromContext } from "../../../db/context";
import {
  getPostById,
  getPostByIdForAuthor,
  getPostAuthorId,
  listPostsPage,
} from "~/lib/posts/posts.server";

import { actorHasAnyClaim, type AuthorizationActor } from "./authz.server";
import { AUTHORIZATION_CLAIM } from "./model";

export function canAccessDashboardPosts(actor: AuthorizationActor) {
  return actorHasAnyClaim(actor, [
    AUTHORIZATION_CLAIM.postsReadAny,
    AUTHORIZATION_CLAIM.postsReadOwn,
    AUTHORIZATION_CLAIM.postsCreate,
    AUTHORIZATION_CLAIM.postsUpdateAny,
    AUTHORIZATION_CLAIM.postsUpdateOwn,
    AUTHORIZATION_CLAIM.postsDeleteAny,
    AUTHORIZATION_CLAIM.postsDeleteOwn,
  ]);
}

export function canCreatePosts(actor: AuthorizationActor) {
  return actorHasAnyClaim(actor, [AUTHORIZATION_CLAIM.postsCreate]);
}

export async function listAuthorizedPosts(
  context: AppLoadContext,
  actor: AuthorizationActor,
  options: {
    cursor?: Parameters<typeof listPostsPage>[1]["cursor"];
    direction?: Parameters<typeof listPostsPage>[1]["direction"];
    pageSize: number;
    searchQuery?: string;
    status?: Parameters<typeof listPostsPage>[1]["status"];
  },
) {
  const db = getDbFromContext(context);

  if (actorHasAnyClaim(actor, [AUTHORIZATION_CLAIM.postsReadAny])) {
    return listPostsPage(db, options);
  }

  if (
    actor.userId &&
    actorHasAnyClaim(actor, [
      AUTHORIZATION_CLAIM.postsReadOwn,
      AUTHORIZATION_CLAIM.postsUpdateOwn,
      AUTHORIZATION_CLAIM.postsDeleteOwn,
    ])
  ) {
    return listPostsPage(db, {
      ...options,
      authorId: actor.userId,
    });
  }

  return {
    items: [],
    metrics: {
      draftCount: 0,
      publishedCount: 0,
      totalCount: 0,
    },
    pagination: {
      hasNextPage: false,
      hasPreviousPage: false,
      nextCursor: null,
      previousCursor: null,
    },
  };
}

export async function canMutatePost(
  context: AppLoadContext,
  actor: AuthorizationActor,
  action: "delete" | "update",
  postId: string,
) {
  const anyClaim =
    action === "update"
      ? AUTHORIZATION_CLAIM.postsUpdateAny
      : AUTHORIZATION_CLAIM.postsDeleteAny;
  const ownClaim =
    action === "update"
      ? AUTHORIZATION_CLAIM.postsUpdateOwn
      : AUTHORIZATION_CLAIM.postsDeleteOwn;

  if (actorHasAnyClaim(actor, [anyClaim])) {
    return true;
  }

  if (!actor.userId || !actorHasAnyClaim(actor, [ownClaim])) {
    return false;
  }

  const authorId = await getPostAuthorId(getDbFromContext(context), postId);

  return authorId !== null && authorId === actor.userId;
}

export async function getAuthorizedEditablePost(
  context: AppLoadContext,
  actor: AuthorizationActor,
  postId: string,
) {
  const db = getDbFromContext(context);

  if (actorHasAnyClaim(actor, [AUTHORIZATION_CLAIM.postsReadAny])) {
    return getPostById(db, postId);
  }

  if (
    actor.userId &&
    actorHasAnyClaim(actor, [
      AUTHORIZATION_CLAIM.postsReadOwn,
      AUTHORIZATION_CLAIM.postsUpdateOwn,
      AUTHORIZATION_CLAIM.postsDeleteOwn,
    ])
  ) {
    return getPostByIdForAuthor(db, postId, actor.userId);
  }

  return null;
}

import {
  APP_ERROR_SEVERITY,
  APP_ERROR_SINK,
  NotFoundError,
} from "~/shared/errors/app-error.server";
import { APP_ERROR_CODE } from "~/shared/errors/contracts";

import { PUBLIC_BLOG_POST_NOT_FOUND_ERROR_NAME } from "./errors";

export class PublicBlogPostNotFoundError extends NotFoundError {
  constructor() {
    super("Published blog post not found.", {
      code: APP_ERROR_CODE.public.blog.postNotFound,
      expose: true,
      logSink: APP_ERROR_SINK.none,
      severity: APP_ERROR_SEVERITY.info,
      status: 404,
    });
    this.name = PUBLIC_BLOG_POST_NOT_FOUND_ERROR_NAME;
  }
}

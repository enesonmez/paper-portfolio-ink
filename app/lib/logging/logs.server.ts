import { and, asc, desc, eq, gt, gte, lt, lte, or, sql } from "drizzle-orm";
import { z } from "zod";

import { getDbFromContext } from "../../../db/context";
import type { UserRole } from "../../../db/schema";
import { logErrorHistory, logHistory } from "../../../db/schema";
import type { AppLoadContext } from "react-router";
import {
  buildLoggingCursor,
  LOGGING_PAGINATION_DIRECTION,
  type LoggingCursor,
  type LoggingPaginationDirection,
} from "~/domain/logging/model";
import { getAppDataCache } from "~/shared/cache/data-cache.server";

export interface LogHistoryEntryInput {
  action: string;
  message: string;
  metadataJson: string;
  method: string;
  path: string;
  requestId: string;
  resource: string;
  result: "failure" | "success";
  statusCode: number;
  targetId?: string | null;
  targetLabel?: string | null;
  userId?: string | null;
  userRole?: UserRole | null;
}

export interface LogErrorHistoryEntryInput {
  category: string;
  code: string;
  fingerprint: string;
  locale?: string | null;
  message: string;
  metadataJson: string;
  method: string;
  path: string;
  requestId: string;
  routeId?: string | null;
  severity: "critical" | "error" | "info" | "warn";
  stack?: string | null;
  statusCode: number;
  userId?: string | null;
  userRole?: UserRole | null;
}

export interface LogDateRange {
  from?: Date | null;
  to?: Date | null;
}

export interface LogTablePagination {
  direction: LoggingPaginationDirection;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor: string | null;
  pageSize: number;
  previousCursor: string | null;
}

export interface LogPageOptions {
  cursor?: LoggingCursor | null;
  direction?: LoggingPaginationDirection;
  pageSize?: number;
}

export const DASHBOARD_LOGGING_PAGE_SIZE = 25;
export const DASHBOARD_LOGGING_EXPORT_MAX_ROWS = 1000;
const LOGGING_COUNTS_CACHE_KEY = "app://cache/dashboard/logging/counts";
const loggingCountsSchema = z.object({
  errorCount: z.number().int().nonnegative(),
  historyCount: z.number().int().nonnegative(),
});

function toCursorDate(cursor: LoggingCursor) {
  return new Date(cursor.createdAtIso);
}

function buildOlderThanCursorFilter(
  columnCreatedAt: typeof logHistory.createdAt | typeof logErrorHistory.createdAt,
  columnId: typeof logHistory.id | typeof logErrorHistory.id,
  cursor: LoggingCursor,
) {
  const createdAt = toCursorDate(cursor);

  return or(
    lt(columnCreatedAt, createdAt),
    and(eq(columnCreatedAt, createdAt), lt(columnId, cursor.id)),
  );
}

function buildNewerThanCursorFilter(
  columnCreatedAt: typeof logHistory.createdAt | typeof logErrorHistory.createdAt,
  columnId: typeof logHistory.id | typeof logErrorHistory.id,
  cursor: LoggingCursor,
) {
  const createdAt = toCursorDate(cursor);

  return or(
    gt(columnCreatedAt, createdAt),
    and(eq(columnCreatedAt, createdAt), gt(columnId, cursor.id)),
  );
}

function buildPaginationState<Row extends { createdAt: Date; id: string }>(args: {
  direction: LoggingPaginationDirection;
  entries: Row[];
  hasOlderEntries: boolean;
  hasNewerEntries: boolean;
  pageSize: number;
}): LogTablePagination {
  const firstEntry = args.entries[0];
  const lastEntry = args.entries.at(-1);

  return {
    direction: args.direction,
    hasNextPage: args.hasOlderEntries,
    hasPreviousPage: args.hasNewerEntries,
    nextCursor:
      args.hasOlderEntries && lastEntry
        ? buildLoggingCursor({
            createdAt: lastEntry.createdAt,
            id: lastEntry.id,
          })
        : null,
    pageSize: args.pageSize,
    previousCursor:
      args.hasNewerEntries && firstEntry
        ? buildLoggingCursor({
            createdAt: firstEntry.createdAt,
            id: firstEntry.id,
          })
        : null,
  };
}

function buildCreatedAtRangeFilter(
  column: typeof logHistory.createdAt | typeof logErrorHistory.createdAt,
  range: LogDateRange,
) {
  const filters = [];

  if (range.from) {
    filters.push(gte(column, range.from));
  }

  if (range.to) {
    filters.push(lte(column, range.to));
  }

  if (filters.length === 0) {
    return undefined;
  }

  return filters.length === 1 ? filters[0] : and(...filters);
}

function supportsInsert(db: AppLoadContext["db"]): db is AppLoadContext["db"] & {
  insert: AppLoadContext["db"]["insert"];
} {
  return "insert" in db && typeof db.insert === "function";
}

export async function insertLogHistoryEntry(
  context: AppLoadContext,
  entry: LogHistoryEntryInput,
) {
  const db = getDbFromContext(context);

  if (!supportsInsert(db)) {
    return;
  }

  await db.insert(logHistory).values({
    action: entry.action,
    message: entry.message,
    metadataJson: entry.metadataJson,
    method: entry.method,
    path: entry.path,
    requestId: entry.requestId,
    resource: entry.resource,
    result: entry.result,
    statusCode: entry.statusCode,
    targetId: entry.targetId ?? null,
    targetLabel: entry.targetLabel ?? null,
    userId: entry.userId ?? null,
    userRole: entry.userRole ?? null,
  });
  await getAppDataCache(context).delete(LOGGING_COUNTS_CACHE_KEY);
}

export async function insertLogErrorHistoryEntry(
  context: AppLoadContext,
  entry: LogErrorHistoryEntryInput,
) {
  const db = getDbFromContext(context);

  if (!supportsInsert(db)) {
    return;
  }

  await db.insert(logErrorHistory).values({
    category: entry.category,
    code: entry.code,
    fingerprint: entry.fingerprint,
    locale: entry.locale ?? null,
    message: entry.message,
    metadataJson: entry.metadataJson,
    method: entry.method,
    path: entry.path,
    requestId: entry.requestId,
    routeId: entry.routeId ?? null,
    severity: entry.severity,
    stack: entry.stack ?? null,
    statusCode: entry.statusCode,
    userId: entry.userId ?? null,
    userRole: entry.userRole ?? null,
  });
  await getAppDataCache(context).delete(LOGGING_COUNTS_CACHE_KEY);
}

export async function listLogHistoryEntries(
  context: AppLoadContext,
  options: LogDateRange & {
    limit?: number;
  } = {},
) {
  const db = getDbFromContext(context);
  let query = db
    .select()
    .from(logHistory)
    .orderBy(desc(logHistory.createdAt), desc(logHistory.id))
    .$dynamic();
  const rangeFilter = buildCreatedAtRangeFilter(logHistory.createdAt, options);

  if (rangeFilter) {
    query = query.where(rangeFilter);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  return query;
}

export async function listLogHistoryPage(
  context: AppLoadContext,
  options: LogPageOptions = {},
) {
  const db = getDbFromContext(context);
  const pageSize = options.pageSize ?? DASHBOARD_LOGGING_PAGE_SIZE;
  const direction = options.direction ?? LOGGING_PAGINATION_DIRECTION.next;
  let query = db.select().from(logHistory).$dynamic();

  if (options.cursor) {
    query = query.where(
      direction === LOGGING_PAGINATION_DIRECTION.previous
        ? buildNewerThanCursorFilter(
            logHistory.createdAt,
            logHistory.id,
            options.cursor,
          )
        : buildOlderThanCursorFilter(
            logHistory.createdAt,
            logHistory.id,
            options.cursor,
          ),
    );
  }

  const orderedRows = await query
    .orderBy(
      direction === LOGGING_PAGINATION_DIRECTION.previous
        ? asc(logHistory.createdAt)
        : desc(logHistory.createdAt),
      direction === LOGGING_PAGINATION_DIRECTION.previous
        ? asc(logHistory.id)
        : desc(logHistory.id),
    )
    .limit(pageSize + 1);
  const visibleRows = orderedRows.slice(0, pageSize);
  const entries =
    direction === LOGGING_PAGINATION_DIRECTION.previous
      ? [...visibleRows].reverse()
      : visibleRows;
  const hasExtraRow = orderedRows.length > pageSize;
  const hasOlderEntries =
    direction === LOGGING_PAGINATION_DIRECTION.previous
      ? Boolean(options.cursor)
      : hasExtraRow;
  const hasNewerEntries =
    direction === LOGGING_PAGINATION_DIRECTION.previous
      ? hasExtraRow
      : Boolean(options.cursor);

  return {
    entries,
    pagination: buildPaginationState({
      direction,
      entries,
      hasNewerEntries,
      hasOlderEntries,
      pageSize,
    }),
  };
}

export async function listLogErrorHistoryEntries(
  context: AppLoadContext,
  options: LogDateRange & {
    limit?: number;
  } = {},
) {
  const db = getDbFromContext(context);
  let query = db
    .select()
    .from(logErrorHistory)
    .orderBy(desc(logErrorHistory.createdAt), desc(logErrorHistory.id))
    .$dynamic();
  const rangeFilter = buildCreatedAtRangeFilter(logErrorHistory.createdAt, options);

  if (rangeFilter) {
    query = query.where(rangeFilter);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  return query;
}

export async function listLogErrorHistoryPage(
  context: AppLoadContext,
  options: LogPageOptions = {},
) {
  const db = getDbFromContext(context);
  const pageSize = options.pageSize ?? DASHBOARD_LOGGING_PAGE_SIZE;
  const direction = options.direction ?? LOGGING_PAGINATION_DIRECTION.next;
  let query = db.select().from(logErrorHistory).$dynamic();

  if (options.cursor) {
    query = query.where(
      direction === LOGGING_PAGINATION_DIRECTION.previous
        ? buildNewerThanCursorFilter(
            logErrorHistory.createdAt,
            logErrorHistory.id,
            options.cursor,
          )
        : buildOlderThanCursorFilter(
            logErrorHistory.createdAt,
            logErrorHistory.id,
            options.cursor,
          ),
    );
  }

  const orderedRows = await query
    .orderBy(
      direction === LOGGING_PAGINATION_DIRECTION.previous
        ? asc(logErrorHistory.createdAt)
        : desc(logErrorHistory.createdAt),
      direction === LOGGING_PAGINATION_DIRECTION.previous
        ? asc(logErrorHistory.id)
        : desc(logErrorHistory.id),
    )
    .limit(pageSize + 1);
  const visibleRows = orderedRows.slice(0, pageSize);
  const entries =
    direction === LOGGING_PAGINATION_DIRECTION.previous
      ? [...visibleRows].reverse()
      : visibleRows;
  const hasExtraRow = orderedRows.length > pageSize;
  const hasOlderEntries =
    direction === LOGGING_PAGINATION_DIRECTION.previous
      ? Boolean(options.cursor)
      : hasExtraRow;
  const hasNewerEntries =
    direction === LOGGING_PAGINATION_DIRECTION.previous
      ? hasExtraRow
      : Boolean(options.cursor);

  return {
    entries,
    pagination: buildPaginationState({
      direction,
      entries,
      hasNewerEntries,
      hasOlderEntries,
      pageSize,
    }),
  };
}

export async function deleteLogErrorHistoryEntriesByDateRange(
  context: AppLoadContext,
  range: LogDateRange,
) {
  const db = getDbFromContext(context);
  const where = buildCreatedAtRangeFilter(logErrorHistory.createdAt, range);

  if (!where) {
    return 0;
  }

  const result = await db
    .delete(logErrorHistory)
    .where(where)
    .returning({ id: logErrorHistory.id });

  if (result.length > 0) {
    await getAppDataCache(context).delete(LOGGING_COUNTS_CACHE_KEY);
  }

  return result.length;
}

export async function deleteLogHistoryEntriesByDateRange(
  context: AppLoadContext,
  range: LogDateRange,
) {
  const db = getDbFromContext(context);
  const where = buildCreatedAtRangeFilter(logHistory.createdAt, range);

  if (!where) {
    return 0;
  }

  const result = await db
    .delete(logHistory)
    .where(where)
    .returning({ id: logHistory.id });

  if (result.length > 0) {
    await getAppDataCache(context).delete(LOGGING_COUNTS_CACHE_KEY);
  }

  return result.length;
}

async function countLogEntriesFromDb(context: AppLoadContext) {
  const db = getDbFromContext(context);
  const [historyCount, errorCount] = await Promise.all([
    db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(logHistory)
      .then((rows) => rows[0]),
    db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(logErrorHistory)
      .then((rows) => rows[0]),
  ]);

  return {
    errorCount: Number(errorCount?.count ?? 0),
    historyCount: Number(historyCount?.count ?? 0),
  };
}

export async function countLogEntries(
  context: AppLoadContext,
  options: {
    includeErrorCount?: boolean;
    includeHistoryCount?: boolean;
  } = {},
) {
  const includeHistoryCount = options.includeHistoryCount ?? true;
  const includeErrorCount = options.includeErrorCount ?? true;
  const cache = getAppDataCache(context);
  let totals = await cache.get(LOGGING_COUNTS_CACHE_KEY, loggingCountsSchema);

  if (!totals) {
    totals = await countLogEntriesFromDb(context);
    await cache.set(LOGGING_COUNTS_CACHE_KEY, totals, {
      maxAgeSeconds: 60,
      staleWhileRevalidateSeconds: 300,
    });
  }

  return {
    errorCount: includeErrorCount ? totals.errorCount : 0,
    historyCount: includeHistoryCount ? totals.historyCount : 0,
  };
}

export async function listLogErrorHistoryEntriesAscending(
  context: AppLoadContext,
  range: LogDateRange,
  options: {
    limit?: number;
  } = {},
) {
  const db = getDbFromContext(context);
  let query = db
    .select()
    .from(logErrorHistory)
    .orderBy(asc(logErrorHistory.createdAt), asc(logErrorHistory.id))
    .$dynamic();
  const where = buildCreatedAtRangeFilter(logErrorHistory.createdAt, range);

  if (where) {
    query = query.where(where);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  return query;
}

export async function listLogHistoryEntriesAscending(
  context: AppLoadContext,
  range: LogDateRange,
  options: {
    limit?: number;
  } = {},
) {
  const db = getDbFromContext(context);
  let query = db
    .select()
    .from(logHistory)
    .orderBy(asc(logHistory.createdAt), asc(logHistory.id))
    .$dynamic();
  const where = buildCreatedAtRangeFilter(logHistory.createdAt, range);

  if (where) {
    query = query.where(where);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  return query;
}

export async function loadDashboardLoggingOverview(
  context: AppLoadContext,
  options: {
    errorPage?: LogPageOptions;
    historyPage?: LogPageOptions;
    includeErrorTotals?: boolean;
    includeHistoryTotals?: boolean;
  } = {},
) {
  const [totals, historyPage, errorPage] = await Promise.all([
    countLogEntries(context, {
      includeErrorCount: options.includeErrorTotals,
      includeHistoryCount: options.includeHistoryTotals,
    }),
    options.historyPage
      ? listLogHistoryPage(context, options.historyPage)
      : Promise.resolve({
          entries: [],
          pagination: buildPaginationState({
            direction: LOGGING_PAGINATION_DIRECTION.next,
            entries: [],
            hasNewerEntries: false,
            hasOlderEntries: false,
            pageSize: DASHBOARD_LOGGING_PAGE_SIZE,
          }),
        }),
    options.errorPage
      ? listLogErrorHistoryPage(context, options.errorPage)
      : Promise.resolve({
          entries: [],
          pagination: buildPaginationState({
            direction: LOGGING_PAGINATION_DIRECTION.next,
            entries: [],
            hasNewerEntries: false,
            hasOlderEntries: false,
            pageSize: DASHBOARD_LOGGING_PAGE_SIZE,
          }),
        }),
  ]);

  return {
    errorPage,
    historyPage,
    totals,
  };
}

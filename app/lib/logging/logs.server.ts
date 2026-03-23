import { and, asc, desc, gte, lte, sql } from "drizzle-orm";

import { getDbFromContext } from "../../../db/context";
import type { UserRole } from "../../../db/schema";
import { logErrorHistory, logHistory } from "../../../db/schema";
import type { AppLoadContext } from "react-router";

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

  return result.length;
}

export async function countLogEntries(context: AppLoadContext) {
  const db = getDbFromContext(context);
  const [historyCount] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(logHistory);
  const [errorCount] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(logErrorHistory);

  return {
    errorCount: Number(errorCount?.count ?? 0),
    historyCount: Number(historyCount?.count ?? 0),
  };
}

export async function listLogErrorHistoryEntriesAscending(
  context: AppLoadContext,
  range: LogDateRange,
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

  return query;
}

export async function loadDashboardLoggingOverview(
  context: AppLoadContext,
  options: {
    limit?: number;
  } = {},
) {
  const limit = options.limit ?? 50;
  const [totals, historyEntries, errorEntries] = await Promise.all([
    countLogEntries(context),
    listLogHistoryEntries(context, { limit }),
    listLogErrorHistoryEntries(context, { limit }),
  ]);

  return {
    errorEntries,
    historyEntries,
    totals,
  };
}

export function formatLogErrorHistoryExport(
  rows: Awaited<ReturnType<typeof listLogErrorHistoryEntriesAscending>>,
) {
  return rows
    .map((row) =>
      [
        `[${row.createdAt.toISOString()}] ${row.severity.toUpperCase()} ${row.code}`,
        `request=${row.requestId} path=${row.path} method=${row.method}`,
        `message=${row.message}`,
        row.stack ? `stack=${row.stack}` : null,
        `metadata=${row.metadataJson}`,
        "",
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n");
}

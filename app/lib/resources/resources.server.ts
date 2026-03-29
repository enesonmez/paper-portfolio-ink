import { and, asc, eq, ne, sql } from "drizzle-orm";

import type { AppDb } from "../../../db";
import { locales, translations } from "../../../db/schema";

import type { LocaleSubmission, TranslationSubmission } from "./resources-form.server";

export interface LocaleResourceRecord {
  code: string;
  createdAtLabel: string;
  isActive: boolean;
  isDefault: boolean;
  label: string;
  sortOrder: number;
  translationCount: number;
  updatedAtLabel: string;
}

export interface TranslationResourceRecord {
  createdAtLabel: string;
  key: string;
  locale: string;
  updatedAtLabel: string;
  value: string;
}

export interface TranslationResourcePage {
  currentPage: number;
  rows: TranslationResourceRecord[];
  totalCount: number;
}

function formatDateLabel(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function isUniqueLocaleConstraintError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes("UNIQUE constraint failed: locales.code")
  );
}

export function isUniqueTranslationConstraintError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes(
      "UNIQUE constraint failed: translations.locale, translations.key",
    )
  );
}

export function isResourceForeignKeyConstraintError(error: unknown) {
  return (
    error instanceof Error && error.message.includes("FOREIGN KEY constraint failed")
  );
}

function escapeSqlLikeValue(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");
}

function buildTranslationSearchCondition(localeCode: string, searchQuery?: string) {
  const normalizedSearch = searchQuery?.trim().toLowerCase();

  if (!normalizedSearch) {
    return eq(translations.locale, localeCode);
  }

  const pattern = `%${escapeSqlLikeValue(normalizedSearch)}%`;

  return and(
    eq(translations.locale, localeCode),
    sql`(
      lower(${translations.key}) like ${pattern} escape '\\'
      or lower(${translations.value}) like ${pattern} escape '\\'
    )`,
  );
}

const LOCALE_ORDER_BY = [asc(locales.sortOrder), asc(locales.code)] as const;

const TRANSLATION_COUNT_SUBQUERY = sql<number>`(
  select count(*)
  from ${translations}
  where ${translations.locale} = ${locales.code}
)`;

export async function listLocales(db: AppDb): Promise<LocaleResourceRecord[]> {
  const rows = await db
    .select({
      code: locales.code,
      createdAt: locales.createdAt,
      isActive: locales.isActive,
      isDefault: locales.isDefault,
      label: locales.label,
      sortOrder: locales.sortOrder,
      translationCount: TRANSLATION_COUNT_SUBQUERY,
      updatedAt: locales.updatedAt,
    })
    .from(locales)
    .orderBy(...LOCALE_ORDER_BY);

  return rows.map((row) => ({
    code: row.code,
    createdAtLabel: formatDateLabel(row.createdAt),
    isActive: row.isActive,
    isDefault: row.isDefault,
    label: row.label,
    sortOrder: row.sortOrder,
    translationCount: Number(row.translationCount ?? 0),
    updatedAtLabel: formatDateLabel(row.updatedAt),
  }));
}

export async function findLocaleByCode(db: AppDb, code: string) {
  const [row] = await db
    .select({
      code: locales.code,
      createdAt: locales.createdAt,
      isActive: locales.isActive,
      isDefault: locales.isDefault,
      label: locales.label,
      sortOrder: locales.sortOrder,
      translationCount: TRANSLATION_COUNT_SUBQUERY,
      updatedAt: locales.updatedAt,
    })
    .from(locales)
    .where(eq(locales.code, code))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    code: row.code,
    createdAtLabel: formatDateLabel(row.createdAt),
    isActive: row.isActive,
    isDefault: row.isDefault,
    label: row.label,
    sortOrder: row.sortOrder,
    translationCount: Number(row.translationCount ?? 0),
    updatedAtLabel: formatDateLabel(row.updatedAt),
  } satisfies LocaleResourceRecord;
}

export async function listTranslationsByLocale(
  db: AppDb,
  localeCode: string,
  options: {
    page: number;
    pageSize: number;
    searchQuery?: string;
    totalCountHint?: number;
  },
): Promise<TranslationResourcePage> {
  const whereClause = buildTranslationSearchCondition(localeCode, options.searchQuery);
  const normalizedSearch = options.searchQuery?.trim();
  const totalCount =
    !normalizedSearch && typeof options.totalCountHint === "number"
      ? options.totalCountHint
      : Number(
          (
            await db
              .select({
                count: sql<number>`count(*)`,
              })
              .from(translations)
              .where(whereClause)
          )[0]?.count ?? 0,
        );
  const pageCount =
    totalCount === 0 ? 1 : Math.ceil(totalCount / Math.max(options.pageSize, 1));
  const currentPage = Math.min(Math.max(options.page, 1), pageCount);
  const offset = (currentPage - 1) * options.pageSize;
  const rows = await db
    .select({
      createdAt: translations.createdAt,
      key: translations.key,
      locale: translations.locale,
      updatedAt: translations.updatedAt,
      value: translations.value,
    })
    .from(translations)
    .where(whereClause)
    .orderBy(asc(translations.key))
    .limit(Math.max(options.pageSize, 1))
    .offset(offset);

  return {
    currentPage,
    rows: rows.map((row) => ({
      createdAtLabel: formatDateLabel(row.createdAt),
      key: row.key,
      locale: row.locale,
      updatedAtLabel: formatDateLabel(row.updatedAt),
      value: row.value,
    })),
    totalCount,
  };
}

export async function findTranslation(
  db: AppDb,
  localeCode: string,
  key: string,
): Promise<TranslationResourceRecord | null> {
  const [row] = await db
    .select({
      createdAt: translations.createdAt,
      key: translations.key,
      locale: translations.locale,
      updatedAt: translations.updatedAt,
      value: translations.value,
    })
    .from(translations)
    .where(and(eq(translations.locale, localeCode), eq(translations.key, key)))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    createdAtLabel: formatDateLabel(row.createdAt),
    key: row.key,
    locale: row.locale,
    updatedAtLabel: formatDateLabel(row.updatedAt),
    value: row.value,
  };
}

export async function createLocale(db: AppDb, submission: LocaleSubmission) {
  const timestamp = new Date();
  const insertStatement = db.insert(locales).values({
    code: submission.code,
    createdAt: timestamp,
    isActive: submission.isActive,
    isDefault: submission.isDefault,
    label: submission.label,
    sortOrder: submission.sortOrder,
    updatedAt: timestamp,
  });

  if (!submission.isDefault) {
    await insertStatement;
    return;
  }

  await db.batch([
    db
      .update(locales)
      .set({
        isDefault: false,
        updatedAt: timestamp,
      })
      .where(ne(locales.code, submission.code)),
    insertStatement,
  ]);
}

export async function updateLocale(
  db: AppDb,
  originalCode: string,
  submission: LocaleSubmission,
  options: {
    promotedDefaultCode?: string;
  } = {},
) {
  const timestamp = new Date();

  if (submission.isDefault) {
    await db.batch([
      db
        .update(locales)
        .set({
          isDefault: false,
          updatedAt: timestamp,
        })
        .where(ne(locales.code, originalCode)),
      db
        .update(locales)
        .set({
          code: submission.code,
          isActive: submission.isActive,
          isDefault: submission.isDefault,
          label: submission.label,
          sortOrder: submission.sortOrder,
          updatedAt: timestamp,
        })
        .where(eq(locales.code, originalCode)),
    ]);

    return;
  }

  if (options.promotedDefaultCode) {
    await db.batch([
      db
        .update(locales)
        .set({
          isActive: true,
          isDefault: true,
          updatedAt: timestamp,
        })
        .where(eq(locales.code, options.promotedDefaultCode)),
      db
        .update(locales)
        .set({
          code: submission.code,
          isActive: submission.isActive,
          isDefault: submission.isDefault,
          label: submission.label,
          sortOrder: submission.sortOrder,
          updatedAt: timestamp,
        })
        .where(eq(locales.code, originalCode)),
    ]);

    return;
  }

  await db
    .update(locales)
    .set({
      code: submission.code,
      isActive: submission.isActive,
      isDefault: submission.isDefault,
      label: submission.label,
      sortOrder: submission.sortOrder,
      updatedAt: timestamp,
    })
    .where(eq(locales.code, originalCode));
}

export async function deleteLocale(
  db: AppDb,
  code: string,
  options: {
    promotedDefaultCode?: string;
  } = {},
) {
  const timestamp = new Date();

  if (!options.promotedDefaultCode) {
    await db.delete(locales).where(eq(locales.code, code));
    return;
  }

  await db.batch([
    db
      .update(locales)
      .set({
        isActive: true,
        isDefault: true,
        updatedAt: timestamp,
      })
      .where(eq(locales.code, options.promotedDefaultCode)),
    db.delete(locales).where(eq(locales.code, code)),
  ]);
}

export async function createTranslation(db: AppDb, submission: TranslationSubmission) {
  const timestamp = new Date();

  await db.insert(translations).values({
    createdAt: timestamp,
    key: submission.key,
    locale: submission.locale,
    updatedAt: timestamp,
    value: submission.value,
  });
}

export async function updateTranslation(
  db: AppDb,
  originalLocale: string,
  originalKey: string,
  submission: TranslationSubmission,
) {
  const updatedRows = await db
    .update(translations)
    .set({
      key: submission.key,
      locale: submission.locale,
      updatedAt: new Date(),
      value: submission.value,
    })
    .where(
      and(eq(translations.locale, originalLocale), eq(translations.key, originalKey)),
    )
    .returning({
      key: translations.key,
      locale: translations.locale,
    });

  return updatedRows.length > 0;
}

export async function deleteTranslation(db: AppDb, localeCode: string, key: string) {
  const deletedRows = await db
    .delete(translations)
    .where(and(eq(translations.locale, localeCode), eq(translations.key, key)))
    .returning({
      key: translations.key,
      locale: translations.locale,
    });

  return deletedRows.length > 0;
}

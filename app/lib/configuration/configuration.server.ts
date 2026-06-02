import { asc, inArray } from "drizzle-orm";
import { z } from "zod";
import type { AppLoadContext } from "react-router";

import type { AppDb } from "../../../db";
import { getDbFromContext } from "../../../db/context";
import { configurationParameters } from "../../../db/schema";
import {
  ACCOUNT_CONFIGURATION_DEFINITIONS,
  ACCOUNT_CONFIGURATION_KEYS,
  getDefaultAccountConfigurationRecord,
  type AccountConfigurationKey,
} from "~/domain/configuration/model";
import { invalidateCachedData, loadCachedData } from "~/shared/cache/data-cache.server";

const configurationParameterStoreSchema = z.record(z.string(), z.string());

const configurationRequestCache = new WeakMap<
  Request,
  Promise<Record<AccountConfigurationKey, string>>
>();

export function buildConfigurationCacheKey(request: Request) {
  return new URL("/__cache/configuration/parameters", request.url).toString();
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "";
}

function isMissingConfigurationTableError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes("no such table") && message.includes("configuration_parameters")
  );
}

function normalizeConfigurationStore(
  store: Partial<Record<AccountConfigurationKey, string>>,
) {
  return ACCOUNT_CONFIGURATION_DEFINITIONS.reduce<
    Record<AccountConfigurationKey, string>
  >((result, definition) => {
    result[definition.key] = store[definition.key] ?? definition.defaultValue;
    return result;
  }, getDefaultAccountConfigurationRecord());
}

export interface AccountConfigurationRecord {
  key: AccountConfigurationKey;
  value: string;
}

export async function listAccountConfigurationParameters(db: AppDb) {
  try {
    const rows = await db
      .select({
        key: configurationParameters.key,
        value: configurationParameters.value,
      })
      .from(configurationParameters)
      .where(inArray(configurationParameters.key, ACCOUNT_CONFIGURATION_KEYS))
      .orderBy(asc(configurationParameters.key));

    return normalizeConfigurationStore(
      Object.fromEntries(
        rows.map((row) => [row.key as AccountConfigurationKey, row.value]),
      ),
    );
  } catch (error) {
    if (isMissingConfigurationTableError(error)) {
      return getDefaultAccountConfigurationRecord();
    }

    throw error;
  }
}

export async function loadAccountConfigurationParameters(
  context: AppLoadContext,
  request: Request,
) {
  const cachedPromise = configurationRequestCache.get(request);

  if (cachedPromise) {
    return cachedPromise;
  }

  const promise = loadCachedData({
    context,
    key: buildConfigurationCacheKey(request),
    load: () => listAccountConfigurationParameters(getDbFromContext(context)),
    options: {
      maxAgeSeconds: 60 * 30,
      staleWhileRevalidateSeconds: 60 * 60 * 12,
    },
    schema: configurationParameterStoreSchema.transform((value) =>
      normalizeConfigurationStore(
        value as Partial<Record<AccountConfigurationKey, string>>,
      ),
    ),
  });

  configurationRequestCache.set(request, promise);

  return promise;
}

export async function purgeAccountConfigurationCache(
  context: AppLoadContext,
  request: Request,
) {
  await invalidateCachedData(context, buildConfigurationCacheKey(request));
}

export async function warmAccountConfigurationCache(
  context: AppLoadContext,
  request: Request,
) {
  await loadAccountConfigurationParameters(context, request);
}

export async function updateAccountConfigurationParameter(
  db: AppDb,
  input: AccountConfigurationRecord,
) {
  await db
    .insert(configurationParameters)
    .values({
      key: input.key,
      value: input.value,
    })
    .onConflictDoUpdate({
      set: {
        updatedAt: new Date(),
        value: input.value,
      },
      target: configurationParameters.key,
    });
}

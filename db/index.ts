import type { DatabaseProvider } from "./contracts";
import { d1Provider, type D1Bindings, type D1Db } from "./providers/d1";

export type DatabaseBootstrapInput = D1Bindings;

export type AppDb = D1Db;

export type AppDatabaseProvider = DatabaseProvider<DatabaseBootstrapInput, AppDb>;

export const databaseProvider: AppDatabaseProvider = d1Provider;

export function createAppDb(input: DatabaseBootstrapInput): AppDb {
  return databaseProvider.createDb(input);
}

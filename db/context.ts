import type { AppDb } from "./index";

interface DbContextShape {
  db: AppDb;
}

export function getDbFromContext(context: DbContextShape): AppDb {
  return context.db;
}

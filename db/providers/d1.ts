import { drizzle } from "drizzle-orm/d1";

import { schema } from "../schema";
import type { DatabaseProvider } from "../contracts";

export interface D1Bindings {
  DB: D1Database;
}

export function createD1Db(binding: D1Database) {
  return drizzle(binding, {
    casing: "snake_case",
    schema,
  });
}

export type D1Db = ReturnType<typeof createD1Db>;

export const d1Provider: DatabaseProvider<D1Bindings, D1Db> = {
  createDb(env) {
    return createD1Db(env.DB);
  },
};

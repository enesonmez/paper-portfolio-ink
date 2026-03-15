export interface DatabaseProvider<TEnv, TDb> {
  createDb(env: TEnv): TDb;
}

import type { DatabaseBootstrapInput } from "../db";

import type { CloudflareAuthEnvBindings } from "./auth-env";

export interface CloudflareAppBindings
  extends DatabaseBootstrapInput, CloudflareAuthEnvBindings {}

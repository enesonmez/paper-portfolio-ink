import type { DatabaseBootstrapInput } from "../db";

import type { CloudflareAnalyticsEnvBindings } from "./analytics-env";
import type { CloudflareAuthEnvBindings } from "./auth-env";

export interface CloudflareAppBindings
  extends
    DatabaseBootstrapInput,
    CloudflareAnalyticsEnvBindings,
    CloudflareAuthEnvBindings {}

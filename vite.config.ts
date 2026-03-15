import tailwindcss from "@tailwindcss/vite";
import { reactRouter } from "@react-router/dev/vite";
import { cloudflareDevProxy } from "@react-router/dev/vite/cloudflare";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

import { createCloudflareLoadContext } from "./workers/load-context";
import type { CloudflareAppBindings } from "./workers/bindings";

export default defineConfig({
  plugins: [
    cloudflareDevProxy<CloudflareAppBindings, Record<string, unknown>>({
      getLoadContext({ context, request }) {
        return createCloudflareLoadContext({
          env: context.cloudflare.env,
          request,
        });
      },
    }),
    reactRouter(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./app", import.meta.url)),
    },
  },
});

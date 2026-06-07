import type { Route } from "./+types/chrome-devtools";

const LOCAL_DEVTOOLS_HOSTNAMES = new Set(["127.0.0.1", "::1", "[::1]", "localhost"]);

function isLocalDevtoolsRequest(request: Request) {
  const { hostname } = new URL(request.url);

  return (
    LOCAL_DEVTOOLS_HOSTNAMES.has(hostname) ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".localhost")
  );
}

export function loader({ context, request }: Route.LoaderArgs) {
  if (context.runtime.platform === "cloudflare" && !isLocalDevtoolsRequest(request)) {
    return new Response(null, { status: 404 });
  }

  return Response.json({
    workspace: "paper-portfolio-ink",
  });
}

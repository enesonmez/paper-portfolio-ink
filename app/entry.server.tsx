import { renderToReadableStream } from "react-dom/server";
import type { AppLoadContext, EntryContext } from "react-router";
import { ServerRouter } from "react-router";

import { normalizeAppError } from "~/shared/errors/app-error.server";
import { reportAppError } from "~/shared/errors/report.server";
import { applySecurityHeaders, createCspNonce } from "~/shared/security/headers.server";

function isRootLoaderData(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function injectRootCspNonce(routerContext: EntryContext, nonce: string) {
  const rootLoaderData: unknown = routerContext.staticHandlerContext.loaderData.root;

  if (!isRootLoaderData(rootLoaderData)) {
    return;
  }

  routerContext.staticHandlerContext.loaderData.root = {
    ...rootLoaderData,
    cspNonce: nonce,
  };
}

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
) {
  const cspNonce = createCspNonce();
  injectRootCspNonce(routerContext, cspNonce);
  const body = await renderToReadableStream(
    <ServerRouter context={routerContext} url={request.url} nonce={cspNonce} />,
    {
      signal: request.signal,
      onError(error: unknown) {
        console.error(
          JSON.stringify({
            error:
              error instanceof Error
                ? {
                    message: error.message,
                    name: error.name,
                  }
                : {
                    thrown: typeof error,
                  },
            path: new URL(request.url).pathname,
            type: "render_error",
          }),
        );
        responseStatusCode = 500;
      },
    },
  );

  const headers = applySecurityHeaders(responseHeaders, { nonce: cspNonce });
  headers.set("Content-Type", "text/html; charset=utf-8");

  return new Response(body, {
    headers,
    status: responseStatusCode,
  });
}

export async function handleError(
  error: unknown,
  { context, request }: { context: AppLoadContext; request: Request },
) {
  if (request.signal.aborted) {
    return;
  }

  try {
    await reportAppError({
      context,
      error: normalizeAppError(error),
      request,
    });
  } catch (reportingError) {
    console.error(
      JSON.stringify({
        error:
          reportingError instanceof Error
            ? {
                message: reportingError.message,
                name: reportingError.name,
              }
            : {
                thrown: typeof reportingError,
              },
        path: new URL(request.url).pathname,
        type: "error_reporting_failure",
      }),
    );
  }
}

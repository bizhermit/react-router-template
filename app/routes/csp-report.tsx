import type { Route } from "./+types/csp-report";

export async function action({ request }: Route.ActionArgs) {
  try {
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return new Response("Invalid content type", { status: 400 });
    }

    const json = await request.json();

    // CSP違反レポートを構造化してログ出力
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: "csp-violation",
      report: json,
      userAgent: request.headers.get("user-agent"),
      referer: request.headers.get("referer"),
    };

    process.stderr.write(`CSP Violation Report: ${JSON.stringify(logEntry, null, 2)}\n`);
  } catch (error) {
    console.error("Failed to process CSP report:", error);
  }

  return new Response("", {
    status: 204,
  });
};

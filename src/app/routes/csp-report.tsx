import type { Route } from "./+types/csp-report";

export async function action({ request }: Route.ActionArgs) {
  try {
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json") && !contentType?.includes("application/csp-report")) {
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
      clientIP: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
    };

    // 本番環境では専用のログ出力、開発環境では詳細出力
    if (process.env.NODE_ENV === "production") {
      process.stderr.write(`CSP-VIOLATION: ${JSON.stringify(logEntry)}\n`);
    } else {
      console.warn("CSP Violation Report:", JSON.stringify(logEntry, null, 2));
    }
  } catch (error) {
    console.error("Failed to process CSP report:", error);
  }

  return new Response("", {
    status: 204,
  });
};

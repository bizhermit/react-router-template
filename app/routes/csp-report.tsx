import type { Route } from "./+types/csp-report";

export async function action({ request }: Route.ActionArgs) {
  try {
    const json = await request.json();
    process.stderr.write(`CSP Violation Report: ${JSON.stringify(json, null, 2)}\n`);
  } catch {
    // ignore
  }
  return new Response("", {
    status: 204,
  });
};

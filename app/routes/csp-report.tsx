import type { Route } from "./+types/csp-report";

export async function action({ request }: Route.ActionArgs) {
  const json = await request.json();
  process.stderr.write(`CSP Violation Report: ${JSON.stringify(json, null, 2)}\n`);
  return new Response("", {
    status: 204,
  });
}
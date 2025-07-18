/* eslint-disable no-console */

import sleep from "~/components/utilities/sleep";
import type { Route } from "./+types/stream-api";

const SAMPLE_TEXT = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export async function action({ request }: Route.ActionArgs) {
  const encorder = new TextEncoder();

  let aborted = false;
  request.signal.addEventListener("abort", () => {
    aborted = true;
    console.warn("Client aborted the request.");
  });

  const stream = new ReadableStream({
    start: async (controller) => {
      for (let i = 0, il = 100; i < il; i++) {
        if (aborted) break;
        const char = SAMPLE_TEXT[i % SAMPLE_TEXT.length];
        await sleep(100);
        controller.enqueue(encorder.encode(char));
        console.log(`streaming: ${char}`);
      }
      if (!aborted) controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
};

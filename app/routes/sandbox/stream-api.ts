import sleep from "~/components/utilities/sleep";

const SAMPLE_TEXT = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export async function action() {
  const encorder = new TextEncoder();

  const stream = new ReadableStream({
    start: async (controller) => {
      for (let i = 0, il = 1000; i < il; i++) {
        await sleep(100);
        controller.enqueue(encorder.encode(SAMPLE_TEXT[i % SAMPLE_TEXT.length]));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
};

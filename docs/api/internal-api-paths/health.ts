export const path_health = {
  path: "/health",
  get: {
    summary: "ヘルスチェック",
    responses: {
      200: {
        content: {
          json: {
            type: "object",
            props: {
              now: {
                type: "datetime",
                example: "2025-01-01T00:00:00.000Z",
              },
            },
          },
        },
      },
    },
  },
} satisfies ApiDoc.Path;

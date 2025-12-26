import { extendsValueObjectProps } from "../../utilities/merge";

const newSandboxItem = {
  type: "object",
  componentName: "NewSandBoxItem",
  props: {
    title: {
      type: "string",
      required: true,
      example: "title",
    },
    body: {
      type: "string",
      required: true,
      example: "body",
    },
    updatedAt: {
      type: "datetime",
      required: true,
      example: "2025-01-01T00:00:00.000Z",
    },
  },
} satisfies ApiDoc.Value_Object;

const sandboxItem = extendsValueObjectProps(newSandboxItem, {
  componentName: "SandBoxItem",
  props: {
    id: {
      type: "string",
      required: true,
      example: "abc123",
    },
  },
});

export const paths_sandbox = [
  {
    path: "/sandbox/api",
    get: {
      summary: "一覧の取得",
      parameters: {
        query: {
          limit: {
            description: "1ページあたりの件数",
            type: "integer",
            required: false,
            min: 1,
            default: 10,
            example: 1,
          },
          page: {
            description: "ページ番号",
            type: "integer",
            required: false,
            min: 1,
            default: 1,
            example: 1,
          },
        },
      },
      responses: {
        200: {
          description: "一覧取得成功",
          content: {
            json: {
              type: "object",
              props: {
                page: {
                  type: "integer",
                  required: true,
                  min: 1,
                  default: 1,
                  example: 1,
                },
                total: {
                  type: "integer",
                  required: true,
                  min: 0,
                  example: 100,
                },
                items: {
                  type: "array",
                  items: sandboxItem,
                  required: true,
                },
              },
            },
          },
        },
      },
    },
    post: {
      summary: "詳細作成",
      parameters: {
        body: {
          json: newSandboxItem,
        },
      },
      responses: {
        201: {
          description: "作成成功",
          content: {
            json: sandboxItem,
          },
        },
      },
    },
  },
  {
    path: "/sandbox/api/{id}",
    parameters: {
      path: {
        id: {
          type: "string",
          required: true,
        },
      },
    },
    get: {
      summary: "詳細取得",
      responses: {
        200: {
          description: "詳細取得成功",
          content: {
            json: sandboxItem,
          },
        },
        404: {
          description: "詳細取得失敗",
        },
      },
    },
    put: {
      summary: "詳細更新",
      parameters: {
        body: {
          json: newSandboxItem,
        },
      },
      responses: {
        201: {
          description: "詳細更新成功",
          content: {
            json: sandboxItem,
          },
        },
      },
    },
    delete: {
      summary: "詳細削除",
      responses: {
        204: {
          description: "削除成功",
        },
      },
    },
  },
] satisfies ApiDoc.Path[];

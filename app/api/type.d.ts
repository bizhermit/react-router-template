type _ApiPaths = import("./types+").paths;

type MethodPaths<P extends Record<string, unknown>, M extends string> = {
  [K in keyof P]: M extends keyof P[K] ? (
    P[K][M] extends { [v: unknown]: unknown; } ? K : never
  ) : never;
}[keyof P];

type GetApiPath = MethodPaths<_ApiPaths, "get">;
type PostApiPath = MethodPaths<_ApiPaths, "post">;
type PutApiPath = MethodPaths<_ApiPaths, "put">;
type DeleteApiPath = MethodPaths<_ApiPaths, "delete">;

type ApiPath = keyof _ApiPaths;

type ApiParams<P extends ApiPath, M extends string> = _ApiPaths[P][M]["parameters"];
type ApiResponse<P extends ApiPath, M extends string> =
  _ApiPaths[P][M]["responses"][`2${number}`]["content"]["application/json"];
type ApiFailedResponse<P extends ApiPath, M extends string> =
  _ApiPaths[P][M]["responses"][`4${number}` | `5${number}`]["content"][["application/json"]];

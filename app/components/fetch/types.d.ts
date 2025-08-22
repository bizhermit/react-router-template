namespace Api {

  type Method =
    | "get"
    | "put"
    | "post"
    | "delete"
    ;

  type MethodPaths<P extends Record<string, unknown>, M extends Method> = {
    [K in keyof P]: M extends keyof P[K] ? (
      P[K][M] extends { [v: unknown]: unknown; } ? K : never
    ) : never;
  }[keyof P];

  type GetPath<OpenApi> = MethodPaths<OpenApi, "get">;
  type PostPath<OpenApi> = MethodPaths<OpenApi, "post">;
  type PutPath<OpenApi> = MethodPaths<OpenApi, "put">;
  type DeletePath<OpenApi> = MethodPaths<OpenApi, "delete">;
  type Path<OpenApi> = keyof OpenApi;

  type PathParams<OpenApi, P extends keyof OpenApi, M extends Method> = OpenApi[P][M]["parameters"]["path"];

  type HeaderParams<OpenApi, P extends keyof OpenApi, M extends Method> = OpenApi[P][M]["parameters"]["header"];

  type QueryParams<OpenApi, P extends keyof OpenApi, M extends Method> = OpenApi[P][M]["parameters"]["query"];

  type BodyParams<OpenApi, P extends Path, M extends Method> =
    OpenApi[P][M]["requestBody"] extends never ? undefined :
    OpenApi[P][M]["requestBody"] extends { content: infer C; } ? C[keyof C] : undefined;

  ;
  type NullSafeParams<K extends string, T> =
    T extends Record<string, unknown> ? { [U in K]: T } : { [U in K]?: Record<string, unknown> };

  type Params<OpenApi, P extends keyof OpenApi, M extends Method> =
    & NullSafeParams<"path", PathParams<OpenApi, P, M>>
    & NullSafeParams<"header", HeaderParams<OpenApi, P, M>>
    & NullSafeParams<"query", QueryParams<OpenApi, P, M>>
    & (M extends "get" ? { body?: never; } : NullSafeParams<"body", BodyParams<OpenApi, P, M>>)
    ;

  type FilterByPrefix<T, Prefix extends string> =
    T extends number ? (
      `${T}` extends `${Prefix}${string}` ? T : never
    ) : never;

  type ResponseEntry<K extends keyof unknown, R> = R extends { content: infer C; headers?: infer H; } ? (
    C extends Record<string, infer Body> ? {
      status: K;
      data: Body;
      statusText: string;
      headers: H extends Record<string, unknown> ? H : Record<string, unknown>;
    } : {
      status: K;
      statusText: string;
      headers: H extends Record<string, unknown> ? H : Record<string, unknown>;
    }
  ) : {
    status: K;
    statusText: string;
    headers: Record<string, unknown>;
  };

  type ResponseUnion<T> = {
    [K in keyof T]: ResponseEntry<K, T[K]>;
  }[keyof T];

  type SuccessStatusCodes<T> = FilterByPrefix<keyof T, "2">;
  type ErrorStatusCodes<T> = Exclude<keyof T, SuccessStatusCodes<T>>;

  type SuccessResponses<T> = {
    [K in keyof T]: K extends FilterByPrefix<K, "2"> ? ResponseEntry<K, T[K]> : never;
  }[keyof T];

  type ErrorResponses<T> = {
    [K in keyof T]: K extends Exclude<keyof T, FilterByPrefix<keyof T, "2">> ? ResponseEntry<K, T[K]> : never;
  }[keyof T];

  type SuccessResponse<OpenApi, P extends Path, M extends Method> = {
    ok: true;
    _: Response;
  } & SuccessResponses<OpenApi[P][M]["responses"]>;

  type ErrorResponse<OpenApi, P extends Path, M extends Method> = {
    ok: false;
    _: Response;
  } & ErrorResponses<OpenApi[P][M]["responses"]>;

};

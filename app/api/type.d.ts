namespace Api {

  type _ = import("./types+").paths;

  type MethodPaths<P extends Record<string, unknown>, M extends string> = {
    [K in keyof P]: M extends keyof P[K] ? (
      P[K][M] extends { [v: unknown]: unknown; } ? K : never
    ) : never;
  }[keyof P];

  type MergeParams<T extends readonly unknown[]> = (
    T extends [infer Head, ...infer Tail] ?
    MergeParams<Tail> & (Head extends { [v: unknown]: unknown; } ? Head : {}) : {}
  );

  type GetPath = MethodPaths<_, "get">;
  type PostPath = MethodPaths<_, "post">;
  type PutPath = MethodPaths<_, "put">;
  type DeletePath = MethodPaths<_, "delete">;
  type Path = keyof _;

  type PathParams<P extends string, M extends string> = _[P][M]["parameters"]["path"];

  type QueryParams<P extends string, M extends string> = _[P][M]["parameters"]["query"];

  type BodyParams<P extends Path, M extends string> =
    _[P][M]["requestBody"] extends { content: infer C; } ? C[keyof C] : never;

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

  type SuccessResponse<P extends Path, M extends string> = {
    ok: true;
  } & SuccessResponses<_[P][M]["responses"]>;

  type ErrorResponse<P extends Path, M extends string> = {
    ok: false;
  } & ErrorResponses<_[P][M]["responses"]>;

};

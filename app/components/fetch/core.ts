import { getObjectType } from "~/components/objects";
import { formatDate } from "~/components/objects/date";
import { convertBlobToFile, convertFileToBase64 } from "~/components/objects/file";
import { trimStruct } from "../schema/struct";

function replacePathParams(
  path: string,
  params: Record<string, unknown> | null | undefined,
) {
  const errs: string[] = [];
  const ret = path.replace(/\{(.*?)\}/g, (text, key) => {
    const v = params?.[key];
    if (v == null) {
      errs.push(key);
      return "";
    }
    return encodeURIComponent(String(v));
  });
  if (errs.length > 0) {
    throw new Error(`Missing path parameter${errs.length > 1 ? "s" : ""}: ${errs.map(e => `'${e}'`).join(", ")}`);
  };
  return ret;
};

function createUrl(
  path: string,
  params: Record<string, Record<string, unknown>> | null | undefined,
) {
  const replacedPath = replacePathParams(path, params?.path);
  const query = parseQueryString(params?.query);
  return `${replacedPath}${query ? `?${query}` : ""}`;
}

function parseQueryString(params: Record<string, unknown> | null | undefined) {
  if (params == null) return null;
  const d: Record<string, string> = {};
  function querySafe(name: string, value: unknown) {
    if (value == null) return;
    function setOrPush(v: unknown) {
      if (v == null) return;
      d[name] = String(v);
    };

    if (typeof value !== "object") {
      setOrPush(value);
      return;
    };
    switch (getObjectType(value)) {
      case "Array":
        (value as Array<unknown>).forEach((item, index) => {
          querySafe(`${name}[${index}]`, item);
        });
        break;
      case "Object":
        for (const key in (value as Record<string, unknown>)) {
          querySafe(`${name}.${key}`, (value as Record<string, unknown>)[key]);
        }
        break;
      case "Date":
        setOrPush(formatDate((value as Date)));
        break;
      case "Map":
        querySafe(name, [...value as unknown as Map<unknown, unknown>].reduce((pv, cv) => {
          pv[cv[0] as string | number] = cv[1];
          return pv;
        }, {} as Record<string, unknown>));
        break;
      case "Set":
        querySafe(name, [...value as unknown as Set<unknown>]);
        break;
      default:
        break;
    }
  }
  for (const key in params) {
    querySafe(key, params[key]);
  }
  return new URLSearchParams(d).toString();
};

async function requestBodyStringfy(params: Record<string, unknown> | null | undefined) {
  if (params == null) return undefined;
  async function bodySafe(v: unknown): Promise<unknown> {
    if (v == null || typeof v !== "object") return v;
    switch (getObjectType(v)) {
      case "File":
        return (await convertFileToBase64(v as File)) || undefined;
      case "Blob":
        return (await convertFileToBase64(convertBlobToFile(v as Blob, ""))) || undefined;
      case "Array": {
        const r: Array<unknown> = [];
        for (let i = 0, il = (v as Array<unknown>).length; i < il; i++) {
          r[i] = await bodySafe((v as Array<unknown>)[i]);
        }
        return r;
      }
      case "Object": {
        const r: Record<string | number | symbol, unknown> = {};
        for (const key in v as Record<string, unknown>) {
          r[key] = await bodySafe((v as Record<string, unknown>)[key]);
        }
        return r;
      }
      case "Map": {
        return bodySafe([...v as unknown as Map<unknown, unknown>]);
      }
      case "Set":
        return bodySafe([...v as unknown as Set<unknown>]);
      default:
        return v;
    }
  };
  return JSON.stringify(await bodySafe(params));
}

export function generateApiAccessor<ApiPaths>(options?: {
  baseUrl?: string;
  headers?: Record<string, string>;
  interceptors?: {
    fetchAfter?: (params: {
      ok: boolean;
      status: number;
      statusText: string;
      url: string;
      response: Response;
      data: Record<string, unknown> | undefined;
    }) => void;
  };
}) {
  const baseUrl = (options?.baseUrl || "").replace(/\/+$/, "").replace(/\\/g, "/");

  async function responseParser<P extends Api.Path<ApiPaths>, M extends Api.Method>(res: Response) {
    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      data: await (async () => {
        if (res.status === 204) return undefined;
        const text = await res.text();
        if (text == null) return undefined;
        try {
          return JSON.parse(text);
        } catch {
          return undefined;
        }
      })(),
      _: res,
    } as unknown as (Api.SuccessResponse<ApiPaths, P, M> | Api.ErrorResponse<ApiPaths, P, M>);
  };

  async function post<P extends Api.Path<ApiPaths>, M extends Exclude<Api.Method, "get">>(
    path: P,
    method: M,
    params?: Api.Params<ApiPaths, P, M> | undefined
  ) {
    const url = createUrl(path as string, params as Record<string, Record<string, unknown>>);
    const res = await fetch(`${baseUrl}${url}`, {
      method: method.toUpperCase(),
      body: await requestBodyStringfy(params?.body),
      headers: trimStruct<Record<string, string>>({
        "Content-Type": "application/json",
        ...options?.headers,
        ...params?.header,
      }),
    });
    const parsed = await responseParser<P, M>(res);
    options?.interceptors?.fetchAfter?.({
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      url: url,
      response: res,
      data: (parsed as unknown as { data: Record<string, unknown>; }).data,
    });
    return parsed;
  };

  return {
    get: async function <P extends Api.GetPath<ApiPaths>>(
      path: P,
      params?: Api.Params<ApiPaths, P, "get">,
    ) {
      const url = createUrl(path as string, params as Record<string, Record<string, unknown>>);
      const res = await fetch(`${baseUrl}${url}`, {
        method: "GET",
        headers: trimStruct<Record<string, string>>({
          ...options?.headers,
          ...params?.header,
        }),
      });
      const parsed = await responseParser<P, "get">(res);
      options?.interceptors?.fetchAfter?.({
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        url: url,
        response: res,
        data: (parsed as unknown as { data: Record<string, unknown>; }).data,
      });
      return parsed;
    },
    post: async function <P extends Api.PostPath<ApiPaths>>(
      path: P,
      params?: Api.Params<ApiPaths, P, "post">,
    ) {
      return post(path, "post", params);
    },
    put: async function <P extends Api.PutPath<ApiPaths>>(
      path: P,
      params?: Api.Params<ApiPaths, P, "put">,
    ) {
      return post(path, "put", params);
    },
    patch: async function <P extends Api.PatchPath<ApiPaths>>(
      path: P,
      params?: Api.Params<ApiPaths, P, "patch">,
    ) {
      return post(path, "patch", params);
    },
    delete: async function <P extends Api.DeletePath<ApiPaths>>(
      path: P,
      params?: Api.Params<ApiPaths, P, "delete">,
    ) {
      return post(path, "delete", params);
    },
  } as const;
};

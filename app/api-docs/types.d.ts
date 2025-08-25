namespace ApiDoc {

  type Url = `${"http" | "https"}://${string}`;
  type AnyObject = Record<string, unknown>;

  type Root = {
    openapi: `${number}.${number}.${number}`;
    info: {
      title: string;
      summary?: string;
      description?: string;
      termsOfService?: Url;
      contact?: string | {
        name?: string;
        url: Url;
        email?: string;
      };
      license?: string | {
        name?: string;
        identifier?: "url";
        url: Url;
      } | {
        name?: string;
        identifier: "identifer";
        url: string;
      };
      version: `${number}.${number}.${number}`;
    };
    servers: {
      url: Url;
      description?: string;
      variabled?: AnyObject;
    };
    security?: Security[];
    paths: Array<Path>;
  };

  interface Value_Base {
    description?: string;
    required?: boolean;
    allowEmptyValue?: string;
    deprecated?: boolean;
  };

  interface Value_String extends Value_Base {
    type: "string";
    default?: string;
    length?: number;
    minLength?: number;
    maxLength?: number;
    enum?: Array<string>;
    example?: string;
  };

  interface Value_Numeric extends Value_Base {
    type: "integer" | "number";
    default?: number;
    min?: number;
    max?: number;
    enum?: Array<number>;
    example?: number;
  };

  interface Value_Boolean extends Value_Base {
    type: "boolean";
    default?: boolean;
    example?: boolean;
  };

  interface Value_Date extends Value_Base {
    type: "date";
    default?: string;
    min?: string;
    max?: string;
    example?: string;
  };

  interface Value_DateTime extends Value_Base {
    type: "datetime";
    default?: string;
    min?: string;
    max?: string;
    example?: string;
  };

  interface Value_Array<T extends Value = Value> extends Value_Base {
    type: "array";
    default?: Array<ValueToTSObject<T>>;
    items: T;
    example?: Array<ValueToTSObject<T>>;
  };

  interface Value_Object<T extends Record<string, Value> = Record<string, Value>> extends Value_Base {
    type: "object";
    default?: { [K in keyof T]: ValueToTSObject<T[K]> };
    props: T;
    example?: { [K in keyof T]: ValueToTSObject<T[K]> };
  };

  type Value =
    | Value_String
    | Value_Numeric
    | Value_Boolean
    | Value_Date
    | Value_DateTime
    | Value_Array
    | Value_Object
    ;

  type ValueToTSObject<T extends Value> = T extends { type: infer Type; } ? (
    Type extends "string" ? string :
    Type extends "integer" ? number :
    Type extends "decimal" ? number :
    Type extends "bool" ? boolean :
    Type extends "array" ? Array<ValueToTSObject<T["items"]>> :
    Type extends "object" ? { [K in keyof T["props"]]: ValueToTSObject<T["props"][K]> } :
    never
  ) : never;

  type Schema = { [name: string]: Value; };

  type Security = {
    global?: boolean;
  } & (
      | {
        type: "Basic";
      }
      | {
        type: "Bearer";
      }
      | {
        type: "ApiKey";
        name?: string;
      }
      | {
        type: "OpenId";
        openIdConnectUrl: Url;
      }
      | {
        type: "OAuth2";
        flows: {
          authorizationUrl: Url;
          tokenUrl: Url;
          scopes: Record<string, string>;
        };
      }
    )
    ;

  type Parameters = {
    path?: Schema;
    headers?: Schema;
    query?: Schema;
    cookie?: Schema;
  };

  type Response = {
    description?: string;
    headers?: Schema;
    cookie?: Schema;
    content?: {
      text?: Value_String;
      json?: Value;
    };
  };

  type Operation = {
    summary?: string;
    description?: string;
  };

  type LoaderOperation = Operation & {
    parameters?: Parameters & {
      body?: null;
    };
    responses: { [status: `${number}`]: Response; };
  };

  type ActionOperation = Operation & {
    parameters?: Parameters & {
      body?: {
        json: Value;
        form?: never;
      } | {
        json?: never;
        form?: Schema;
      };
    };
    responses: { [status: `${number}`]: Response; };
  };

  type Method =
    | "get"
    | "head"
    | "post"
    | "put"
    | "delete"
    | "options"
    | "trace"
    | "patch"
    ;

  type Path = {
    path: `/${string}`;
    summary?: string;
    description?: string;
    parameters?: Parameters;
  } & {
    get?: LoaderOperation;
    head?: LoaderOperation;
    post?: ActionOperation;
    put?: ActionOperation;
    delete?: ActionOperation;
    options?: LoaderOperation;
    trace?: ActionOperation;
    patch?: ActionOperation;
  };

}

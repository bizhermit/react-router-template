export default function (openapi: ApiDoc.Root) {
  const components: Record<string, unknown> = {};
  const ret: Record<string, unknown> = {
    openapi: openapi.openapi,
    info: openapi.info,
    servers: [openapi.servers],
    paths: openapi.paths.reduce((paths, path) => {
      paths[path.path] = parsePath(path);
      return paths;
    }, {} as Record<string, unknown>),
  };

  if (openapi.security && openapi.security.length > 0) {
    const securities: unknown[] = [];
    const securitySchemas: Record<string, unknown> = {};
    openapi.security.forEach(security => {
      switch (security.type) {
        case "Basic":
          securitySchemas.BasicAuth = {
            type: "http",
            schema: "basic",
          };
          if (security.global) {
            securities.push({
              BasicAuth: [],
            });
          }
          break;
        case "Bearer":
          securitySchemas.BearerAuth = {
            type: "http",
            schema: "bearer",
          };
          if (security.global) {
            securities.push({
              BearerAuth: [],
            });
          }
          break;
        case "ApiKey":
          securitySchemas.ApiKeyAuth = {
            type: "apiKey",
            in: "header",
            name: security.name || "Api-Key",
          };
          if (security.global) {
            securities.push({
              ApiKeyAuth: [],
            });
          }
          break;
        case "OpenId":
          securitySchemas.OpenId = {
            type: "openIdConnect",
            openIdConnectUrl: security.openIdConnectUrl,
          };
          if (security.global) {
            securities.push({
              OpenId: [],
            });
          }
          break;
        case "OAuth2":
          securitySchemas.OAuth2 = {
            type: "oauth2",
            flows: {
              authorizationCode: {
                authorizationUrl: security.flows.authorizationUrl,
                tokenUrl: security.flows.tokenUrl,
                scopes: Object.entries(security.flows.scopes).reduce((scopes, [key, value]) => {
                  scopes[key] = value;
                  return scopes;
                }, {} as Record<string, string>),
              },
            },
          };
          if (security.global) {
            securities.push({
              OAuth2: Object.keys(security.flows.scopes),
            });
          }
          break;
        default:
          break;
      }
    });
    if (securities.length > 0) {
      ret.security = securities;
    }
    if (Object.keys(securitySchemas).length > 0) {
      components.securitySchemes = securitySchemas;
    }
  }
  if (Object.keys(components).length > 0) {
    ret.components = components;
  }
  return ret;
}

function parsePath(path: ApiDoc.Path) {
  const ret: Record<string, unknown> = {
    summary: path.summary || "",
  };
  if (path.parameters) {
    const openApiParrameters = parseParameters(path.parameters);
    if (openApiParrameters.length > 0) {
      ret.parameters = openApiParrameters;
    }
  }
  function setIfExists(method: ApiDoc.Method) {
    const operation = parseOperation(path, method);
    if (operation) ret[method] = operation;
  };
  ([
    "get",
    "head",
    "post",
    "put",
    "delete",
    "options",
    "trace",
    "patch",
  ] as ApiDoc.Method[]).forEach(setIfExists);
  return ret;
}

function parseParameters(parameters: ApiDoc.Parameters) {
  const openApiParrameters: Array<unknown> = [];
  if (parameters.path) {
    Object.entries(parameters.path).forEach(([name, value]) => {
      openApiParrameters.push({
        name,
        in: "path",
        required: true,
        schema: parseSchemaValue(value),
      });
    });
  }
  if (parameters.headers) {
    Object.entries(parameters.headers).forEach(([name, value]) => {
      openApiParrameters.push({
        name,
        in: "header",
        required: value.required ?? false,
        schema: parseSchemaValue(value),
      });
    });
  }
  if (parameters.cookie) {
    Object.entries(parameters.cookie).forEach(([name, value]) => {
      openApiParrameters.push({
        name,
        in: "cookie",
        required: value.required ?? false,
        schema: parseSchemaValue(value),
      });
    });
  }
  if (parameters.query) {
    Object.entries(parameters.query).forEach(([name, value]) => {
      openApiParrameters.push({
        name,
        in: "query",
        required: value.required ?? false,
        schema: parseSchemaValue(value),
      });
    });
  }
  return openApiParrameters;
}

function parseOperation(path: ApiDoc.Path, method: ApiDoc.Method) {
  const operation = path[method];
  if (!operation) return null;
  const ret: Record<string, unknown> = {
    summary: operation.summary || "",
  };
  const parameters = operation.parameters;
  if (parameters) {
    const openApiParrameters = parseParameters(parameters);
    if (openApiParrameters.length > 0) {
      ret.parameters = openApiParrameters;
    }

    if (parameters.body) {
      if (parameters.body.json) {
        ret.requestBody = {
          required: true,
          content: {
            "application/json": {
              schema: parseSchemaValue(parameters.body.json),
            },
          },
        };
      } else if (parameters.body.form) {
        ret.requestBody = {
          required: true,
          content: {},
        };
      }
    }
  }
  const responses = operation.responses;
  const openApiResponses: Record<string, unknown> = {};
  if (responses) {
    Object.entries(responses).forEach(([status, response]) => {
      const openApiResponse: Record<string, unknown> = {
        description: response.description || "",
      };
      const content: Record<string, unknown> = {};
      if (response.content) {
        if (response.content.json) {
          content["application/json"] = {
            schema: parseSchemaValue(response.content.json),
          };
        } else if (response.content.text) {
          content["palin/text"] = {
            schema: parseSchemaValue(response.content.text),
          };
        }
      }
      if (Object.keys(content).length > 0) {
        openApiResponse.content = content;
      }
      openApiResponses[status] = openApiResponse;
    });
  }
  if (Object.keys(openApiResponses).length > 0) {
    ret.responses = openApiResponses;
  }
  return ret;
}

function parseSchemaValue(value: ApiDoc.Value) {
  const ret: Record<string, unknown> = {
    type: value.type,
    default: value.default,
    example: value.example,
  };
  switch (value.type) {
    case "string":
      break;
    case "number":
    case "integer":
      break;
    case "boolean":
      break;
    case "date":
    case "datetime":
      ret.type = "string";
      break;
    case "array":
      ret.items = parseSchemaValue(value.items);
      break;
    case "object": {
      const required: Array<string> = [];
      ret.properties = Object.entries(value.props).reduce((props, [name, value]) => {
        props[name] = parseSchemaValue(value);
        if (value.required) required.push(name);
        return props;
      }, {} as Record<string, unknown>);
      if (required.length) {
        ret.required = required;
      }
      break;
    }
    default:
      break;
  }
  return ret;
}

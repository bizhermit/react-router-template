export default function (openapi: ApiDoc.Root) {
  const ret = {
    openapi: openapi.openapi,
    info: openapi.info,
    servers: [openapi.servers],
    paths: openapi.paths.reduce((paths, path) => {
      paths[path.path] = parsePath(path);
      return paths;
    }, {} as Record<string, unknown>),
  };
  return ret;
}

function parsePath(path: ApiDoc.Path) {
  const ret: Record<string, unknown> = {
    summary: path.summary || "",
  };

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

function parseOperation(path: ApiDoc.Path, method: ApiDoc.Method) {
  const operation = path[method];
  if (!operation) return null;
  const ret: Record<string, unknown> = {
    summary: operation.summary || "",
  };
  const parameters = operation.parameters;
  if (parameters) {
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

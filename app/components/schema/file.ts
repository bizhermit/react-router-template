import { convertBase64ToFile, convertBlobToFile, getFileSize10Text } from "../objects/file";
import { getRequiredTextKey, getValidationArray } from "./utilities";

function isFile(value: any): value is File {
  return value != null && value instanceof File;
};

function FILE_PARSER({ value, env, label }: Schema.ParserParams): Schema.ParserResult<File | string> {
  if (value == null) return { value };
  if (value instanceof File) {
    if (value.size === 0) return { value: undefined };
    return { value };
  }
  if (value instanceof Blob) {
    try {
      return { value: convertBlobToFile(value, "") };
    } catch {
      return {
        value: undefined,
        result: {
          type: "e",
          code: "parse",
          message: env.t("invalidFile", {
            label: label || env.t("default_label"),
          }),
        },
      };
    }
  }
  if (typeof value === "string") {
    if (value === "") {
      return { value: undefined };
    }
    if (value.match(/^(https?|file):\/\//)) return { value };
    try {
      return { value: convertBase64ToFile(value, "") };
    } catch {
      return {
        value: undefined,
        result: {
          type: "e",
          code: "parse",
          message: env.t("invalidFile", {
            label: label || env.t("default_label"),
          }),
        },
      };
    }
  }
  return {
    value: undefined,
    result: {
      type: "e",
      code: "parse",
      message: env.t("invalidFile", {
        label: label || env.t("default_label"),
      }),
    },
  };
}

export function getAccept(accept: string) {
  const items: Array<{ accept: string; type: "ext" | "group" | "type"; subject: string; }> = [];
  if (accept) {
    accept.split(",").forEach(a => {
      const accept = a.trim();
      if (accept.startsWith(".")) {
        items.push({
          accept,
          type: "ext",
          subject: (() => {
            if (/^\.png$/i.test(accept)) return "PNG";
            if (/^\.jpe?g$/i.test(accept)) return "JPEG";
            if (/^\.pdf$/i.test(accept)) return "PDF";
            if (/^\.gif$/i.test(accept)) return "GIF";
            if (/^\.docx?$/i.test(accept)) return "ドキュメント";
            if (/^\.xlsx?$/i.test(accept)) return "Excel";
            return accept;
          })(),
        });
        return;
      }
      if (/[a-zA-Z]\/\*/.test(accept)) {
        items.push({
          accept,
          type: "group",
          subject: (() => {
            if (/^image/.test(accept)) return "画像";
            if (/^video/.test(accept)) return "動画";
            if (/^audio/.test(accept)) return "音声";
            return accept;
          })(),
        });
        return;
      }
      items.push({ accept, type: "type", subject: accept });
    });
  }
  return { accept, items } as const;
};

function getAcceptChecker(accept: string) {
  const acceptParams = getAccept(accept);
  function validAccept(file: File) {
    return acceptParams.items.some(({ accept, type }) => {
      switch (type) {
        case "ext":
          return new RegExp(`${accept}$`, "i").test(file.name);
        case "type":
          return type.toLowerCase() === file.type.toLowerCase();
        default:
          return new RegExp(accept, "i").test(file.type);
      }
    });
  };
  return {
    ...acceptParams,
    check: validAccept,
  } as const;
};

export function $file<Props extends Schema.FileProps>(props?: Props) {
  const validators: Array<Schema.Validator<File | string>> = [];

  const actionType = props?.actionType ?? "select";
  const [required, getRequiredMessage] = getValidationArray(props?.required);
  const [accept, getAcceptMessage] = getValidationArray(props?.accept);
  const [maxSize, getMaxSizeMessage] = getValidationArray(props?.maxSize);

  if (required) {
    const textKey = getRequiredTextKey(actionType);
    const getMessage: Schema.MessageGetter<typeof getRequiredMessage> = getRequiredMessage ?
      getRequiredMessage :
      (p) => p.env.t(textKey, {
        label: p.label || p.env.t("default_label"),
      });

    if (typeof required === "function") {
      validators.push((p) => {
        if (!required(p)) return null;
        if (p.value == null || p.value === "") {
          return {
            type: "e",
            code: "required",
            message: getMessage(p),
          };
        }
        return null;
      });
    } else {
      validators.push((p) => {
        if (p.value == null || p.value === "") {
          return {
            type: "e",
            code: "required",
            message: getMessage(p),
          };
        }
        return null;
      });
    }
  };

  if (accept) {
    const getMessage: Schema.MessageGetter<typeof getAcceptMessage> = getAcceptMessage ?
      getAcceptMessage :
      (p) => p.env.t("fileAccept", {
        label: p.label || p.env.t("default_label"),
      });

    if (typeof accept === "function") {
      validators.push((p) => {
        if (p.value == null || p.value === "") return null;
        if (!isFile(p.value)) return null;
        const ctx = getAcceptChecker(accept(p));
        if (ctx.check(p.value)) return null;
        return {
          type: "e",
          code: "accept",
          message: getMessage({ ...p, accept: ctx.accept }),
        };
      });
    } else {
      const ctx = getAcceptChecker(accept);
      validators.push((p) => {
        if (p.value == null || p.value === "") return null;
        if (!isFile(p.value)) return null;
        if (ctx.check(p.value)) return null;
        return {
          type: "e",
          code: "accept",
          message: getMessage({ ...p, accept: ctx.accept }),
        };
      });
    }
  }

  if (maxSize != null) {
    const getMessage: Schema.MessageGetter<typeof getMaxSizeMessage> = getMaxSizeMessage ?
      getMaxSizeMessage :
      (p) => p.env.t("maxFileSize", {
        label: p.label || p.env.t("default_label"),
        maxSize: p.maxSizeText,
      });

    if (typeof maxSize === "function") {
      validators.push((p) => {
        if (p.value == null || p.value === "") return null;
        if (!isFile(p.value)) return null;
        const m = maxSize(p);
        if (p.value.size <= m) return null;
        return {
          type: "e",
          code: "maxSize",
          message: getMessage({ ...p, maxSize: m, maxSizeText: getFileSize10Text(m) }),
        };
      });
    } else {
      const maxSizeText = getFileSize10Text(maxSize);
      validators.push((p) => {
        if (p.value == null || p.value === "") return null;
        if (!isFile(p.value)) return null;
        if (p.value.size <= maxSize) return null;
        return {
          type: "e",
          code: "maxSize",
          message: getMessage({ ...p, maxSize, maxSizeText }),
        };
      });
    }
  }

  if (props?.validators) {
    validators.push(...props.validators);
  }

  return {
    type: "file",
    actionType,
    label: props?.label,
    mode: props?.mode,
    refs: props?.refs,
    parser: props?.parser ?? FILE_PARSER,
    validators,
    required: required as Schema.GetValidationValue<Props, "required">,
    accept,
    maxSize,
  } as const satisfies Schema.$File;
};

import { getValidationArray } from "./utilities";


function isFile(value: any): value is File {
  return value != null && value instanceof File;
};

export function getAccept(accept: string) {
  const items: Array<{ accept: string; type: "ext" | "group" | "type"; subject: string }> = [];
  if (accept) {
    accept.split(",").forEach(a => {
      const accept = a.trim();
      if (accept.startsWith(".")) {
        items.push({
          accept, type: "ext", subject: (() => {
            if (/^\.png$/i.test(accept)) return "PNG";
            if (/^\.jpe?g$/i.test(accept)) return "JPEG";
            if (/^\.pdf$/i.test(accept)) return "PDF";
            if (/^\.gif$/i.test(accept)) return "GIF";
            if (/^\.docx?$/i.test(accept)) return "ドキュメント";
            if (/^\.xlsx?$/i.test(accept)) return "Excel";
            return accept;
          })()
        });
        return;
      }
      if (/[a-zA-Z]\/\*/.test(accept)) {
        items.push({
          accept, type: "group", subject: (() => {
            if (/^image/.test(accept)) return "画像";
            if (/^video/.test(accept)) return "動画";
            if (/^audio/.test(accept)) return "音声";
            return accept;
          })()
        });
        return;
      }
      items.push({ accept, type: "type", subject: accept });
    });
  }
  return { accept, items } as const;
};

export function getFileSize2Text(size: number) {
  if (size < 1024) return `${size}byte`;
  if (size < 1048576) return `${Math.floor(size / 1024 * 10) / 10}KiB`;
  if (size < 1073741824) return `${Math.floor(size / 1048576 * 10) / 10}MiB`;
  return `${Math.floor(size / 1073741824 * 10) / 10}GiB`;
};

export function getFileSize10Text(size: number) {
  if (size < 1000) return `${size}B`;
  if (size < 1000000) return `${Math.floor(size / 1000 * 10) / 10}KB`;
  if (size < 1000000000) return `${Math.floor(size / 1000000 * 10) / 10}MB`;
  return `${Math.floor(size / 1000000000 * 10) / 10}GB`;
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

  const [required, getRequiredMessage] = getValidationArray(props?.required);
  const [accept, getAcceptMessage] = getValidationArray(props?.accept);
  const [maxSize, getMaxSizeMessage] = getValidationArray(props?.maxSize);

  if (required) {
    const getMessage: Schema.MessageGetter<typeof getRequiredMessage> = getRequiredMessage ?
      getRequiredMessage :
      (p) => p.env.t("入力してください。");

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
      (p) => p.env.t("ファイルの拡張子が不正です。");

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
          message: getMessage({ ...p, accept: ctx.accept })
        };
      });
    }
  }

  if (maxSize != null) {
    const getMessage: Schema.MessageGetter<typeof getMaxSizeMessage> = getMaxSizeMessage ?
      getMaxSizeMessage :
      (p) => p.env.t(`ファイルは${p.maxSizeText}以下を選択してください。`);

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
    validators,
    required: required as Schema.GetValidationValue<Props, "required">,
    accept,
    maxSize,
  } as const satisfies Schema.$File;
};

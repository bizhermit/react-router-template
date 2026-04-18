import { convertBase64ToFile, convertBlobToFile } from "$/shared/objects/file";
import { getSchemaItemPropsGenerator, getValidationArray } from ".";

export const SCHEMA_ITEM_TYPE_FILE = "file";

type FileValue = File | string;

type FileValidation_Accept = { accept: string; currentFileType: string; currentFileName: string; };
type FileValidation_MaxSize = { maxSize: number; currentSize: number; };

type FileValidationAbstractMessage = $Schema.AbstractMessage & {
  otype: typeof SCHEMA_ITEM_TYPE_FILE;
};
export type FileValidationMessage = FileValidationAbstractMessage & (
  | { code: "parse"; }
  | { code: "required"; }
  | ({ code: "accept"; } & FileValidation_Accept)
  | ({ code: "maxSize"; } & FileValidation_MaxSize)
);

type FileOptions = {
  parser?: $Schema.Parser<FileValue>;
  required?: $Schema.Validation<$Schema.Nullable<FileValue>, boolean, undefined, FileValidationMessage>;
  accept?: $Schema.Validation<FileValue, string, FileValidation_Accept, FileValidationMessage>;
  maxSize?: $Schema.Validation<FileValue, number, FileValidation_MaxSize, FileValidationMessage>;
  rules?: $Schema.Rule<FileValue>[];
};

type FileProps = $Schema.SchemaItemAbstractProps & FileOptions;

function isEmpty(value: unknown) {
  return value == null || value === "";
};

function isFile(value: unknown): value is File {
  return value != null && value instanceof File;
};

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

export function $file<const P extends FileProps>(props: P = {} as P) {
  const fixedProps = {
    type: SCHEMA_ITEM_TYPE_FILE,
    _validators: null,
    getActionType: function () {
      return this.actionType || "select";
    },
    getCommonTypeMessageParams: function () {
      return {
        otype: SCHEMA_ITEM_TYPE_FILE,
        label: this.label,
        actionType: this.getActionType(),
        type: "e",
      };
    },
    parse: function (params) {
      if (this.parser) return this.parser(params);
      if (params.value == null) return { value: params.value };

      if (params.value instanceof File) {
        if (params.value.size === 0) return { value: undefined };
        return { value: params.value };
      }

      if (params.value instanceof Blob) {
        try {
          if (params.value.size === 0) return { value: undefined };
          return { value: convertBlobToFile(params.value, "") };
        } catch {
          return {
            value: undefined,
            message: {
              ...this.getCommonTypeMessageParams(),
              code: "parse",
            },
          };
        }
      }

      if (typeof params.value === "string") {
        if (params.value === "") {
          return { value: undefined };
        }
        if (params.value.match(/^(https?|file):\/\//)) {
          return { value: params.value };
        }
        try {
          return { value: convertBase64ToFile(params.value, "") };
        } catch {
          return {
            value: undefined,
            message: {
              ...this.getCommonTypeMessageParams(),
              code: "parse",
            },
          };
        }
      }

      return {
        value: undefined,
        message: {
          ...this.getCommonTypeMessageParams(),
          code: "parse",
        },
      };
    },
    validate: function (params) {
      if (this._validators == null) {
        this._validators = [];
        const commonMsgParams = this.getCommonTypeMessageParams();

        // required
        if (this.required) {
          const [required, getRequiredMessage] = getValidationArray(this.required);
          if (required) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getRequiredMessage> =
              getRequiredMessage ??
              (() => ({
                ...commonMsgParams,
                code: "required",
              }));

            if (typeof required === "function") {
              this._validators.push((p) => {
                if (!required(p)) return null;
                if (isEmpty(p.value)) {
                  return getMessage(p);
                }
                return null;
              });
            } else {
              this._validators.push((p) => {
                if (isEmpty(p.value)) {
                  return getMessage(p);
                }
                return null;
              });
            }
          }
        }

        // accept
        if (this.accept) {
          const [accept, getAcceptMessage] = getValidationArray(this.accept);
          if (accept) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getAcceptMessage> =
              getAcceptMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "accept",
                accept: p.validationValues.accept,
                currentFileType: p.validationValues.currentFileType,
                currentFileName: p.validationValues.currentFileName,
              }));

            if (typeof accept === "function") {
              this._validators.push((p) => {
                if (isEmpty(p.value)) return null;
                if (!isFile(p.value)) return null;
                const ac = accept(p);
                if (isEmpty(ac)) return null;
                const ctx = getAcceptChecker(ac);
                if (ctx.check(p.value)) return null;
                return getMessage({
                  ...p,
                  validationValues: {
                    accept: ctx.accept,
                    currentFileType: p.value.type,
                    currentFileName: p.value.name,
                  },
                });
              });
            } else {
              const ctx = getAcceptChecker(accept);
              this._validators.push((p) => {
                if (isEmpty(p.value)) return null;
                if (!isFile(p.value)) return null;
                if (ctx.check(p.value)) return null;
                return getMessage({
                  ...p,
                  validationValues: {
                    accept: ctx.accept,
                    currentFileType: p.value.type,
                    currentFileName: p.value.name,
                  },
                });
              });
            }
          }
        }

        // maxSize
        if (this.maxSize != null) {
          const [maxSize, getMaxSizeMessage] = getValidationArray(this.maxSize);
          if (maxSize != null) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getMaxSizeMessage> =
              getMaxSizeMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "maxSize",
                maxSize: p.validationValues.maxSize,
                currentSize: p.validationValues.currentSize,
              }));

            if (typeof maxSize === "function") {
              this._validators.push((p) => {
                if (isEmpty(p.value)) return null;
                if (!isFile(p.value)) return null;
                const m = maxSize(p);
                if (m == null) return null;
                if (p.value.size <= m) return null;
                return getMessage({
                  ...p,
                  validationValues: {
                    maxSize: m,
                    currentSize: p.value.size,
                  },
                });
              });
            } else {
              this._validators.push((p) => {
                if (isEmpty(p.value)) return null;
                if (!isFile(p.value)) return null;
                if (p.value.size <= maxSize) return null;
                return getMessage({
                  ...p,
                  validationValues: {
                    maxSize,
                    currentSize: p.value.size,
                  },
                });
              });
            }
          }
        }

        if (this.rules) {
          this._validators.push(...this.rules);
        }
      }

      let msg: $Schema.Message | null = null;
      for (const vali of this._validators) {
        msg = vali(params);
        if (msg) break;
      }
      return msg;
    },
  } as const satisfies FileProps & $Schema.SchemaItemInterfaceProps<FileValue, FileValidationAbstractMessage>;

  return getSchemaItemPropsGenerator<typeof fixedProps, FileProps, P>(fixedProps, props)({});
};

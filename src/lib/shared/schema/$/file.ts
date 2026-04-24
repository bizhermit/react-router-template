import { convertBase64ToFile, convertBlobToFile } from "$/shared/objects/file";
import { getEmptyInjectParams, getSchemaItemPropsGenerator, getValidationArray } from ".";

export const SCHEMA_ITEM_TYPE_FILE = "file";

type FileValue = File | string;

type FileValidations = {
  required: $Schema.ValidationSchemaEntry<boolean, null | undefined>;
  accept: $Schema.ValidationSchemaEntry<
    string,
    File,
    { accept: string; currentFileType: string; currentFileName: string; }
  >;
  maxSize: $Schema.ValidationSchemaEntry<number, File, { maxSize: number; currentSize: number; }>;
};

export type FileSchemaMessage = $Schema.ValidationMessageFromSchema<
  FileValidations,
  typeof SCHEMA_ITEM_TYPE_FILE
>;

type FileProps = $Schema.SchemaItemAbstractProps
  & $Schema.ValidationOptionsFromSchema<FileValidations>
  & {
    parser?: $Schema.Parser<FileValue>;
    rules?: $Schema.Rule<FileValue>[];
  };

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
    parse: function (value, params = getEmptyInjectParams()) {
      if (this.parser) return this.parser(value, params);
      if (value == null) return { value };

      if (value instanceof File) {
        if (value.size === 0) return { value: undefined };
        return { value };
      }

      if (value instanceof Blob) {
        try {
          if (value.size === 0) return { value: undefined };
          return { value: convertBlobToFile(value, "") };
        } catch {
          // fallback
        }
      } else if (typeof value === "string") {
        if (value === "") {
          return { value: undefined };
        }
        if (value.match(/^(https?|file):\/\//)) {
          return { value };
        }
        try {
          return { value: convertBase64ToFile(value, "") };
        } catch {
          // fallback
        }
      }

      return {
        value: undefined,
        messages: [{
          type: "e",
          label: this.label,
          actionType: this.getActionType(),
          otype: SCHEMA_ITEM_TYPE_FILE,
          code: "parse",
          name: params.name,
        }],
      };
    },
    validate: function (value, params = getEmptyInjectParams()) {
      if (this._validators == null) {
        this._validators = [];
        const commonMsgParams = {
          otype: SCHEMA_ITEM_TYPE_FILE,
          type: "e",
        } as const satisfies {
          otype: string;
          type: $Schema.AbstractMessage["type"];
        };

        // required
        if (this.required) {
          const [required, getRequiredMessage] = getValidationArray(this.required);
          if (required) {
            const getMessage = getRequiredMessage ?? ((p) => ({
              ...commonMsgParams,
              code: "required",
              label: p.label,
              params: p.params,
              name: p.name,
            }));

            if (typeof required === "function") {
              this._validators.push((p) => {
                if (!required(p)) return null;
                if (isEmpty(p.value)) {
                  return getMessage(p as $Schema.ValidationResultArgParams);
                }
                return null;
              });
            } else {
              this._validators.push((p) => {
                if (isEmpty(p.value)) {
                  return getMessage(p as $Schema.ValidationResultArgParams);
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
            const getMessage = getAcceptMessage ?? ((p) => ({
              ...commonMsgParams,
              code: "accept",
              label: p.label,
              params: p.params,
              name: p.name,
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
                  ...p as $Schema.ValidationResultArgParams<File>,
                  params: {
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
                  ...p as $Schema.ValidationResultArgParams<File>,
                  params: {
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
            const getMessage = getMaxSizeMessage ?? ((p) => ({
              ...commonMsgParams,
              code: "maxSize",
              label: p.label,
              params: p.params,
              name: p.name,
            }));

            if (typeof maxSize === "function") {
              this._validators.push((p) => {
                if (isEmpty(p.value)) return null;
                if (!isFile(p.value)) return null;
                const m = maxSize(p);
                if (m == null) return null;
                if (p.value.size <= m) return null;
                return getMessage({
                  ...p as $Schema.ValidationResultArgParams<File>,
                  params: {
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
                  ...p as $Schema.ValidationResultArgParams<File>,
                  params: {
                    maxSize,
                    currentSize: p.value.size,
                  },
                });
              });
            }
          }
        }

        // rules
        if (this.rules) {
          this._validators.push(...this.rules);
        }
      }

      const ruleArg = {
        ...params,
        label: this.label,
        actionType: this.getActionType(),
        value,
      } as const satisfies $Schema.RuleArgParams<FileValue>;

      for (const vali of this._validators) {
        const msg = vali(ruleArg);
        if (msg) return [msg];
      }
      return [];
    },
  } as const satisfies FileProps & $Schema.SchemaItemInterfaceProps<FileValue>;

  return getSchemaItemPropsGenerator<typeof fixedProps, FileProps, P>(fixedProps, props)({});
};

import { convertBase64ToFile, convertBlobToFile } from "$/shared/objects/file";
import { getPickMessageGetter, getValidationArray, SchemaItem } from "./core";

export const SCHEMA_ITEM_TYPE_FILE = "file";

type FileValue = File | string;

type FileValidations = {
  required: $Schema.ValidationEntry<boolean, null | undefined>;
  accept: $Schema.ValidationEntry<
    string,
    File,
    { accept: string; currentFileType: string; currentFileName: string; }
  >;
  maxSize: $Schema.ValidationEntry<number, File, { maxSize: number; currentSize: number; }>;
};

export type FileSchemaMessage = $Schema.ValidationMessages<
  FileValidations,
  typeof SCHEMA_ITEM_TYPE_FILE
>;

type FileProps = $Schema.SchemaItemAbstractProps
  & $Schema.Validations<FileValidations>
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

const pickMessage = getPickMessageGetter(SCHEMA_ITEM_TYPE_FILE);

export function $file<const P extends FileProps>(props: P = {} as P) {
  return new $FileSchema<P>(props);
};

export class $FileSchema<const P extends FileProps> extends SchemaItem<FileValue> {

  constructor(protected props: P = {} as P) {
    super();
  }

  public getActionType(): $Schema.ActionType {
    return this.props.actionType || "input";
  }

  public getLabel(): string | undefined {
    return this.props.label;
  }

  public parse(
    value: unknown,
    params: $Schema.ParseArgParams = this.getEmptyInjectParams()
  ): $Schema.ParseResult<FileValue> {
    if (this.props.parser) {
      const parsed = this.props.parser(value, params);
      return {
        value: parsed.value,
        messages: { [params.name || ""]: parsed.messages },
      };
    }

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
      messages: {
        [params.name || ""]: [
          pickMessage("parse", {
            label: this.getLabel(),
            actionType: this.getActionType(),
            name: params.name,
          }),
        ],
      },
    };
  }

  public validate(
    value: $Schema.Nullable<FileValue>,
    params: $Schema.ValidationArgParams = this.getEmptyInjectParams()
  ): $Schema.RecordMessages {
    if (this.validators == null) {
      this.validators = [];

      // required
      if (this.props.required) {
        const [required, getRequiredMessage] = getValidationArray(this.props.required);
        if (required) {
          const getMessage = getRequiredMessage ?? ((p) => pickMessage("required", p));

          if (typeof required === "function") {
            this.validators.push((p) => {
              if (!required(p)) return null;
              if (isEmpty(p.value)) {
                return getMessage(p as $Schema.ValidationResultArgParams);
              }
              return null;
            });
          } else {
            this.validators.push((p) => {
              if (isEmpty(p.value)) {
                return getMessage(p as $Schema.ValidationResultArgParams);
              }
              return null;
            });
          }
        }
      }

      // accept
      if (this.props.accept) {
        const [accept, getAcceptMessage] = getValidationArray(this.props.accept);
        if (accept) {
          const getMessage = getAcceptMessage ?? ((p) => pickMessage("accept", p));

          if (typeof accept === "function") {
            this.validators.push((p) => {
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
            this.validators.push((p) => {
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
      if (this.props.maxSize != null) {
        const [maxSize, getMaxSizeMessage] = getValidationArray(this.props.maxSize);
        if (maxSize != null) {
          const getMessage = getMaxSizeMessage ?? ((p) => pickMessage("maxSize", p));

          if (typeof maxSize === "function") {
            this.validators.push((p) => {
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
            this.validators.push((p) => {
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
      if (this.props.rules) {
        this.validators.push(...this.props.rules);
      }
    }

    return super.validate(value, params);
  }

  public overwrite<const OP extends FileProps>(props: OP) {
    return new $FileSchema<Omit<P, keyof OP> & OP>({
      ...this.props,
      ...props,
    });
  }

}

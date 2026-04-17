import { getLength } from "$/shared/objects/string";
import { getSchemaItemPropsGenerator, getValidationArray } from ".";

export const SCHEMA_ITEM_TYPE_STRING = "str";

function isIpv4Address(str: string | null | undefined) {
  if (str == null) return false;
  const s = str.split(".");
  if (s.length !== 4) return false;
  for (const numStr of s) {
    if (!/^(0|[1-9]\d{0,2})/.test(numStr)) return false;
    const num = Number(numStr);
    if (num < 0 || num > 255) return false;
  }
  return true;
};

const STR_PATTERN_TEST = {
  int: /^[+-]?(0|[1-9]\d*)$/.test,
  "h-num": /^[0-9]+$/.test,
  num: /^[0-9０-９]+$/.test,
  "h-alpha": /^[a-zA-Z]+$/.test,
  alpha: /^[a-zA-Zａ-ｚＡ-Ｚ]+$/.test,
  "h-alpha-num": /^[a-zA-Z0-9]+$/.test,
  "h-alpha-num-syn": /^[a-zA-Z0-9!-/:-@¥[-`{-~]+$/.test,
  "h-katakana": /^[｡-ﾟ+]+$/.test,
  "f-katakana": /^[ァ-ヶー]+$/.test,
  katakana: /^[｡-ﾟ+ァ-ヶー]+$/.test,
  hiragana: /^[ぁ-ゞー]+$/.test,
  half: /^[\x20-\x7E]*$/.test,
  full: /^[^\x01-\x7E\uFF61-\uFF9F]*$/.test,
  email: (str: string) => {
    if (!str) return false;
    let quoted = false, escape = false;
    const arr = Array.from(str);
    for (let i = 0, il = arr.length; i < il; i++) {
      const c = arr[i];
      if ("@" === c && !quoted) {
        // console.log("local:", str.slice(0, i));
        if (i < 1 || i > 64) {
          // console.log("[x] local len", i, str);
          return false;
        }
        if ("." === arr[i - 1]) {
          // console.log("[x] local-part dot end", str);
          return false;
        }
        // domain
        const domain = arr.slice(i + 1).join("");
        // console.log("domain:", domain);
        if (getLength(domain) > 63) {
          // console.log("[x] domain len", strLength(domain), str);
          return false;
        }
        const ctx = domain.match(/^(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|(?:\[((?:[0-9]{1,3}\.){3}[0-9]{1,3})\])|(?:((?:[0-9]{1,3}\.){3}[0-9]{1,3}))|(?:\[(?:IPv6:[a-fA-F0-9:]+\])))$/);
        if (!ctx) {
          // console.log("[x] un domain", str);
          return false;
        }
        const ipv4 = ctx[1] || ctx[2];
        if (ipv4) return isIpv4Address(ipv4);
        return true;
      }
      // local
      if (("\"" === c || "”" === c) && !escape) {
        if (quoted) {
          const next = arr[i + 1];
          if ("." !== next && "@" !== next) {
            // console.log("[x] quote not end of part", `[${str[i - 1]}${c}${str[i + 1]}]`, i, str);
            return false;
          }
        } else {
          const prev = arr[i - 1];
          if (prev && "." !== prev) {
            // console.log("[x] quote not start of part", `[${c}]`, i, str);
            return false;
          }
        }
        quoted = !quoted;
        continue;
      }
      if (quoted) {
        if (escape) {
          if (!/[\x01-\x09\x0b\x0c\x0e-\x7f\\ ]/.test(c)) {
            // console.log("[x] not allow quoted/escape char", `[${c}]`, str);
            return false;
          }
        } else {
          if ("\\" === c) {
            escape = true;
            continue;
          }
          if (!/[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f ]/.test(c)) {
            // console.log("[x] not allow quoted char", `[${c}]`, str);
            return false;
          }
        }
      } else {
        if (!/[.a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]/.test(c)) {
          // console.log("[x] not allow char", `[${c}]`, str);
          return false;
        }
        if ("." === c) {
          if (i === 0 || "." === str[i - 1]) {
            // console.log("[x] dot failed", str);
            return false;
          }
        }
      }
      escape = false;
    }
    // console.log("[x] no domain", str);
    return false;
  },
  tel: (str: string) => {
    return /^0\d-\d{4}-\d{4}$/.test(str)
      || /^0\d{3}-\d{2}-\d{4}$/.test(str)
      || /^0\d{2}-\d{3}-\d{4}$/.test(str)
      || /^0(7|8|9)0-\d{4}-\d{4}$/.test(str)
      || /^050-\d{4}-\d{4}$/.test(str)
      || /^\(0\d\)\d{4}-\d{4}$/.test(str)
      || /^\(0\d{3}\)\d{2}-\d{4}$/.test(str)
      || /^0120-\d{3}-\d{3}$/.test(str)
      || /^0120-\d{2}-\d{2}-\d{2}$/.test(str);
  },
  url: /^https?:\/\/[a-zA-Z0-9!-/:-@¥[-`{-~]+/.test,
  "post-num": (str: string) => {
    return /^[0-9]{3}-[0-9]{4}$/.test(str) || /^[0-9]{7}$/.test(str);
  },
} as const;

type StrPattern = keyof typeof STR_PATTERN_TEST;

type StringValidation_LengthParams = { length: number; currentLength: number; };
type StringValidation_MinLengthParams = { minLength: number; currentLength: number; };
type StringValidation_MaxLengthParams = { maxLength: number; currentLength: number; };
type StringValidation_Pattern = { pattern: StrPattern; };

type StringValidationAbstractMessage = $Schema.AbstractMessage & {
  otype: typeof SCHEMA_ITEM_TYPE_STRING;
};
export type StringValidationMessage = StringValidationAbstractMessage & (
  | { code: "parse"; }
  | { code: "required"; }
  | ({ code: "length"; } & StringValidation_LengthParams)
  | ({ code: "minLength"; } & StringValidation_MinLengthParams)
  | ({ code: "maxLength"; } & StringValidation_MaxLengthParams)
  | ({ code: "pattern"; } & StringValidation_Pattern)
);

type StringOptions = {
  parser?: $Schema.Parser<string>;
  required?: $Schema.Validation<$Schema.Nullable<string>, boolean, undefined, StringValidationMessage>;
  length?: $Schema.Validation<string, number, StringValidation_LengthParams, StringValidationMessage>;
  minLength?: $Schema.Validation<string, number, StringValidation_MinLengthParams, StringValidationMessage>;
  maxLength?: $Schema.Validation<string, number, StringValidation_MaxLengthParams, StringValidationMessage>;
  pattern?: $Schema.Validation<string, StrPattern, StringValidation_Pattern, StringValidationMessage>;
  rules?: $Schema.Rule<string>[];
};

type StringProps = $Schema.SchemaItemAbstractProps & StringOptions;

function isEmpty(value: $Schema.Nullable<string>) {
  return value == null || value === "";
};

export function $str<const P extends StringProps>(props: P = {} as P) {
  const fixedProps = {
    type: SCHEMA_ITEM_TYPE_STRING,
    _validators: null,
    parse: function (params) {
      if (this.parser) return this.parser(params);
      if (params.value == null || params.value === "") return { value: undefined };
      if (typeof params.value === "string") return { value: params.value };
      return { value: String(params.value) };
    },
    validate: function (params) {
      if (this._validators == null) {
        this._validators = [];
        const commonMsgParams = {
          otype: SCHEMA_ITEM_TYPE_STRING,
          label: this.label,
          type: "e",
          actionType: this.actionType || "input",
        } as const satisfies StringValidationAbstractMessage;

        // required
        if (this.required != null) {
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

        // length
        if (this.length != null) {
          const [length, getLengthMessage] = getValidationArray(this.length);
          if (length != null) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getLengthMessage> =
              getLengthMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "length",
                length: p.validationValues.length,
                currentLength: p.validationValues.currentLength,
              }));

            if (typeof length === "function") {
              this._validators.push((p) => {
                if (isEmpty(p.value)) return null;
                const len = length(p);
                if (len == null) return null;
                const cur = getLength(p.value);
                if (cur === len) return null;
                return getMessage({
                  ...p,
                  validationValues: {
                    length: len,
                    currentLength: cur,
                  },
                });
              });
            } else {
              this._validators.push((p) => {
                if (isEmpty(p.value)) return null;
                const cur = getLength(p.value);
                if (cur === length) return null;
                return getMessage({
                  ...p,
                  validationValues: {
                    length,
                    currentLength: cur,
                  },
                });
              });
            }
          }
        }

        // minLength
        if (this.minLength != null) {
          const [minLength, getMinLengthMessage] = getValidationArray(this.minLength);
          if (minLength != null) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getMinLengthMessage> =
              getMinLengthMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "minLength",
                minLength: p.validationValues.minLength,
                currentLength: p.validationValues.currentLength,
              }));

            if (typeof minLength === "function") {
              this._validators.push((p) => {
                if (isEmpty(p.value)) return null;
                const minLen = minLength(p);
                if (minLen == null) return null;
                const cur = getLength(p.value);
                if (minLen <= cur) return null;
                return getMessage({
                  ...p,
                  validationValues: {
                    minLength: minLen,
                    currentLength: cur,
                  },
                });
              });
            } else {
              this._validators.push((p) => {
                if (isEmpty(p.value)) return null;
                const cur = getLength(p.value);
                if (minLength <= cur) return null;
                return getMessage({
                  ...p,
                  validationValues: {
                    minLength,
                    currentLength: cur,
                  },
                });
              });
            }
          }
        }

        // maxLength
        if (this.maxLength != null) {
          const [maxLength, getMaxLengthMessage] = getValidationArray(this.maxLength);
          if (maxLength != null) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getMaxLengthMessage> =
              getMaxLengthMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "maxLength",
                maxLength: p.validationValues.maxLength,
                currentLength: p.validationValues.currentLength,
              }));

            if (typeof maxLength === "function") {
              this._validators.push((p) => {
                if (isEmpty(p.value)) return null;
                const maxLen = maxLength(p);
                if (maxLen == null) return null;
                const cur = getLength(p.value);
                if (cur <= maxLen) return null;
                return getMessage({
                  ...p,
                  validationValues: {
                    maxLength: maxLen,
                    currentLength: cur,
                  },
                });
              });
            } else {
              this._validators.push((p) => {
                if (isEmpty(p.value)) return null;
                const cur = getLength(p.value);
                if (cur <= maxLength) return null;
                return getMessage({
                  ...p,
                  validationValues: {
                    maxLength: maxLength,
                    currentLength: cur,
                  },
                });
              });
            }
          }
        }

        // pattern
        if (this.pattern != null) {
          const [pattern, getPatternMessage] = getValidationArray(this.pattern);
          if (pattern != null) {
            const getMessage: $Schema.ValidationMessageGetter<typeof getPatternMessage> =
              getPatternMessage ??
              ((p) => ({
                ...commonMsgParams,
                code: "pattern",
                pattern: p.validationValues.pattern,
              }));

            if (typeof pattern === "function") {
              this._validators.push((p) => {
                if (isEmpty(p.value)) return null;
                const ptn = pattern(p);
                if (!ptn) return null;
                const test = STR_PATTERN_TEST[ptn];
                if (test(p.value)) return null;
                return getMessage({
                  ...p,
                  validationValues: {
                    pattern: ptn,
                  },
                });
              });
            } else {
              const test = STR_PATTERN_TEST[pattern];
              this._validators.push((p) => {
                if (isEmpty(p.value)) return null;
                if (test(p.value)) return null;
                return getMessage({
                  ...p,
                  validationValues: {
                    pattern,
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

      let msg: $Schema.Message | null = null;
      for (const vali of this._validators) {
        msg = vali(params);
        if (msg) break;
      }
      return msg;
    },
  } as const satisfies StringProps & $Schema.SchemaItemInterfaceProps<string>;

  return getSchemaItemPropsGenerator<typeof fixedProps, StringProps, P>(fixedProps, props)({});
};

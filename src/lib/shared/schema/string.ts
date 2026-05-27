import { getLength } from "$/shared/objects/string";
import { getPickMessageGetter, getValidationArray, SchemaItem } from "./core";

export const SCHEMA_ITEM_TYPE_STRING = "str" as const;

function isEmpty(value: $Schema.Nullable<string>): value is (null | undefined) {
  return value == null || value === "";
};

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

export type StrPattern = keyof typeof STR_PATTERN_TEST;

type StringValidations = {
  required: $Schema.ValidationEntry<boolean, null | undefined>;
  length: $Schema.ValidationEntry<number, string, { length: number; currentLength: number; }>;
  minLength: $Schema.ValidationEntry<number, string, { minLength: number; currentLength: number; }>;
  maxLength: $Schema.ValidationEntry<number, string, { maxLength: number; currentLength: number; }>;
  pattern: $Schema.ValidationEntry<StrPattern, string, { pattern: StrPattern; }>;
};

export type StringSchemaMessage = $Schema.ValidationMessages<
  StringValidations,
  typeof SCHEMA_ITEM_TYPE_STRING
>;

type StringProps = $Schema.SchemaItemAbstractProps
  & $Schema.Validations<StringValidations>
  & {
    parser?: $Schema.Parser<string>;
    rules?: $Schema.Rule<string>[];
  };

const pickMessage = getPickMessageGetter(SCHEMA_ITEM_TYPE_STRING);

export function $str<const P extends StringProps>(props: P = {} as P) {
  return new $StrSchema<P>(props);
};

export class $StrSchema<const P extends StringProps> extends SchemaItem<string> {

  constructor(protected props: P = {} as P) {
    super(props);
  }

  public getActionType(): $Schema.ActionType {
    return this.actionType || "input";
  }

  public parse(
    value: unknown,
    params: $Schema.ParseArgParams = this.getEmptyInjectParams()
  ): $Schema.ParseResult<string> {
    if (this.props.parser) {
      const parsed = this.props.parser(value, params);
      return {
        value: parsed.value,
        messages: { [params.name || ""]: parsed.messages },
      };
    }

    if (value == null || value === "") return { value: undefined };
    if (typeof value === "string") return { value };
    return { value: String(value) };
  }

  public validate(
    value: $Schema.Nullable<string>,
    params?: $Schema.ValidationArgParams
  ): $Schema.RecordMessages {
    if (this.validators == null) {
      this.validators = [];

      // required
      if (this.props.required != null) {
        const [required, getRequiredMessage] = getValidationArray(this.props.required);
        if (required) {
          const getMessage = getRequiredMessage ?? ((p) => pickMessage("required", p));

          if (typeof required === "function") {
            this.validators.push((p) => {
              if (!required(p)) return null;
              if (isEmpty(p.value)) {
                return getMessage(p as $Schema.RuleArgParamsAsValidation<null | undefined>);
              }
              return null;
            });
          } else {
            this.validators.push((p) => {
              if (isEmpty(p.value)) {
                return getMessage(p as $Schema.RuleArgParamsAsValidation<null | undefined>);
              }
              return null;
            });
          }
        }
      }

      // length
      if (this.props.length != null) {
        const [length, getLengthMessage] = getValidationArray(this.props.length);

        if (length != null) {
          const getMessage = getLengthMessage ?? ((p) => pickMessage("length", p));

          if (typeof length === "function") {
            this.validators.push((p) => {
              if (isEmpty(p.value)) return null;
              const len = length(p);
              if (len == null) return null;
              const cur = getLength(p.value);
              if (cur === len) return null;
              return getMessage({
                ...p as $Schema.RuleArgParamsAsValidation<string>,
                params: {
                  length: len,
                  currentLength: cur,
                },
              });
            });
          } else {
            this.validators.push((p) => {
              if (isEmpty(p.value)) return null;
              const cur = getLength(p.value);
              if (cur === length) return null;
              return getMessage({
                ...p as $Schema.RuleArgParamsAsValidation<string>,
                params: {
                  length,
                  currentLength: cur,
                },
              });
            });
          }
        }
      }

      // minLength
      if (this.props.minLength != null) {
        const [minLength, getMinLengthMessage] = getValidationArray(this.props.minLength);
        if (minLength != null) {
          const getMessage = getMinLengthMessage ?? ((p) => pickMessage("minLength", p));

          if (typeof minLength === "function") {
            this.validators.push((p) => {
              if (isEmpty(p.value)) return null;
              const minLen = minLength(p);
              if (minLen == null) return null;
              const cur = getLength(p.value);
              if (minLen <= cur) return null;
              return getMessage({
                ...p as $Schema.RuleArgParamsAsValidation<string>,
                params: {
                  minLength: minLen,
                  currentLength: cur,
                },
              });
            });
          } else {
            this.validators.push((p) => {
              if (isEmpty(p.value)) return null;
              const cur = getLength(p.value);
              if (minLength <= cur) return null;
              return getMessage({
                ...p as $Schema.RuleArgParamsAsValidation<string>,
                params: {
                  minLength,
                  currentLength: cur,
                },
              });
            });
          }
        }
      }

      // maxLength
      if (this.props.maxLength != null) {
        const [maxLength, getMaxLengthMessage] = getValidationArray(this.props.maxLength);
        if (maxLength != null) {
          const getMessage = getMaxLengthMessage ?? ((p) => pickMessage("maxLength", p));

          if (typeof maxLength === "function") {
            this.validators.push((p) => {
              if (isEmpty(p.value)) return null;
              const maxLen = maxLength(p);
              if (maxLen == null) return null;
              const cur = getLength(p.value);
              if (cur <= maxLen) return null;
              return getMessage({
                ...p as $Schema.RuleArgParamsAsValidation<string>,
                params: {
                  maxLength: maxLen,
                  currentLength: cur,
                },
              });
            });
          } else {
            this.validators.push((p) => {
              if (isEmpty(p.value)) return null;
              const cur = getLength(p.value);
              if (cur <= maxLength) return null;
              return getMessage({
                ...p as $Schema.RuleArgParamsAsValidation<string>,
                params: {
                  maxLength: maxLength,
                  currentLength: cur,
                },
              });
            });
          }
        }
      }

      // pattern
      if (this.props.pattern != null) {
        const [pattern, getPatternMessage] = getValidationArray(this.props.pattern);

        if (pattern != null) {
          const getMessage = getPatternMessage ?? ((p) => pickMessage("pattern", p));

          if (typeof pattern === "function") {
            this.validators.push((p) => {
              if (isEmpty(p.value)) return null;
              const ptn = pattern(p);
              if (!ptn) return null;
              const test = STR_PATTERN_TEST[ptn];
              if (test(p.value)) return null;
              return getMessage({
                ...p as $Schema.RuleArgParamsAsValidation<string>,
                params: {
                  pattern: ptn,
                },
              });
            });
          } else {
            const test = STR_PATTERN_TEST[pattern];
            this.validators.push((p) => {
              if (isEmpty(p.value)) return null;
              if (test(p.value)) return null;
              return getMessage({
                ...p as $Schema.RuleArgParamsAsValidation<string>,
                params: {
                  pattern,
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

  public overwrite<const OP extends StringProps>(props: OP) {
    return new $StrSchema<Omit<P, keyof OP> & OP>({
      ...this.props,
      ...props,
    });
  }

  public getRequired(params: $Schema.InjectParams) {
    const required = getValidationArray(this.props.required)[0];
    if (typeof required === "function") {
      return required(params) ?? false;
    }
    return required ?? false;
  }

  public getLength(params: $Schema.InjectParams) {
    const length = getValidationArray(this.props.length)[0];
    if (typeof length === "function") {
      return length(params);
    }
    return length;
  }

  public getMinLength(params: $Schema.InjectParams) {
    const minLength = getValidationArray(this.props.minLength)[0];
    if (typeof minLength === "function") {
      return minLength(params);
    }
    return minLength;
  }

  public getMaxLength(params: $Schema.InjectParams) {
    const maxLength = getValidationArray(this.props.maxLength)[0];
    if (typeof maxLength === "function") {
      return maxLength(params);
    }
    return maxLength;
  }

  public getPattern(params: $Schema.InjectParams) {
    const pattern = getValidationArray(this.props.pattern)[0];
    if (typeof pattern === "function") {
      return pattern(params);
    }
    return pattern;
  }

};

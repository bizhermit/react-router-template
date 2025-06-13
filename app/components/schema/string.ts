import type { HTMLAttributes, HTMLInputTypeAttribute } from "react";
import { getLength } from "../objects/string";
import { getValidationArray } from "./utilities";

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

function getStringPatternChecker(pattern: Schema.StrPattern): ((str: string) => boolean) {
  switch (pattern) {
    case "int": return /^[+-]?(0|[1-9]\d*)$/.test;
    case "h-num": return /^[0-9]+$/.test;
    case "num": return /^[0-9０-９]+$/.test;
    case "h-alpha": return /^[a-zA-Z]+$/.test;
    case "alpha": return /^[a-zA-Zａ-ｚＡ-Ｚ]+$/.test;
    case "h-alpha-num": return /^[a-zA-Z0-9]+$/.test;
    case "h-alpha-num-syn": return /^[a-zA-Z0-9!-/:-@¥[-`{-~]+$/.test;
    case "h-katakana": return /^[｡-ﾟ+]+$/.test;
    case "f-katakana": return /^[ァ-ヶー]+$/.test;
    case "katakana": return /^[｡-ﾟ+ァ-ヶー]+$/.test;
    case "hiragana": return /^[ぁ-ゞー]+$/.test;
    case "half": return /^[\x20-\x7E]*$/.test;
    case "full": return /^[^\x01-\x7E\uFF61-\uFF9F]*$/.test;
    case "tel":
      return (str: string) => {
        return /^0\d-\d{4}-\d{4}$/.test(str)
          || /^0\d{3}-\d{2}-\d{4}$/.test(str)
          || /^0\d{2}-\d{3}-\d{4}$/.test(str)
          || /^0(7|8|9)0-\d{4}-\d{4}$/.test(str)
          || /^050-\d{4}-\d{4}$/.test(str)
          || /^\(0\d\)\d{4}-\d{4}$/.test(str)
          || /^\(0\d{3}\)\d{2}-\d{4}$/.test(str)
          || /^0120-\d{3}-\d{3}$/.test(str)
          || /^0120-\d{2}-\d{2}-\d{2}$/.test(str);
      };
    case "post-num":
      return (str: string) => {
        return /^[0-9]{3}-[0-9]{4}$/.test(str) || /^[0-9]{7}$/.test(str);
      };
    case "url":
      return /^https?:\/\/[a-zA-Z0-9!-/:-@¥[-`{-~]+/.test;
    case "email":
      return (str: string) => {
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
      };
    default: return () => true;
  }
};

interface PatternInputProps {
  type?: HTMLInputTypeAttribute;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
};

function getPatternInputProps(pattern: Schema.StringProps["pattern"]): PatternInputProps {
  if (pattern == null || typeof pattern !== "string") return {};
  switch (pattern) {
    case "int":
    case "h-num":
      return { inputMode: "decimal" };
    case "h-alpha":
    case "h-alpha-num":
    case "h-alpha-num-syn":
      return { inputMode: "url" };
    case "email":
      return { type: "email" };
    case "tel":
      return { type: "tel" };
    case "url":
      return { type: "url" };
    default:
      return {};
  }
};

export function $str<Props extends Schema.StringProps>(props?: Props) {
  const validators: Array<Schema.Validator<string>> = [];

  const [required, getRequiredMessage] = getValidationArray(props?.required);
  if (required) {
    const getMessage: Schema.MessageGetter<Schema.StringProps["required"]> = getRequiredMessage ?
      (p) => getRequiredMessage(p) :
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

  const [length, getLengthMessage] = getValidationArray(props?.len);
  const [minLength, getMinLengthMessage] = getValidationArray(props?.min);
  const [maxLength, getMaxLengthMessage] = getValidationArray(props?.max);
  if (length != null) {
    const getMessage: Schema.MessageGetter<Schema.StringProps["len"]> = getLengthMessage ?
      (p) => getLengthMessage(p) :
      (p) => p.env.t(`${p.length}文字で入力してください。`);

    if (typeof length === "function") {
      validators.push((p) => {
        if (p.value == null || p.value === "") return null;
        const len = length(p);
        const cur = getLength(p.value);
        if (cur === len) return null;
        return {
          type: "e",
          code: "length",
          message: getMessage({ ...p, length: len, currentLength: cur }),
        };
      });
    } else {
      validators.push((p) => {
        if (p.value == null || p.value === "") return null;
        const cur = getLength(p.value);
        if (cur === length) return null;
        return {
          type: "e",
          code: "length",
          message: getMessage({ ...p, length: length, currentLength: cur }),
        };
      });
    }
  } else {
    if (minLength != null) {
      const getMessage: Schema.MessageGetter<Schema.StringProps["min"]> = getMinLengthMessage ?
        (p) => getMinLengthMessage(p) :
        (p) => p.env.t(`${p.minLength}文字以上で入力してください。`);

      if (typeof minLength === "function") {
        validators.push((p) => {
          if (p.value == null || p.value === "") return null;
          const minLen = minLength(p);
          const cur = getLength(p.value);
          if (minLen <= cur) return null;
          return {
            type: "e",
            code: "minLength",
            message: getMessage({ ...p, minLength: minLen, currentLength: cur }),
          };
        });
      } else {
        validators.push((p) => {
          if (p.value == null || p.value === "") return null;
          const cur = getLength(p.value);
          if (minLength <= cur) return null;
          return {
            type: "e",
            code: "minLength",
            message: getMessage({ ...p, minLength, currentLength: cur }),
          };
        });
      }
    }

    if (maxLength != null) {
      const getMessage: Schema.MessageGetter<Schema.StringProps["max"]> = getMaxLengthMessage ?
        (p) => getMaxLengthMessage(p) :
        (p) => p.env.t(`${p.maxLength}文字以下で入力してください。`);

      if (typeof maxLength === "function") {
        validators.push((p) => {
          if (p.value == null || p.value === "") return null;
          const maxLen = maxLength(p);
          const cur = getLength(p.value);
          if (cur >= maxLen) return null;
          return {
            type: "e",
            code: "maxLength",
            message: getMessage({ ...p, maxLength: maxLen, currentLength: cur }),
          };
        });
      } else {
        validators.push((p) => {
          if (p.value == null || p.value === "") return null;
          const cur = getLength(p.value);
          if (cur >= maxLength) return null;
          return {
            type: "e",
            code: "maxLength",
            message: getMessage({ ...p, maxLength, currentLength: cur }),
          };
        });
      }
    }
  }

  const [pattern, getPatternMessage] = getValidationArray(props?.pattern);
  if (pattern) {
    const getMessage: Schema.MessageGetter<Schema.StringProps["pattern"]> = getPatternMessage ?
      (p) => getPatternMessage(p) :
      (p) => p.env.t(`正しい書式で入力してください。`);

    if (typeof pattern === "function") {
      validators.push((p) => {
        if (p.value == null || p.value === "") return null;
        const pat = pattern(p);
        if (typeof pat === "string") {
          const check = getStringPatternChecker(pat);
          if (check(p.value)) return null;
          return {
            type: "e",
            code: "pattern",
            message: getMessage({ ...p, pattern: pat }),
          }
        }
        if (pat.test(p.value)) return null;
        return {
          type: "e",
          code: "pattern",
          message: getMessage({ ...p, pattern: pat }),
        };
      });
    } else {
      if (typeof pattern === "string") {
        const check = getStringPatternChecker(pattern);
        validators.push((p) => {
          if (p.value == null || p.value === "") return null;
          if (check(p.value)) return null;
          return null;
        });
      } else {
        validators.push((p) => {
          if (p.value == null || p.value === "") return null;
          if (pattern.test(p.value)) return null;
          return {
            type: "e",
            code: "pattern",
            message: getMessage({ ...p, pattern }),
          };
        });
      }
    }
  }

  if (props?.validators) {
    validators.push(...props.validators);
  }

  return {
    type: "str",
    source: props?.source,
    validators,
    required: required as unknown as Schema.ValidationArray<Props["required"]>,
    length,
    minLength,
    maxLength,
    pattern,
  } as const;
};
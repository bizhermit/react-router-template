import { formatDate } from "../objects/date";

export function getResultMessage(
  t: I18nGetter,
  result: Schema.Result | null | undefined
): string | undefined {
  if (!result) return undefined;

  if (result.message) return result.message;

  const label = result.label ? t(result.label as I18nTextKey || "default_label") : t("default_label");
  const actionType = result.actionType || "input";
  switch (result.otype) {
    case "str":
      switch (result.code) {
        case "required":
          return t(`required_${actionType}`, { label });
        case "source":
          return t(`invalidValue_${actionType}`, { label });
        case "length":
          return t(`matchStrLength`, { label, length: result.length });
        case "minLength":
          return t("minStrLength", { label, minLength: result.minLength });
        case "maxLength":
          return t("maxStrLength", { label, maxLength: result.maxLength });
        case "pattern":
          return t("invalidPattern_input", {
            label,
            pattern: t(typeof result.pattern === "string" ? result.pattern : "specifiedFormat"),
          });
        default:
          return "";
      }
    case "num":
      switch (result.code) {
        case "parse":
          return t("invalidNumeric", { label });
        case "required":
          return t(`required_${actionType}`, { label });
        case "source":
          return t(`invalidValue_${actionType}`, { label });
        case "min":
          return t(`minNum_${actionType}`, { label, min: result.min });
        case "max":
          return t(`maxNum_${actionType}`, { label, max: result.max });
        case "float":
          return t("maxFloat", { label, float: result.float });
        default:
          return "";
      }
    case "bool":
      switch (result.code) {
        case "parse":
          return t("invalidBoolean", { label });
        case "required":
          return t(`required_${actionType}`, { label });
        case "source":
          return t(`invalidValue_${actionType}`, { label });
        default:
          return "";
      }
    case "month":
    case "date":
    case "datetime":
      switch (result.code) {
        case "parse":
          return t(
            result.otype === "month" ? "invalidMonth" : result.otype === "datetime" ? "invalidDatetime" : "invalidDate",
            { label }
          );
        case "required":
          return t(`required_${actionType}`, { label });
        case "source":
          return t(`invalidValue_${actionType}`, { label });
        case "minDate":
          return t(`minDate_${actionType}`, {
            label,
            minDate: formatDate(result.minDate, result.formatPattern),
          });
        case "maxDate":
          return t(`maxDate_${actionType}`, {
            label,
            maxDate: formatDate(result.maxDate, result.formatPattern),
          });
        case "minTime":
          return t(`minTime_${actionType}`, { label, minTime: result.minTime });
        case "maxTime":
          return t(`maxTime_${actionType}`, { label, maxTime: result.maxTime });
        case "pair":
          return t("contextDate", { label });
        default:
          return "";
      }
    case "sdate":
    case "sdate-Y":
    case "sdate-M":
    case "sdate-D":
    case "sdate-h":
    case "sdate-m":
    case "sdate-s":
      switch (result.code) {
        case "parse":
          return t("invalidNumeric", { label });
        case "required":
          return t(`required_${actionType}`, { label });
        case "split-required":
          return t(`requiredSplitDate_${actionType}`, { label, target: result.targets.join(",") });
        case "min":
          return t(`minNum_${actionType}`, { label, min: result.min });
        case "max":
          return t(`maxNum_${actionType}`, { label, max: result.max });
        default:
          return "";
      }
    case "file":
      switch (result.code) {
        case "parse":
          return t("invalidFile", { label });
        case "required":
          return t(`required_${actionType}`, { label });
        case "accept":
          return t("fileAccept", { label });
        case "maxSize":
          return t("maxFileSize", { label, maxSize: result.maxSize });
        default:
          return "";
      }
    case "arr":
      switch (result.code) {
        case "required":
          return t(`required_${actionType}`, { label });
        case "source":
          return t(`invalidValue_${actionType}`, { label });
        case "length":
          return t(`matchArrLength_${actionType}`, { label, length: result.length });
        case "minLength":
          return t(`minArrLength_${actionType}`, { label, minLength: result.minLength });
        case "maxLength":
          return t(`maxArrLength_${actionType}`, { label, maxLength: result.maxLength });
        default:
          return "";
      }
    case "struct":
      switch (result.code) {
        case "required":
          return t(`required_${actionType}`, { label });
        default:
          return "";
      }
    case "i18n":
      return t(result.code, {
        label,
        ...result.params,
      } as I18nReplaceParams<typeof result.code>);
    default:
      return result.message || "";
  }
}

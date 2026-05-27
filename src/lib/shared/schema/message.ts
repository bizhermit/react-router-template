import { $Date, $DateTime, $Month, $Time } from "../objects/timestamp";

export function getResultMessage(
  t: I18nGetter,
  message: $Schema.Message | null | undefined
): string | undefined {
  if (!message) return undefined;
  if (message.message) return message.message;

  const label = message.label ? t(message.label as I18nTextKey || "default_label") : t("default_label");
  const actionType = message.actionType || "input";
  switch (message.otype) {
    case "str":
      switch (message.code) {
        case "required":
          return t(`required_${actionType}`, { label });
        case "length":
          return t(`matchStrLength`, { label, length: message.params.length });
        case "minLength":
          return t("minStrLength", { label, minLength: message.params.minLength });
        case "maxLength":
          return t("maxStrLength", { label, maxLength: message.params.maxLength });
        case "pattern":
          return t("invalidPattern_input", {
            label,
            pattern: t(typeof message.params.pattern === "string" ? message.params.pattern : "specifiedFormat"),
          });
        default:
          return "";
      }
    case "num":
      switch (message.code) {
        case "parse":
          return t("invalidNumeric", { label });
        case "required":
          return t(`required_${actionType}`, { label });
        case "min":
          return t(`minNum_${actionType}`, { label, min: message.params.min });
        case "max":
          return t(`maxNum_${actionType}`, { label, max: message.params.max });
        case "float":
          return t("maxFloat", { label, float: message.params.float });
        default:
          return "";
      }
    case "bool":
      switch (message.code) {
        case "parse":
          return t("invalidBoolean", { label });
        case "required":
          return t(`required_${actionType}`, { label });
        default:
          return "";
      }
    case "enum":
      switch (message.code) {
        case "parse":
          return t(`invalidValue_${actionType}`, { label });
        case "required":
          return t(`required_${actionType}`, { label });
        case "notFound":
          return t(`invalidValue_${actionType}`, { label });
        default:
          return "";
      }
    case "date":
      switch (message.code) {
        case "parse":
          return t("invalidDate", { label });
        case "required":
          return t(`required_${actionType}`, { label });
        case "minDate":
          return t(`minDate_${actionType}`, {
            label,
            minDate: new $Date(message.params.minDate).toString(),
          });
        case "maxDate":
          return t(`maxDate_${actionType}`, {
            label,
            maxDate: new $Date(message.params.maxDate).toString(),
          });
        case "pairs":
          return t("contextDate", { label });
        default:
          return "";
      }
    case "datetime":
      switch (message.code) {
        case "parse":
          return t("invalidDatetime", { label });
        case "required":
          return t(`required_${actionType}`, { label });
        case "minDateTime":
          return t(`minDate_${actionType}`, {
            label,
            minDate: new $DateTime(message.params.minDateTime).toString(),
          });
        case "maxDateTime":
          return t(`maxDate_${actionType}`, {
            label,
            maxDate: new $DateTime(message.params.maxDateTime).toString(),
          });
        case "minDate":
          return t(`minDate_${actionType}`, {
            label,
            minDate: new $Date(message.params.minDate).toString(),
          });
        case "maxDate":
          return t(`maxDate_${actionType}`, {
            label,
            maxDate: new $Date(message.params.maxDate).toString(),
          });
        case "minTime":
          return t(`minTime_${actionType}`, { label, minTime: new $Time(message.params.minTime).toString() });
        case "maxTime":
          return t(`maxTime_${actionType}`, { label, maxTime: new $Time(message.params.maxTime).toString() });
        case "pairs":
          return t("contextDate", { label });
        default:
          return "";
      }
    case "month":
      switch (message.code) {
        case "parse":
          return t("invalidDate", { label });
        case "required":
          return t(`required_${actionType}`, { label });
        case "minMonth":
          return t(`minDate_${actionType}`, {
            label,
            minDate: new $Month(message.params.minMonth).toString(),
          });
        case "maxMonth":
          return t(`maxDate_${actionType}`, {
            label,
            maxDate: new $Month(message.params.maxMonth).toString(),
          });
        case "pairs":
          return t("contextDate", { label });
        default:
          return "";
      }
    case "split-year":
    case "split-month":
    case "split-day":
    case "split-hour":
    case "split-minute":
    case "split-second":
      switch (message.code) {
        case "parse":
          return t("invalidNumeric", { label });
        case "required":
          return t(`required_${actionType}`, { label });
        case "split-required":
          return t(`requiredSplitDate_${actionType}`, {
            label,
            target: message.targets.map(target => t(target as I18nTextKey)).join(","),
          });
        case "min":
          return t(`minNum_${actionType}`, { label, min: message.params.min });
        case "max":
          return t(`maxNum_${actionType}`, { label, max: message.params.max });
        default:
          return "";
      }
    case "file":
      switch (message.code) {
        case "parse":
          return t("invalidFile", { label });
        case "required":
          return t(`required_${actionType}`, { label });
        case "accept":
          return t("fileAccept", { label });
        case "maxSize":
          return t("maxFileSize", { label, maxSize: message.params.maxSize });
        default:
          return "";
      }
    case "arr":
      switch (message.code) {
        case "required":
          return t(`required_${actionType}`, { label });
        case "length":
          return t(`matchArrLength_${actionType}`, { label, length: message.params.length });
        case "minLength":
          return t(`minArrLength_${actionType}`, { label, minLength: message.params.minLength });
        case "maxLength":
          return t(`maxArrLength_${actionType}`, { label, maxLength: message.params.maxLength });
        default:
          return "";
      }
    case "obj":
      switch (message.code) {
        case "required":
          return t(`required_${actionType}`, { label });
        default:
          return "";
      }
    case "i18n":
      return t(message.key, {
        label,
        ...message.params,
      } as I18nReplaceParams<typeof message.key>);
    default:
      return message.message || "";
  }
}

export const DEFAULT_LOCALE = "ja" as const;

export const SUPPORTED_LOCALES = [
  DEFAULT_LOCALE,
  "en",
] as const;

export const LOCALE_KEY = "lang";

export const I18N_PROP_NAME = "__i18n__";

export const I18N_PATHNAME = "/public/locales";

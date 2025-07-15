type Locales = typeof import("./config").SUPPORTED_LOCALES[number];

interface I18N_Texts { };

type I18nTextKey = keyof I18N_Texts;

type I18nResource = Partial<Record<I18nTextKey, string>>;

type I18nReplaceValue = string | number | boolean | null | undefined;

type I18nReplaceParams<K extends I18nTextKey> =
  I18N_Texts[K] extends null ? undefined :
  Record<I18N_Texts[K], I18nReplaceValue>;

interface I18nGetter {
  <K extends I18nTextKey>(key: K, params?: I18nReplaceParams<K>): string;
  locale: Locales;
};

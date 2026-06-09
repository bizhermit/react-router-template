import { createContext, use, useMemo } from "react";
import { DEFAULT_LOCALE } from "../i18n/consts";

/** i18nコンテキスト Props */
interface I18nContextProps {
  /** ロケール */
  locale: Locales;
  /** アクセサー */
  t: I18nGetter;
  /**
   * ロケール切り替え
   * @param locale {@link Locales}
   * @returns
   */
  switch: (locale: Locales) => Promise<boolean>;
  append: (langs: I18nAddonResources) => void;
};

/** i18nアクセサー */
const DUMMY_TEXT_GETTER: I18nGetter = (k) => k;
DUMMY_TEXT_GETTER.locale = DEFAULT_LOCALE;

/** i18nコンテキスト */
export const I18nContext = createContext<I18nContextProps>({
  locale: DEFAULT_LOCALE,
  t: DUMMY_TEXT_GETTER,
  switch: async () => false,
  append: () => { },
});

/**
 * i18nフック
 * @returns
 */
export function useText() {
  return use(I18nContext).t;
};

/** ロケール切り替えオプション */
export interface SwitchLocaleOptions {
  /** 切り替え時に画面をリフレッシュしない @default false */
  preventRefresh?: boolean;
};

/** i18n */
interface I18nLangContextProps {
  locale: Locales;
  switch: (locale: Locales, options?: SwitchLocaleOptions) => Promise<void>;
};

/** ロケールコンテキスト（言語リソースは保持しない） */
export const I18nLangContext = createContext<I18nLangContextProps>({
  locale: DEFAULT_LOCALE,
  switch: async () => { },
});

/**
 * ロケールフック
 * @returns
 */
export function useLocale() {
  const i18n = use(I18nLangContext);
  return {
    lang: i18n.locale,
    switch: i18n.switch,
  } as const;
};

/**
 * 言語リソースを追加する
 * @param addonLangs
 */
export function useAddonLangs(addonLangs: I18nAddonResources) {
  const ctx = use(I18nContext);
  useMemo(() => {
    ctx.append(addonLangs);
  }, []);
};

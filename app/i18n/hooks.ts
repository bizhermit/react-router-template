import { createContext, use } from "react";
import { DEFAULT_LOCALE } from "./config";

type I18nContextProps = {
  locale: Locales;
  t: I18nGetter;
  switch: (locale: Locales) => Promise<boolean>;
};

export const I18nContext = createContext<I18nContextProps>({
  locale: DEFAULT_LOCALE,
  t: (k) => k,
  switch: async () => false,
});

export function useText() {
  const i18n = use(I18nContext);
  return (key: I18nTextKey, params?: I18nReplaceParams) => i18n.t(key, params);
};

type I18nLangContextProps = {
  locale: Locales;
  switch: (locale: Locales, options?: { refresh?: boolean; }) => Promise<void>;
};

export const I18nLangContext = createContext<I18nLangContextProps>({
  locale: DEFAULT_LOCALE,
  switch: async () => { },
});

export function useLocale() {
  const i18n = use(I18nLangContext);
  return {
    lang: i18n.locale,
    switch: i18n.switch,
  } as const;
};
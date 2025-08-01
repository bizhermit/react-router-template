import { createContext, use } from "react";
import { DEFAULT_LOCALE } from "../../../i18n/config";

interface I18nContextProps {
  locale: Locales;
  t: I18nGetter;
  switch: (locale: Locales) => Promise<boolean>;
};

const DUMMY_TEXT_GETTER: I18nGetter = (k) => k;
DUMMY_TEXT_GETTER.locale = DEFAULT_LOCALE;

export const I18nContext = createContext<I18nContextProps>({
  locale: DEFAULT_LOCALE,
  t: DUMMY_TEXT_GETTER,
  switch: async () => false,
});

export function useText() {
  return use(I18nContext).t;
};

export interface SwitchLocaleOptions {
  preventRefresh?: boolean;
};

interface I18nLangContextProps {
  locale: Locales;
  switch: (locale: Locales, options?: SwitchLocaleOptions) => Promise<void>;
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

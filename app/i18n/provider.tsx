import { use, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate, useRevalidator } from "react-router";
import { DEFAULT_LOCALE, LOCALE_KEY } from "./config";
import { I18nContext, I18nLangContext, type SwitchLocaleOptions } from "./hooks";

export function I18nProvider(props: {
  locale: Locales;
  resource: I18nResource;
  children?: ReactNode;
}) {
  const [locale, setLocale] = useState(props.locale);
  const switchRef = useRef(locale);
  const resourceRef = useRef(props.resource);

  function t<K extends I18nTextKey>(key: K, params?: I18nReplaceParams<K>) {
    if (!key) return key;
    let text = resourceRef.current[key];
    if (text == null) return key;
    if (params) {
      Object.keys(params).forEach(k => {
        const v = (params as Record<string, I18nReplaceValue>)[k];
        if (v == null) return;
        text = text!.replace(new RegExp(`{{${k}}}`, "g"), String(v));
      });
    }
    return text;
  };
  (t as I18nGetter).locale = locale;

  async function switchLocale(locale: Locales) {
    switchRef.current = locale;
    const res = await fetch(`/locales/${locale}.json`);
    if (!res.ok) return false;
    if (switchRef.current !== locale) return false;
    const resource = await res.json();
    setLocale(locale);
    resourceRef.current = resource;
    return true;
  };

  return (
    <I18nContext.Provider
      value={{
        t: t as I18nGetter,
        locale,
        switch: switchLocale,
      }}
    >
      {props.children}
    </I18nContext.Provider>
  );
};

export function I18nUrlLocator(props: {
  children: ReactNode;
}) {
  const i18n = use(I18nContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isSwitching, setSwitch] = useState(false);

  const isIndex = location.pathname === "/";
  const currentLocale = (location.pathname.match(/^\/([^/]+)/)?.[1]?.toLowerCase() as Locales | undefined) || DEFAULT_LOCALE;
  const needRefresh = !isSwitching && !isIndex && i18n.locale !== currentLocale;

  async function switchLocale(locale: Locales, options?: SwitchLocaleOptions) {
    const pathname = window.location.pathname.replace(/^\/([^/]+)/, `/${locale}`);
    if (!options?.preventRefresh) {
      await navigate(
        `${pathname}${location.search}`,
        {
          replace: true,
          preventScrollReset: false,
        }
      );
    } else {
      if (await i18n.switch(locale)) {
        window.history.replaceState(window.history.state, "", `${pathname}${location.search}`);
      }
    }
  };

  useEffect(() => {
    if (!needRefresh) return;
    setSwitch(true);
    i18n.switch(currentLocale).finally(() => setSwitch(false));
  }, [needRefresh]);

  return (
    <>
      {(isSwitching || needRefresh) && <div className="loading-bar" />}
      <I18nLangContext
        value={{
          locale: currentLocale || i18n.locale,
          switch: switchLocale,
        }}
      >
        {props.children}
      </I18nLangContext>
    </>
  );
};

const cookieOption = `SameSite=Lax;Path=/${import.meta.env.DEV ? "" : ";Secure"}`;

export function I18nCookieLocator(props: {
  children: ReactNode;
}) {
  const i18n = use(I18nContext);
  const { revalidate } = useRevalidator();
  const [isSwitching, setSwitch] = useState(false);

  async function switchLocale(locale: Locales, options?: SwitchLocaleOptions) {
    setSwitch(true);
    document.cookie = `${LOCALE_KEY}=${encodeURIComponent(locale)};${cookieOption}`;
    if (await i18n.switch(locale)) {
      if (!options?.preventRefresh) await revalidate();
    }
    setSwitch(false);
  };

  return (
    <>
      {isSwitching && <div className="loading-bar" />}
      <I18nLangContext
        value={{
          locale: i18n.locale,
          switch: switchLocale,
        }}
      >
        {props.children}
      </I18nLangContext>
    </>
  );
};

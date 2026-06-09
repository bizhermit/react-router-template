import { use, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate, useRevalidator } from "react-router";
import { LoadingBar } from "../../components/elements/loading";
import { I18nContext, I18nLangContext, type SwitchLocaleOptions } from "../hooks/i18n";
import { DEFAULT_LOCALE, LOCALE_KEY } from "../i18n/consts";

function appendAddonResource(
  currentResource: I18nResource,
  addon: string,
  addonResource: I18nResource
) {
  Object.entries(addonResource).forEach(([key, text]) => {
    currentResource[`${addon}.${key}`] = text;
  });
};

export function I18nProvider(props: {
  locale: Locales;
  resource: I18nResource;
  children?: ReactNode;
}) {
  const [locale, setLocale] = useState(props.locale);
  const switchRef = useRef(locale);
  const resourceRef = useRef(props.resource);
  const addonsRef = useRef<Set<string>>(new Set());

  function t<K extends I18nTextKey>(key: K, params?: I18nReplaceParams<K>) {
    if (!key) return key;
    let text = resourceRef.current[key];
    if (text == null) return key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v == null) return;
        text = text!.replace(new RegExp(`{{${k}}}`, "g"), String(v));
      });
    }
    return text;
  };
  (t as I18nGetter).locale = locale;

  async function switchLocale(locale: Locales) {
    let newResource: I18nResource = {};
    switchRef.current = locale;
    try {
      await Promise.all([
        (async () => {
          const res = await fetch(`/locales/${locale}.json`);
          if (!res.ok) {
            console.warn(`not found lang file: ${locale}.json`);
            return;
          }
          const json = await res.json();
          newResource = {
            ...newResource,
            ...json,
          };
        })(),
        ...(Array.from(addonsRef.current).map(addon => {
          return (async () => {
            const res = await fetch(`/locales/${locale}.${addon}.json`);
            if (!res.ok) {
              console.warn(`not found lang file: ${locale}.${addon}.json`);
              return;
            }
            const json = await res.json();
            appendAddonResource(
              newResource,
              addon,
              json,
            );
          })();
        })),
      ]);
    } catch {
      return false;
    }
    if (switchRef.current !== locale) return false;
    setLocale(locale);
    resourceRef.current = newResource;
    return true;
  };

  function appendLangs(addonLangs: I18nAddonResources) {
    Object.entries(addonLangs).forEach(([addon, resource]) => {
      if (addonsRef.current.has(addon)) return;
      addonsRef.current.add(addon);
      appendAddonResource(
        resourceRef.current,
        addon,
        resource
      );
    });
  };

  return (
    <I18nContext
      value={{
        t: t as I18nGetter,
        locale,
        switch: switchLocale,
        append: appendLangs,
      }}
    >
      {props.children}
    </I18nContext>
  );
};

export function I18nUrlLocator(props: {
  children: ReactNode;
}) {
  const i18n = use(I18nContext);
  const location = useLocation();
  const navigate = useNavigate();

  const isIndex = location.pathname === "/";
  const currentLocale = (location.pathname.match(/^\/([^/]+)/)?.[1]?.toLowerCase() as Locales | undefined) || DEFAULT_LOCALE;
  const needRefresh = !isIndex && i18n.locale !== currentLocale;

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
    if (isIndex) return;
    if (i18n.locale === currentLocale) return;
    i18n.switch(currentLocale);
  }, [needRefresh]);

  return (
    <>
      {needRefresh && <LoadingBar />}
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
  const { revalidate, state } = useRevalidator();
  const [isSwitching, setSwitch] = useState(false);

  async function switchLocale(locale: Locales, options?: SwitchLocaleOptions) {
    setSwitch(true);
    document.cookie = `${LOCALE_KEY}=${encodeURIComponent(locale)};${cookieOption}`;
    if (await i18n.switch(locale)) {
      if (!options?.preventRefresh) {
        await revalidate();
      }
    }
    setSwitch(false);
  };

  return (
    <>
      {(isSwitching || state === "loading") && <LoadingBar />}
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

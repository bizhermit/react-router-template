import { use, useLayoutEffect, useState } from "react";
import { I18nContext } from "../../hooks/i18n";
import { getValidationValue } from "./common";

export function getBooleanSource({
  dataItem,
  t,
}: {
  dataItem: Schema.DataItem<Schema.$Boolean>;
  t: I18nGetter;
}) {
  let trueText = "", falseText = "";
  if (dataItem._.trueText) trueText = t(dataItem._.trueText as I18nTextKey) || "";
  if (!trueText) trueText = String(dataItem._.trueValue);
  if (dataItem._.falseText) falseText = t(dataItem._.falseText as I18nTextKey) || "";
  if (!falseText) falseText = String(dataItem._.falseValue);
  return [
    { value: dataItem._.trueValue, text: trueText },
    { value: dataItem._.falseValue, text: falseText },
  ] satisfies Schema.Source<Schema.ValueType<typeof dataItem["_"]>>;
};

export function useSource<D extends Schema.DataItem>({
  dataItem,
  propsSource,
  getCommonParams,
}: {
  dataItem: D;
  propsSource: Schema.Source<Schema.ValueType<D["_"]>> | undefined;
  getCommonParams: () => Schema.DynamicValidationValueParams;
  env: Schema.Env;
}) {
  type T = Schema.Source<Schema.ValueType<D["_"], true, false>>;
  const { t, locale } = use(I18nContext);

  function getSource() {
    if (propsSource) return propsSource;
    if ("source" in dataItem._) {
      return getParsedDataItemSource();
    }
    if (dataItem._.type === "bool") {
      return getBooleanSource({
        dataItem: dataItem as Schema.DataItem<Schema.$Boolean>,
        t: t,
      }) as T;
    }
    return null;
  }

  const [source, setSource] = useState<null | T>(() => {
    return getSource();
  });

  function getParsedDataItemSource() {
    if ("source" in dataItem._) {
      return (getValidationValue(getCommonParams(), dataItem._.source) as T)?.map(item => {
        return {
          value: item.value,
          text: t(item.text as I18nTextKey) || "",
          node: item.node,
        };
      });
    }
    return null;
  }

  function resetDataItemSource() {
    setSource(getSource());
  };

  useLayoutEffect(() => {
    resetDataItemSource();
  }, [propsSource, locale]);

  return {
    source,
    setSource,
    resetDataItemSource,
  } as const;
};

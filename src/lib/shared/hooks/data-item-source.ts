import { use, useMemo, useState } from "react";
import { getValidationValue } from "../schema/utilities";
import { I18nContext } from "./i18n";

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
  const [revision, setRevision] = useState(0);

  const source = useMemo<null | T>(() => {
    if (propsSource) return propsSource;

    if ("source" in dataItem._) {
      return (getValidationValue(getCommonParams(), dataItem._.source) as T)?.map(item => ({
        value: item.value,
        text: t(item.text as I18nTextKey) || "",
        node: item.node,
      }));
    }

    if (dataItem._.type === "bool") {
      return getBooleanSource({
        dataItem: dataItem as Schema.DataItem<Schema.$Boolean>,
        t,
      }) as T;
    }

    return null;
  }, [
    propsSource,
    dataItem,
    getCommonParams,
    t,
    locale,
    revision,
  ]);

  function resetDataItemSource() {
    setRevision(c => c + 1);
  };

  return {
    source,
    resetDataItemSource,
  } as const;
};

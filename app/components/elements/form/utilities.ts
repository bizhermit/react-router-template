import { useLayoutEffect, useState } from "react";
import { getValidationValue } from "./common";

export function getBooleanSource({
  dataItem,
  t,
}: {
  dataItem: Schema.DataItem<Schema.$Boolean>;
  t: Schema.Env["t"];
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
  env,
}: {
  dataItem: D;
  propsSource: Schema.Source<Schema.ValueType<D["_"]>> | undefined;
  getCommonParams: () => Schema.DynamicValidationValueParams;
  env: Schema.Env;
}) {
  type T = Schema.Source<Schema.ValueType<D["_"], true, false>>;

  const [source, setSource] = useState<null | T>(() => {
    if (propsSource) return propsSource;
    if ("source" in dataItem._) {
      return (getValidationValue(getCommonParams(), dataItem._.source) as T) || null;
    }
    if (dataItem._.type === "bool") {
      return getBooleanSource({
        dataItem: dataItem as Schema.DataItem<Schema.$Boolean>,
        t: env.t,
      }) as T;
    }
    return null;
  });

  function resetDataItemSource() {
    if (propsSource !== null && "source" in dataItem._) {
      setSource((getValidationValue(getCommonParams(), dataItem._.source) as T) || null);
    }
  };

  useLayoutEffect(() => {
    if (propsSource) {
      setSource(propsSource);
    }
  }, [propsSource]);

  return {
    source,
    setSource,
    resetDataItemSource,
  } as const;
};

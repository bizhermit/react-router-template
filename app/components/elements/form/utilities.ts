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

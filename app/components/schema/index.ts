import { SchemaData } from "./data";

export function $schema<SchemaProps extends Record<string, Schema.$Any>>(props: SchemaProps) {
  return props;
};

export function parseWithSchema<$Schema extends Record<string, Schema.$Any>>(params: {
  schema: $Schema;
  data: Record<string, unknown> | FormData | null | undefined;
  dep?: Record<string, unknown>;
  env: Schema.Env;
  createDataItems?: boolean;
}) {
  const data = new SchemaData(params.data, () => { });
  const dep = params.dep ?? {};
  const validations: (() => void)[] = [];
  const results: Record<string, Schema.Result> = {};
  const dataItems: Record<string, Schema.DataItem> = {};

  function parseItem({ item, name, parent }: {
    item: Schema.$Any;
    name: string | number;
    parent: Schema.DataItem<Schema.$Struct | Schema.$Array> | undefined;
  }) {
    const fullName = name == null ?
      undefined :
      parent?._?.type === "struct" ?
        `${parent.name}.${name}` :
        parent?._?.type === "arr" ?
          `${parent.name}[${name}]` :
          `${name}`;

    let val: unknown = undefined;
    const label = item.label ? params.env.t(item.label as I18nTextKey) : undefined;

    const dataItem: Schema.DataItem = (() => {
      switch (item.type) {
        case "date":
        case "month":
        case "datetime": {
          const splitKey = Object.keys(item._splits)[0] as Schema.SplitDateTarget | undefined;
          if (splitKey) {
            const di = item._splits[splitKey]!.core;
            di.name = fullName!;
            di.parent = parent;
            return di;
          }
        }
        // eslint-disable-next-line no-fallthrough
        default:
          return {
            name: fullName!,
            label,
            parent,
            _: item,
          };
      }
    })();

    switch (item.type) {
      case "date":
      case "month":
      case "datetime": {
        type DateDataItemType = Schema.DataItem<Schema.$DateTime>;
        (dataItem as DateDataItemType).splits = {};
        for (const k in (item as Schema.$DateTime).splits) {
          (item as Schema.$DateTime).splits[k as Schema.SplitDateTarget]!._core =
            dataItem as DateDataItemType;
        }
        for (const k in item._splits) {
          const splitDateDataItem = item._splits[k as Schema.SplitDateTarget]!;
          splitDateDataItem.core = dataItem as DateDataItemType;
          (dataItem as DateDataItemType).splits[k as Schema.SplitDateTarget] = splitDateDataItem;
        }
        break;
      }
      case "sdate-Y":
      case "sdate-M":
      case "sdate-D":
      case "sdate-h":
      case "sdate-m":
      case "sdate-s": {
        let dateDataItem = item._core as Schema.DataItem<Schema.$DateTime> | undefined;
        if (dateDataItem == null) {
          dateDataItem = parseItem({
            item: item.core,
            name: null!,
            parent,
          }) as Schema.DataItem<Schema.$DateTime>;
          for (const k in item.core.splits) {
            const splitDateProps =
              (item.core as Schema.$DateTime).splits[k as Schema.SplitDateTarget];
            splitDateProps!._core = dateDataItem;
          }
        }
        const target = item.type.replace("sdate-", "") as Schema.SplitDateTarget;
        dateDataItem.splits[target] = dataItem as Schema.DataItem<Schema.$SplitDate>;
        (dataItem as Schema.DataItem<Schema.$SplitDate>).core = dateDataItem;
        break;
      }
      default:
        break;
    };

    if (fullName) {
      val = data._get(fullName)[0];

      let result: Schema.Result | null | undefined = undefined;

      const parsed = item.parser({
        value: val,
        dep,
        env: params.env,
        label,
      });
      result = parsed.result;

      if (val !== parsed.value) {
        data._set(fullName, val = parsed.value);
      }

      if (result?.type !== "e") {
        validations?.push(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const validationParams: Schema.ValidationParams<any> = {
            name: fullName,
            label,
            data,
            dep,
            env: params.env,
            value: val,
            getSource: () => {
              if ("source" in item) {
                const source = item.source;
                if (typeof source === "function") {
                  return source({
                    data,
                    dep,
                    env: params.env,
                    label,
                    name: fullName,
                  });
                }
                return source;
              }
              return undefined;
            },
          };
          let r: Schema.Result | undefined | null = undefined;
          for (const vali of item.validators) {
            r = vali(validationParams);
            if (r) break;
          }
          if (r) results[fullName] = r;
        });
      }
    }

    if (!params.createDataItems && val == null) return null!;

    switch (item.type) {
      case "arr":
        (dataItem as Schema.DataItem<Schema.$Array>).generateDataItem = function (index) {
          return parseItem({
            item: item.prop,
            name: index,
            parent: dataItem as Schema.DataItem<Schema.$Array>,
          });
        };
        if (val && Array.isArray(val)) {
          val.forEach((_, index) => {
            (dataItem as Schema.DataItem<Schema.$Array>).generateDataItem(index);
          });
        }
        break;
      case "struct":
        (dataItem as Schema.DataItem<Schema.$Struct>).dataItems = {};
        parseStruct({
          struct: item.props,
          parent: dataItem as Schema.DataItem<Schema.$Struct>,
        });
        break;
      default:
        break;
    }

    return dataItem;
  };

  function parseStruct(p: {
    struct: Record<string, Schema.$Any>;
    parent: Schema.DataItem<Schema.$Struct>;
  }) {
    for (const name in p.struct) {
      p.parent.dataItems[name] = parseItem({
        item: p.struct[name],
        name,
        parent: p.parent,
      });
    }
  };

  parseStruct({
    struct: params.schema,
    parent: {
      name: null!,
      label: null!,
      _: null!,
      dataItems,
    },
  });

  validations.forEach(f => f());

  return {
    data: data.getData(),
    hasError: Object.keys(results).some(k => results[k].type === "e"),
    results,
    dataItems: params.createDataItems ? dataItems : undefined,
  } as ({
    hasError: true;
    data: Schema.SchemaValue<$Schema, true>;
    results: Record<string, Schema.Result>;
    dataItems: Schema.DataItems<$Schema>;
  } | {
    hasError: false;
    data: Schema.SchemaValue<$Schema>;
    results: Record<string, Schema.Result>;
    dataItems: Schema.DataItems<$Schema>;
  });
};

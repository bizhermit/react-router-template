import { SchemaData } from "./data";

export function $schema<SchemaProps extends Record<string, any>>(props: SchemaProps) {
  return props;
};

export function parseWithSchema<$Schema extends Record<string, any>>(params: {
  schema: $Schema;
  data: Record<string, any> | null | undefined;
  dep?: Record<string, any>;
  env: Schema.Env;
  createDataItems?: boolean;
}) {
  const data = new SchemaData(params.data, () => { });
  const dep = params.dep ?? {};
  const validations: (() => void)[] = [];
  const results: Record<string, Schema.Result> = {};
  const dataItems: Record<string, Schema.DataItem<Schema.$Any>> = {};

  function parseItem({ item, name, parent }: {
    item: Schema.$Any;
    name: string | number;
    parent: Schema.DataItem<Schema.$Struct | Schema.$Array> | undefined;
  }) {
    const fn = parent?._?.type === "struct" ? `${parent.name}.${name}` :
      parent?._?.type === "arr" ? `${parent.name}[${name}]` :
        `${name}`;

    let [val] = data._get(fn);

    const label = item.label ? params.env.t(item.label) : "";

    let result: Schema.Result | null | undefined = undefined;

    const parsed = item.parser({
      value: val,
      dep,
      env: params.env,
    });
    result = parsed.result;

    if (val !== parsed.value) {
      data._set(fn, val = parsed.value);
    }

    if (result?.type !== "e") {
      validations?.push(() => {
        const validationParams: Schema.ValidationParams<any> = {
          data,
          dep,
          env: params.env,
          label,
          value: val,
        };
        let r: Schema.Result | undefined | null = undefined;
        for (const vali of item.validators) {
          r = vali(validationParams);
          if (r) break;
        }
        if (r) results[fn] = r;
      });
    }

    if (!params.createDataItems && val == null) return null!;
    
    const dataItem: Schema.DataItem<any> = {
      name: fn,
      label,
      _: item,
    };

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
    };

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
    dataItems,
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

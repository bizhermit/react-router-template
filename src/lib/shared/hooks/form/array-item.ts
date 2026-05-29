/* eslint-disable @typescript-eslint/no-explicit-any */
import { use, useState, useSyncExternalStore } from "react";
import type { $ArrSchema } from "../../schema/array";
import type { SchemaItem } from "../../schema/core";
import { convertToFormItems, FormItem } from "../../schema/form";
import { $ObjSchema } from "../../schema/object";
import { FormContext } from "./context";

type ArgFormParams<S extends $ArrSchema<SchemaItem<any>, any>> =
  Schema.InferArrayChild<S> extends $ObjSchema<any, any> ? {
    formItems: Schema.ObjectFormItems<Schema.InferArrayChild<S>>;
    formItem: never;
  } : {
    formItem: FormItem<Schema.InferArrayChild<S>>;
    formItems: never;
  };

/**
 * 配列フォーム項目を操作・購読するためのカスタムフック。
 *
 * 対象配列の値変更を `useSyncExternalStore` で監視し、最新の配列値と
 * 要素操作用のユーティリティを返す。配列要素がオブジェクトスキーマの場合は
 * `formItems`、それ以外の場合は `formItem` を `map` のコールバック引数として提供する。
 *
 * @typeParam S - 配列フォーム項目のスキーマ型
 * @param arrayFormItem - 操作対象の配列フォーム項目
 * @returns 配列値と操作関数API
 */
export function useFormArrayItem<const S extends $ArrSchema<any, any>>(arrayFormItem: FormItem<S>) {
  const { manager } = use(FormContext);
  const [revision, setRevision] = useState(0);

  function getValue() {
    return manager.getValue<Schema.Nullable<Schema.InferValue<S>>>(arrayFormItem.getName());
  };

  const value = useSyncExternalStore(
    (callback) => {
      const cleanup = manager.addValuesSubscribe(arrayFormItem.getName(), () => {
        setRevision(c => c + 1);
        callback();
      });
      return () => cleanup();
    },
    getValue,
    getValue
  );

  const [getChildFormItem] = useState(() => {
    const child = arrayFormItem.getSchemaItem().getChild();
    const name = arrayFormItem.getName();

    if (child instanceof $ObjSchema) {
      return function (index: number) {
        return {
          formItems: convertToFormItems(
            manager,
            child.getChildren(),
            `${name}[${index}]`,
          ),
        } as ArgFormParams<S>;
      };
    }

    return function (index: number) {
      return {
        formItem: new FormItem(
          manager,
          `${name}[${index}]`,
          child as SchemaItem,
        ),
      } as ArgFormParams<S>;
    };
  });

  function remove(index?: number) {
    const v = arrayFormItem.getValue();
    if (v == null) return;
    if (index == null) {
      arrayFormItem.setValue([]);
      return;
    }
    const nv = [...v];
    nv.splice(index, 1);
    arrayFormItem.setValue(nv);
  };

  function push(value: Schema.InferValue<Schema.InferArrayChild<S>>) {
    const v = [...arrayFormItem.getValue() ?? [], value];
    arrayFormItem.setValue(v);
  };

  function insert(index: number, value: Schema.InferValue<Schema.InferArrayChild<S>>) {
    const v = [...arrayFormItem.getValue() ?? []] as any[];
    v.splice(index, 0, value);
    arrayFormItem.setValue(v);
  }

  function map<T>(callback: (params: {
    key: string;
    index: number;
    name: string;
    value: Schema.InferValue<Schema.InferArrayChild<S>>;
    remove: () => void;
  } & ArgFormParams<S>) => T) {
    return value?.map((val, index) => {
      return callback({
        key: `${revision}-${index}`,
        index,
        name: `${arrayFormItem.getName()}[${index}]`,
        value: val,
        remove: () => remove(index),
        ...getChildFormItem(index),
      });
    });
  };

  return {
    value,
    revision,
    map,
    remove,
    push,
    insert,
  } as const;
};

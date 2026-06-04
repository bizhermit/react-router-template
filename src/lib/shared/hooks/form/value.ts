/* eslint-disable @typescript-eslint/no-explicit-any */
import { use, useCallback, useSyncExternalStore } from "react";
import type { SchemaItem } from "../../schema/core";
import type { FormItem } from "../../schema/form";
import { FormContext } from "./context";

/**
 * フォーム項目の現在値を購読して返すカスタムフック。
 *
 * FormContext からフォームマネージャーを取得し、指定した項目名に紐づく値変更を
 * `useSyncExternalStore` で監視する。値が更新されるたびに再レンダリングされ、
 * 常に最新の値を参照できる。
 *
 * @typeParam S - フォーム項目に対応するスキーマ型
 * @param formItem - 値を購読する対象のフォーム項目
 * @returns 指定したフォーム項目の現在値（nullable を含む）
 */
export function useFormValue<S extends SchemaItem<any>>(formItem: FormItem<S>) {
  const { manager } = use(FormContext);

  const valueSubscribe = useCallback((callback: () => void) => {
    const cleanup = manager.addValuesSubscribe(formItem.getName(), callback);
    return () => cleanup();
  }, [
    manager,
    formItem,
  ]);

  function getValue() {
    return manager.getValue<Schema.Nullable<Schema.InferValue<S>>>(formItem.getName());
  };

  const value = useSyncExternalStore(
    valueSubscribe,
    getValue,
    getValue
  );

  return value;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { use, useSyncExternalStore } from "react";
import type { FormItem } from "../../schema/form";
import { FormContext } from "./context";

/**
 * 指定したフォーム項目のメッセージを購読して返すカスタムフック。
 *
 * FormContext からフォームマネージャーを取得し、対象項目のメッセージ変更を
 * `useSyncExternalStore` で監視する。メッセージが更新されるたびに再レンダリングされ、
 * 常に最新のメッセージを参照できる。
 *
 * @param formItem - メッセージを購読する対象のフォーム項目
 * @returns 指定したフォーム項目に紐づく現在のメッセージ
 */
export function useFormMessage(formItem: FormItem<any>) {
  const { manager } = use(FormContext);

  function getMessage() {
    return manager.getMessage(formItem.getName());
  };

  const message = useSyncExternalStore(
    (callback) => {
      const cleanup = manager.addMessageSubscribe(formItem.getName(), callback);
      return () => cleanup();
    },
    getMessage,
    getMessage
  );

  return message;
};

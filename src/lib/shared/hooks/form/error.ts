import { use, useSyncExternalStore } from "react";
import { FormContext } from "./context";

/**
 * フォーム全体のエラー有無を購読して返すカスタムフック。
 *
 * FormContext からフォームマネージャーを取得し、エラー状態の変更を
 * `useSyncExternalStore` で監視する。エラー状態が変化した際に再レンダリングされ、
 * 常に最新のエラー有無を参照できる。
 *
 * @returns フォームに1件以上のエラーが存在する場合は `true`
 */
export function useFormHasError() {
  const { manager } = use(FormContext);

  function getHasError() {
    return manager.hasError();
  };

  const hasError = useSyncExternalStore(
    (callback) => {
      const cleanup = manager.addErrorSubscribe(callback);
      return () => cleanup();
    },
    getHasError,
    getHasError
  );

  return hasError;
};

import { use, useCallback, useSyncExternalStore } from "react";
import { FormContext } from "./context";

/**
 * フォーム全体の dirty 状態を購読して返すカスタムフック。
 *
 * FormContext のフォームマネージャーが持つ dirty 状態を
 * `useSyncExternalStore` で監視し、状態変化に追従した真偽値を返す。
 *
 * @returns フォームに未保存変更がある場合は `true`
 */
export function useFormDirty() {
  const { manager } = use(FormContext);

  const dirtySubscribe = useCallback((callback: () => void) => {
    const cleanup = manager.addDirtySubscribe(callback);
    return () => cleanup();
  }, [manager]);

  function getIsDirty() {
    return manager.isDirty();
  };

  const isDirty = useSyncExternalStore(
    dirtySubscribe,
    getIsDirty,
    getIsDirty
  );

  return isDirty;
};

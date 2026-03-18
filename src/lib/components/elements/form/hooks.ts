import { useRef } from "react";

/**
 * 入力要素フック（外部から操作する用）
 * @returns
 */
export function useFormItem<T extends InputRef = InputRef>() {
  return useRef<T>(null);
};

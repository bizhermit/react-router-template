import { useRef } from "react";

export function useFormItem<T extends InputRef = InputRef>() {
  return useRef<T>(null);
};

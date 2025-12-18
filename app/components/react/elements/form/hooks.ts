import { useRef } from "react";
import type { InputRef } from "./common";

export interface FormItemHookProps {
  focus: () => void;
};

export function useFormItem<T extends InputRef = InputRef>() {
  return useRef<T>(null);
};

import { useRef } from "react";
import type { InputRef } from "./common";

export interface FormItemHookProps {
  focus: () => void;
};

export function useFormItem<T extends InputRef<HTMLElement> = InputRef<HTMLElement>>() {
  return useRef<T>(null);
};

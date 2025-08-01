import { useMemo } from "react";

export interface FormItemHookProps {
  focus: () => void;
};

export function useFormItem() {
  return useMemo<FormItemHookProps>(() => {
    return {} as unknown as FormItemHookProps;
  }, []);
};

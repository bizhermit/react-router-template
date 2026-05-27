import { createContext } from "react";

interface FieldSetContextProps {
  disabled: boolean;
  readOnly: boolean;
};

export const FieldSetContext = createContext<FieldSetContextProps>({
  disabled: false,
  readOnly: false,
});

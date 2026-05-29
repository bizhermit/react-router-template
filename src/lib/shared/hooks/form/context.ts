/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext } from "react";
import { FormManager } from "../../schema/form";
import { $ObjSchema } from "../../schema/object";

export type FormState = "idle" | "loading" | "submitting";

export type FormContextProps<S extends $ObjSchema<any, any> = $ObjSchema<any, any>> = {
  id: string;
  state: FormState;
  manager: FormManager<S>;
  items: Schema.ObjectFormItems<S>;
  getValues: FormManager<S>["getValues"];
  getValue: FormManager<S>["getValue"];
  setValue: FormManager<S>["setValue"];
};

export const FormContext = createContext<FormContextProps>({
  id: null!,
  state: "loading",
  manager: null!,
  items: null!,
  getValues: null!,
  getValue: null!,
  setValue: null!,
});

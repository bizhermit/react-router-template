import type { ReactNode } from "react";
import { FormContext, type FormState } from "../hooks/form/context";
import type { FormManager } from "../schema/form";
import { FieldSetContext } from "./field-set";

export type SchemaProviderProps = {
  readOnly?: boolean;
  disabled?: boolean;
  formId: string;
  formState: FormState;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formManager: FormManager<any>;
};

export function SchemaProvider(props: SchemaProviderProps & { children?: ReactNode; }) {
  return (
    <FieldSetContext
      value={{
        readOnly: props.readOnly ?? false,
        disabled: props.disabled ?? false,
      }}
    >
      <FormContext
        value={{
          id: props.formId,
          manager: props.formManager,
          state: props.formState,
          getValue: props.formManager.getValue,
          setValue: props.formManager.setValue,
          getValues: props.formManager.getValues,
          items: props.formManager.getFormItems(),
        }}
      >
        {props.children}
      </FormContext>
    </FieldSetContext>
  );
};

import type { ReactNode } from "react";
import { SchemaProviderContext, type FormState } from "../hooks/$schema";
import { FieldSetContext } from "../hooks/schema";
import type { FormContext } from "../schema/$/form";

export type SchemaProviderProps = {
  readOnly?: boolean;
  disabled?: boolean;
  formId: string;
  formState: FormState;
  formContext: FormContext<any>;
};

export function SchemaProvider(props: SchemaProviderProps & { children?: ReactNode; }) {
  return (
    <FieldSetContext
      value={{
        readOnly: props.readOnly ?? false,
        disabled: props.disabled ?? false,
      }}
    >
      <SchemaProviderContext
        value={{
          id: props.formId,
          context: props.formContext,
          formState: props.formState,
        }}
      >
        {props.children}
      </SchemaProviderContext>
    </FieldSetContext>
  );
};

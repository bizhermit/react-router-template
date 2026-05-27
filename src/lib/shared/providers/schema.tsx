import type { ReactNode } from "react";
import { SchemaProviderContext, type FormState } from "../hooks/schema";
import type { FormContext } from "../schema/form";
import { FieldSetContext } from "./field-set";

export type SchemaProviderProps = {
  readOnly?: boolean;
  disabled?: boolean;
  formId: string;
  formState: FormState;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

import { createContext, useCallback, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { FormContext } from "../schema/$/form";
import type { $ObjSchema } from "../schema/$/object";

type SchemaHookProps<S extends $ObjSchema<any, any>> = {
  id?: string;
  schema: S;
  values?: Record<string, unknown>;
  messages?: $Schema.Message[];
};

export type SchemaProviderContextProps<S extends $ObjSchema<any, any> = $ObjSchema<any, any>> = {
  context: FormContext<S>;
};

export const SchemaProviderContext = createContext<SchemaProviderContextProps>({
  context: null!,
});

export function useSchema<const S extends $ObjSchema<any, any>>(props: SchemaHookProps<S>) {
  const formContext = useMemo(() => {
    return new FormContext({
      values: props.values ?? {},
      data: {},
      schema: props.schema,
    });
  }, [
    props.values,
    props.schema,
  ]);

  const hasError = useSyncExternalStore((callback) => {
    const cleanup = formContext.addErrorSubscribe(callback);
    return () => cleanup();
  }, () => {
    return formContext.hasError();
  }, () => {
    return formContext.hasError();
  });

  const message = useSyncExternalStore((callback) => {
    const cleanup = formContext.addMessageSubscribe("str2", callback);
    return () => cleanup();
  }, () => {
    return formContext.getMessage("str2");
  }, () => {
    return formContext.getMessage("str2");
  });

  console.log("render: ", message);

  const SchemaProvider = useCallback((p: {
    disabled?: boolean;
    readOnly?: boolean;
    children?: ReactNode;
  }) => {
    return (
      <SchemaProviderContext
        value={{
          context: formContext,
        }}
      >
        {p.children}
      </SchemaProviderContext>
    );
  }, [
    formContext,
  ]);

  return {
    SchemaProvider,
    hasError,
  } as const;
};

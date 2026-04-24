import { createContext, useCallback, type ReactNode } from "react";
import type { $ObjSchema } from "../schema/$/object";

type SchemaHookProps<S extends $ObjSchema<any, any>> = {
  id?: string;
  schema: S;
  values?: Record<string, unknown>;
  messages?: $Schema.Message[];
};

type SchemaProviderContextProps = {

};

const SchemaProviderContext = createContext<SchemaProviderContextProps>({
});

export function useSchema<const S extends $ObjSchema<any, any>>(props: SchemaHookProps<S>) {
  const SchemaProvider = useCallback((p: {
    disabled?: boolean;
    readOnly?: boolean;
    children?: ReactNode;
  }) => {
    return (
      <SchemaProviderContext
        value={{

        }}
      >
        {p.children}
      </SchemaProviderContext>
    );
  }, []);

  return {
    SchemaProvider,
  } as const;
};

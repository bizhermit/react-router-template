import { createContext, useCallback, type ReactNode } from "react";
import type { SCHEMA_ITEM_TYPE_OBJECT } from "../schema/$/object";

type ArgSchema = $Schema.SchemaItemInterfaceProps<any> & {
  type: typeof SCHEMA_ITEM_TYPE_OBJECT;
  props: unknown;
};

type SchemaHookProps<S extends ArgSchema> = {
  id?: string;
  schema: S;
  values?: Record<string, unknown>;
  messages?: $Schema.Message[];
};

type SchemaProviderContextProps = {

};

const SchemaProviderContext = createContext<SchemaProviderContextProps>({
});

export function useSchema<const S extends ArgSchema>(props: SchemaHookProps<S>) {
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

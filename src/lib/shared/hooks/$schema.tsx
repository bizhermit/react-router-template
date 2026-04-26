import { createContext, use, useCallback, useState, useSyncExternalStore, type ReactNode } from "react";
import type { $ArrSchema } from "../schema/$/array";
import type { SchemaItem } from "../schema/$/core";
import { convertToFormItems, FormContext, FormItem } from "../schema/$/form";
import { $ObjSchema } from "../schema/$/object";

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
  const [formContext] = useState(() => {
    return new FormContext<S>({
      values: props.values ?? {},
      data: {},
      schema: props.schema,
    });
  });

  const hasError = useSyncExternalStore((callback) => {
    const cleanup = formContext.addErrorSubscribe(callback);
    return () => cleanup();
  }, () => {
    return formContext.hasError();
  }, () => {
    return formContext.hasError();
  });

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
    formItems: formContext.getFormItems(),
    hasError,
  } as const;
};

export function useArraySchema<S extends $ArrSchema<any, any>>(arrayFormItem: FormItem<S>) {
  const { context } = use(SchemaProviderContext);
  const [revision, setRevision] = useState(0);
  const value = useSyncExternalStore<$Schema.Nullable<$Schema.InferValue<S>>>((callback) => {
    const cleanup = context.addValuesSubscribe(arrayFormItem.getName(), () => {
      setRevision(c => c + 1);
      callback();
    });
    return () => cleanup();
  }, () => {
    return context.getValue(arrayFormItem.getName());
  }, () => {
    return context.getValue(arrayFormItem.getName());
  });

  type ArgFormParams = $Schema.InferArrayChild<S> extends $ObjSchema<any, any> ? {
    formItems: $Schema.ObjectFormItems<$Schema.InferArrayChild<S>>;
    formItem: never;
  } : {
    formItem: FormItem<$Schema.InferArrayChild<S>>;
    formItems: never;
  };

  const [getChildFormItem] = useState(() => {
    const child = arrayFormItem.getSchemaItem().getChild();
    const name = arrayFormItem.getName();

    if (child instanceof $ObjSchema) {
      return (index: number) => ({
        formItems: convertToFormItems(
          context,
          child.getChildren(),
          `${name}[${index}]`,
        ),
      } as ArgFormParams);
    }
    return (index: number) => ({
      formItem: new FormItem(
        context,
        `${name}[${index}]`,
        child as SchemaItem,
      ),
    } as ArgFormParams);
  });

  function remove(index?: number) {
    const v = arrayFormItem.getValue();
    if (v == null) return;
    if (index == null) {
      arrayFormItem.setValue([]);
      return;
    }
    const nv = [...v];
    nv.splice(index, 1);
    arrayFormItem.setValue(nv);
  };

  function add(value: $Schema.InferValue<$Schema.InferArrayChild<S>>) {
    const v = [...arrayFormItem.getValue() ?? [], value];
    arrayFormItem.setValue(v);
  };

  function map<T>(callback: (params: {
    key: string;
    index: number;
    name: string;
    value: $Schema.InferValue<$Schema.InferArrayChild<S>>;
    remove: () => void;
  } & ArgFormParams) => T) {
    return value?.map((val, index) => {
      return callback({
        key: `${revision}-${index}`,
        index,
        name: `${arrayFormItem.getName()}[${index}]`,
        value: val,
        remove: () => remove(index),
        ...getChildFormItem(index),
      });
    });
  };

  return {
    value,
    revision,
    map,
    remove,
    add,
  } as const;
};

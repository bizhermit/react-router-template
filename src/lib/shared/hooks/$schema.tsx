import { createContext, use, useState, useSyncExternalStore, type CSSProperties, type FormHTMLAttributes, type SubmitEvent, type SyntheticEvent } from "react";
import type { SchemaProviderProps } from "../providers/schema";
import type { $ArrSchema } from "../schema/$/array";
import type { SchemaItem } from "../schema/$/core";
import { convertToFormItems, FormContext, FormItem } from "../schema/$/form";
import { $ObjSchema } from "../schema/$/object";
import { getResultMessage$ } from "../schema/message";
import { I18nContext } from "./i18n";
import { useFieldSet } from "./schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SchemaHookProps<S extends $ObjSchema<any, any>> = {
  id: string;
  schema: S;
  values?: Record<string, unknown>;
  messages?: $Schema.RecordMessages;
  state?: "idle" | "submitting" | "loading";
  submit?: {
    callback?: (error: boolean) => (void | boolean);
  };
  reset?: {
    execValidate?: boolean;
    callback?: () => void;
  };
};

export type FormState = "idle" | "loading" | "submitting";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SchemaProviderContextProps<S extends $ObjSchema<any, any> = $ObjSchema<any, any>> = {
  id: string;
  formState: FormState;
  context: FormContext<S>;
};

export const SchemaProviderContext = createContext<SchemaProviderContextProps>({
  id: null!,
  formState: "loading",
  context: null!,
});

/**
 *
 * @param props
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useSchema<const S extends $ObjSchema<any, any>>(props: SchemaHookProps<S>) {
  const id = props.id;

  const [formContext] = useState(() => {
    const ret = new FormContext<S>({
      values: props.values ?? {},
      messages: props.messages,
      data: {},
      schema: props.schema,
    });
    return ret;
  });

  const hasError = useSyncExternalStore((callback) => {
    const cleanup = formContext.addErrorSubscribe(callback);
    return () => cleanup();
  }, () => {
    return formContext.hasError();
  }, () => {
    return formContext.hasError();
  });

  const state = props.state || "idle";

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    if (state !== "idle") {
      console.warn(`supress submit event. state: ${state}`);
      e.preventDefault();
      return;
    }
    const { hasError } = formContext.validate();
    if (hasError) {
      e.preventDefault();
      props.submit?.callback?.(true);
      return;
    }
    const ret = props.submit?.callback?.(false);
    if (ret === false) e.preventDefault();
  };

  function reset(options?: {
    execValidate?: boolean;
  }) {
    if (state !== "idle") {
      console.warn(`supress reset event. state: ${state}`);
      return;
    }
    formContext.reset({
      execValidate: options?.execValidate ?? props.reset?.execValidate,
    });
    props.reset?.callback?.();
  }

  function handleReset(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    reset(props.reset);
  };

  function getFormProps(method: "get" | "post" | "put", options?: {
    encType?: "application/x-www-form-urlencoded" | "multipart/form-data";
  }) {
    return {
      method,
      noValidate: true,
      encType: options?.encType,
      onSubmit: handleSubmit,
      onReset: handleReset,
    } satisfies FormHTMLAttributes<HTMLFormElement>;
  };

  return {
    id,
    providerProps: {
      formId: id,
      formContext,
      formState: state,
    } as const satisfies SchemaProviderProps,
    formProps: {
      noValidate: true,
      onSubmit: handleSubmit,
      onReset: handleReset,
    } as const satisfies FormHTMLAttributes<HTMLFormElement>,
    formItems: formContext.getFormItems(),
    hasError,
    state,
    handleSubmit,
    handleReset,
    reset,
    getFormProps,
  } as const;
};

/**
 *
 * @returns
 */
export function useHasError() {
  const { context } = use(SchemaProviderContext);
  const hasError = useSyncExternalStore((callback) => {
    const cleanup = context.addErrorSubscribe(callback);
    return () => cleanup();
  }, () => {
    return context.hasError();
  }, () => {
    return context.hasError();
  });
  return hasError;
};

/**
 *
 * @param arrayFormItem
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useFormArrayItem<S extends $ArrSchema<any, any>>(arrayFormItem: FormItem<S>) {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

/**
 *
 * @param formItem
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useFormValue<S extends SchemaItem<any>>(formItem: FormItem<S>) {
  const { context } = use(SchemaProviderContext);
  const value = useSyncExternalStore<$Schema.Nullable<$Schema.InferValue<S>>>((callback) => {
    const cleanup = context.addValuesSubscribe(formItem.getName(), () => {
      callback();
    });
    return () => cleanup();
  }, () => {
    return context.getValue(formItem.getName());
  }, () => {
    return context.getValue(formItem.getName());
  });
  return value;
};

/**
 *
 * @param formItem
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useFormMessage(formItem: FormItem<any>) {
  const { context } = use(SchemaProviderContext);
  const message = useSyncExternalStore<$Schema.Message | undefined>((callback) => {
    const cleanup = context.addMessageSubscribe(formItem.getName(), () => {
      callback();
    });
    return () => cleanup();
  }, () => {
    return context.getMessage(formItem.getName());
  }, () => {
    return context.getMessage(formItem.getName());
  });
  return message;
};

export type FormInputStyleProps = {
  className?: string;
  style?: CSSProperties;
};

export type FormInputProps = {
  hideMessage?: boolean;
  omitOnSubmit?: boolean;
};

/**
 *
 * @param formItem
 * @param props
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useFormInput<S extends SchemaItem<any>>(
  formItem: FormItem<S>,
  props: FormInputProps
) {
  const t = use(I18nContext).t;
  const fs = useFieldSet();

  const {
    id: schemaId,
    context,
    formState,
  } = use(SchemaProviderContext);
  const schemaItem = formItem.getSchemaItem();
  const injectParams = useSyncExternalStore((callback) => {
    const cleanup = context.addInjectParamsSubscribe(() => callback);
    return () => cleanup();
  }, () => {
    return context.getInjectParams();
  }, () => {
    return context.getInjectParams();
  });

  const name = formItem.getName();
  const label = t(schemaItem.getLabel() as I18nTextKey);

  const value = useSyncExternalStore<$Schema.Nullable<$Schema.InferValue<S>>>((callback) => {
    const cleanup = context.addValuesSubscribe(name, () => {
      callback();
    });
    return () => cleanup();
  }, () => {
    return context.getValue(name);
  }, () => {
    return context.getValue(name);
  });

  const message = useSyncExternalStore<$Schema.Message | undefined>((callback) => {
    const cleanup = context.addMessageSubscribe(name, () => {
      callback();
    });
    return () => cleanup();
  }, () => {
    return context.getMessage(name);
  }, () => {
    return context.getMessage(name);
  });

  function setValue(value: unknown) {
    return formItem.setValue(value);
  };

  const id = `${schemaId}_${name}`;

  const mode = formItem.getMode(injectParams);
  let state: $Schema.Mode = "enabled";
  if (mode === "hidden") state = "hidden";
  else if (fs.disabled || mode === "disabled") state = "disabled";
  else if (fs.readOnly || mode === "readonly" || formState === "loading" || formState === "submitting") state = "readonly";

  const isInvalid = message?.type === "e";
  let errormMessageId: string | undefined;
  let errormessage: string | undefined;
  if (isInvalid) {
    if (props.hideMessage) {
      errormessage = getResultMessage$(use(I18nContext).t, message);
    } else {
      errormMessageId = errormessage = `${id}__msg`;
    }
  }

  return {
    schemaId,
    id,
    name,
    label,
    state,
    value,
    setValue,
    message,
    schemaItem,
    isInvalid,
    errormMessageId,
    errormessage,
    injectParams,
  } as const;
};

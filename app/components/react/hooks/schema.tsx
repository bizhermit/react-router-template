/* eslint-disable @typescript-eslint/no-explicit-any */

import { createContext, use, useCallback, useContext, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent, type FormHTMLAttributes, type ReactNode, type RefObject } from "react";
import { useText } from "~/components/react/hooks/i18n";
import { getFocusableElement } from "../../client/dom/focus";
import { clone } from "../../objects";
import { parseWithSchema } from "../../schema";
import { getRelativeName, SchemaData } from "../../schema/data";
import type { InputWrapProps } from "../elements/form/common";
import { ValidScriptsContext } from "../providers/valid-scripts";

export interface SchemaEffectParams_Refresh {
  type: "refresh";
  data: SchemaData;
  results: Record<string, Schema.Result>;
  dep: Record<string, unknown>;
};

export interface SchemaEffectParams_ValueResult {
  type: "value-result";
  items: Array<{ name: string; value: unknown; result: Schema.Result | null | undefined; }>;
};

export interface SchemaEffectParams_Value {
  type: "value";
  items: Array<{ name: string; value: unknown; }>;
};

export interface SchemaEffectParams_Result {
  type: "result";
  items: Array<{ name: string; result: Schema.Result | null | undefined; }>;
};

export interface SchemaEffectParams_Dep {
  type: "dep";
  dep: Record<string, unknown>;
};

export interface SchemaEffectParams_Validatoin {
  type: "validation";
  results: Record<string, Schema.Result>;
};

export type SchemaEffectParams =
  | SchemaEffectParams_Refresh
  | SchemaEffectParams_ValueResult
  | SchemaEffectParams_Value
  | SchemaEffectParams_Result
  | SchemaEffectParams_Dep
  | SchemaEffectParams_Validatoin
  ;

interface FormItemMountProps {
  id: string;
  name: string;
};

export type FormState = "idle" | "loading" | "submitting";
export type SchemaValidationTrigger = "change" | "submit";
type ResetValidationMode = "default" | "clear" | "submission";

interface SchemaContextProps<S extends Record<string, Schema.$Any> = Record<string, Schema.$Any>> {
  env: Schema.Env;
  data: RefObject<SchemaData>;
  dep: RefObject<Record<string, unknown>>;
  dataItems: Schema.DataItems<S>;
  addSubscribe: (
    effect: (params: SchemaEffectParams) => void,
    formItem?: FormItemMountProps
  ) => (() => void);
  getResult: (name: string) => Schema.Result | null | undefined;
  setResult: (name: string, result: Schema.Result | null | undefined) => boolean;
  setResults: (
    items: Array<{ name: string; result: Schema.Result | null | undefined; }>
  ) => boolean;
  setValue: (name: string, value: unknown) => boolean;
  setValueAndResult: (
    name: string,
    value: unknown,
    result: Schema.Result | null | undefined
  ) => boolean;
  setValuesAndResults: (
    items: Array<{ name: string; value: unknown; result: Schema.Result | null | undefined; }>
  ) => boolean;
  validation: () => ReturnType<typeof parseWithSchema>;
  reset: () => void;
  isInitialize: RefObject<boolean>;
  isFirstLoad: RefObject<boolean>;
  isValidScripts: RefObject<boolean>;
  state: FormState | undefined;
  validationTrigger: SchemaValidationTrigger;
};

export const SchemaContext = createContext<SchemaContextProps>({
  env: null!,
  data: { current: null! },
  dep: { current: null! },
  dataItems: null!,
  addSubscribe: null!,
  getResult: null!,
  setResult: null!,
  setResults: null!,
  setValue: null!,
  setValueAndResult: null!,
  setValuesAndResults: null!,
  validation: () => null!,
  reset: () => { },
  isInitialize: { current: true },
  isFirstLoad: { current: true },
  isValidScripts: { current: false },
  state: undefined,
  validationTrigger: "change",
});

const EMPTY_STRUCT = {} as const;

interface Props<S extends Record<string, Schema.$Any>> {
  schema: S;
  state?: FormState;
  loaderData?: Record<string, any> | null | undefined;
  actionData?: Record<string, any> | null | undefined;
  loaderResults?: Record<string, Schema.Result> | null | undefined;
  actionResults?: Record<string, Schema.Result> | null | undefined;
  dep?: Record<string, any>;
  validationTrigger?: SchemaValidationTrigger;
  onChangeEffected?: (effected: boolean) => void;
};

export function useSchema<S extends Record<string, Schema.$Any>>(props: Props<S>) {
  const t = useText();
  const env = useRef<Schema.Env>({
    isServer: false,
    t,
  });
  const scripts = use(ValidScriptsContext);

  const isInitialize = useRef(true);
  const isFirstLoad = useRef(true);
  const isValidScripts = useRef(scripts.valid);
  const isEffected = useRef(false);
  const isProcessing = props.state === "loading" || props.state === "submitting";

  const subscribes = useRef<Array<(params: SchemaEffectParams) => void>>([]);
  const results = useRef<Record<string, Schema.Result>>({});
  const bindData = useRef<SchemaData>(null!);
  const dep = useRef(props.dep ?? EMPTY_STRUCT);
  const dataItems = useRef<Schema.DataItems<S>>(null!);

  const actionDataRef = useRef<Record<string, unknown> | null | undefined>(undefined);
  const loaderDataRef = useRef<Record<string, unknown> | null | undefined>(undefined);

  const argData = (actionDataRef.current = props.actionData)
    ?? (loaderDataRef.current = props.loaderData)
    ?? undefined;

  function refresh(params: {
    data: Record<string, unknown> | null | undefined;
    resultMode?: ResetValidationMode;
  }) {
    const submission = parseWithSchema({
      schema: props.schema,
      env: env.current,
      data: params.data,
      dep: dep.current,
      createDataItems: !dataItems.current,
    });
    if (!dataItems.current) dataItems.current = submission.dataItems;
    switch (params.resultMode) {
      case "clear":
        results.current = {};
        break;
      case "submission":
        results.current = submission.results;
        break;
      default:
        results.current = props.actionResults ?? props.loaderResults ?? {};
        break;
    }
    for (const k in results.current) {
      const r = results.current[k];
      if (r == null) {
        delete results.current[k];
        continue;
      }
      if (typeof r === "string") {
        results.current[k] = { type: "e", code: "", message: r };
      }
    }
    bindData.current = new SchemaData(submission.data, ({ items }) => {
      if (!isEffected.current) {
        isEffected.current = true;
        props.onChangeEffected?.(isEffected.current);
      }
      const params: SchemaEffectParams_Value = { type: "value", items };
      subscribes.current.forEach(f => f(params));
    });
    return submission;
  };

  const { schema } = useMemo(() => {
    isInitialize.current = true;
    if (isEffected.current) {
      isEffected.current = false;
      props.onChangeEffected?.(isEffected.current);
    }
    dep.current = props.dep ?? EMPTY_STRUCT;
    refresh({ data: argData });
    return {
      schema: props.schema,
    };
  }, [argData]);

  const addSubscribe = useCallback((
    effect: (params: SchemaEffectParams) => void,
    formItem?: FormItemMountProps
  ) => {
    subscribes.current.push(effect);
    return () => {
      const idx = subscribes.current.findIndex(f => f === effect);
      if (idx >= 0) subscribes.current.splice(idx, 1);
      if (formItem) {
        delete results.current[formItem.name];
      }
    };
  }, []);

  function getResult(name: string) {
    return results.current[name];
  };

  function setResultImpl(name: string, result: Schema.Result | null | undefined) {
    let change = false;
    if (result == null) {
      if (results.current[name]) {
        change = true;
        delete results.current[name];
      }
    } else {
      const current = results.current[name];
      change = current == null
        || current.message !== result.message
        || current.type !== result.type;
      results.current[name] = result;
    }
    return change;
  };

  function setResults(items: Array<{ name: string; result: Schema.Result | null | undefined; }>) {
    let change = false;
    items.forEach(({ name, result }) => {
      if (setResultImpl(name, result)) {
        change = true;
      }
    });
    if (change) {
      const params: SchemaEffectParams_Result = {
        type: "result",
        items,
      };
      subscribes.current.forEach(f => f(params));
    }
    return change;
  };

  function setResult(name: string, result: Schema.Result | null | undefined) {
    const change = setResultImpl(name, result);
    if (change) {
      const params: SchemaEffectParams_Result = {
        type: "result",
        items: [{ name, result }],
      };
      subscribes.current.forEach(f => f(params));
    }
    return change;
  };

  function setValue(name: string, value: unknown) {
    let change = false;
    if (bindData.current.set(name, value)) {
      change = true;
    }
    return change;
  };

  function setValueAndResultImpl(
    name: string,
    value: unknown,
    result: Schema.Result | null | undefined
  ) {
    let change = false;
    if (bindData.current._set(name, value)) {
      change = true;
    }
    if (setResultImpl(name, result)) {
      change = true;
    }
    return change;
  };

  function setValuesAndResults(
    items: Array<{ name: string; value: unknown; result: Schema.Result | null | undefined; }>
  ) {
    let change = false;
    items.forEach(({ name, value, result }) => {
      if (setValueAndResultImpl(name, value, result)) {
        change = true;
      }
    });
    if (change) {
      const params: SchemaEffectParams = {
        type: "value-result",
        items,
      };
      subscribes.current.forEach(f => f(params));
      if (!isEffected.current) {
        isEffected.current = true;
        props.onChangeEffected?.(isEffected.current);
      }
    }
    return change;
  };

  function setValueAndResult(
    name: string,
    value: unknown,
    result: Schema.Result | null | undefined
  ) {
    const items = [{ name, value, result }];
    const change = setValueAndResultImpl(name, value, result);
    if (change) {
      const params: SchemaEffectParams = {
        type: "value-result",
        items,
      };
      subscribes.current.forEach(f => f(params));
      if (!isEffected.current) {
        isEffected.current = true;
        props.onChangeEffected?.(isEffected.current);
      }
    }
    return change;
  };

  const validation = useCallback(() => {
    const submission = parseWithSchema({
      schema: schema,
      env: env.current,
      data: bindData.current.getData(),
      dep: dep.current,
    });
    results.current = submission.results;
    const params: SchemaEffectParams_Validatoin = {
      type: "validation",
      results: results.current,
    };
    subscribes.current.forEach(f => f(params));
    return submission;
  }, []);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.stopPropagation();
    if (isProcessing) {
      e.preventDefault();
      console.warn("form is processing");
      return null;
    };

    const submission = validation();
    if (submission.hasError) {
      e.preventDefault();
      setTimeout(() => {
        const topElem = Array.from((e.target as HTMLFormElement).querySelectorAll(`[aria-invalid="true"]`))
          .map(elem => {
            const wrapElem = elem.parentElement!;
            return {
              elem: wrapElem,
              top: wrapElem.getBoundingClientRect().top,
            };
          })
          .sort((elem1, elem2) => elem1.top - elem2.top)[0]?.elem;
        if (topElem) {
          topElem.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
          getFocusableElement(topElem)?.focus();
        }
      }, 100);
    }
    return submission;
  };

  const reset = useCallback(() => {
    refresh({
      data: loaderDataRef.current,
    });
    const params: SchemaEffectParams_Refresh = {
      type: "refresh",
      data: bindData.current,
      results: results.current,
      dep: dep.current,
    };
    subscribes.current.forEach(f => f(params));
  }, []);

  function handleReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isProcessing) {
      console.warn("form is processing");
      return;
    }
    reset();
  };

  const stateRef = useRef(props.state);
  const stateSubscribeRef = useRef<() => void>(() => { });

  const SchemaProvider = useCallback((p: {
    children?: ReactNode;
  }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const state = useSyncExternalStore((listener) => {
      stateSubscribeRef.current = listener;
      return () => { };
    }, () => {
      return stateRef.current;
    }, () => {
      return stateRef.current;
    });

    return (
      <SchemaContext
        value={{
          env: env.current,
          data: bindData,
          dep,
          dataItems: dataItems.current,
          addSubscribe,
          getResult,
          setResult,
          setResults,
          setValue,
          setValueAndResult,
          setValuesAndResults,
          validation,
          reset,
          isInitialize,
          isFirstLoad,
          isValidScripts,
          state,
          validationTrigger: props.validationTrigger || "change",
        }}
      >
        {p.children}
      </SchemaContext>
    );
  }, []);

  useLayoutEffect(() => {
    stateRef.current = props.state;
    stateSubscribeRef.current();
  }, [props.state]);

  useLayoutEffect(() => {
    if (isInitialize.current) return;
    const newDep = props.dep ?? EMPTY_STRUCT;
    if (dep.current === (newDep)) return;
    dep.current = newDep;
    const params: SchemaEffectParams_Dep = { type: "dep", dep: newDep };
    subscribes.current.forEach(f => f(params));
  }, [props.dep]);

  useLayoutEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
    } else {
      const params: SchemaEffectParams_Refresh = {
        type: "refresh",
        data: bindData.current,
        results: results.current,
        dep: dep.current,
      };
      subscribes.current.forEach(f => f(params));
    }
    isInitialize.current = false;
  }, [argData]);

  useLayoutEffect(() => {
    isValidScripts.current = true;
  }, []);

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
    SchemaProvider,
    dataItems: dataItems.current,
    getData: function () {
      return clone<Schema.PartialSchemaValue<S>>(bindData.current.getData());
    },
    handleSubmit,
    handleReset,
    validation,
    reset,
    getFormProps,
  } as const;
};

export function useSchemaContext<
  S extends Record<string, Schema.$Any> = Record<string, Schema.$Any>
>() {
  return useContext(SchemaContext) as SchemaContextProps<S>;
};

export function useSchemaEffect(
  effect: (params: SchemaEffectParams) => void,
  getFormItemMountProps?: () => FormItemMountProps,
) {
  const schema = use(SchemaContext);
  useLayoutEffect(() => {
    const unmount = schema.addSubscribe(effect, getFormItemMountProps?.());
    return () => unmount();
  }, []);
  return schema;
};

type SetValue<P extends Schema.$Any> =
  | Schema.ValueType<P, false>
  | null
  | undefined
  | ((currentValue: Schema.ValueType<P, true, true> | null | undefined) => Schema.ValueType<P, false>)
  ;

export function useSchemaValue<D extends Schema.DataItem>(dataItem: D) {
  const schema = useSchemaEffect((params) => {
    switch (params.type) {
      case "refresh":
        setValue(getValue);
        break;
      case "value":
      case "value-result": {
        const item = params.items.find(item => item.name === dataItem.name);
        if (item) {
          setValue(item.value as Schema.ValueType<D["_"]>);
        }
        break;
      }
      default:
        break;
    }
  });

  const [value, setValue] = useState(getValue);

  function getValue() {
    return schema.data.current.get(dataItem.name) as Schema.ValueType<D["_"], true, true>;
  };

  function set(value: SetValue<D["_"]>) {
    const newValue = typeof value === "function" ? value(getValue()) : value;
    schema.setValue(dataItem.name, newValue);
  };

  return [
    value,
    set,
  ] as const;
};

export function useSchemaResult<D extends Schema.DataItem>(dataItem: D) {
  const schema = useSchemaEffect((params) => {
    switch (params.type) {
      case "refresh":
        setResult(params.results[dataItem.name]);
        break;
      case "result": {
        const item = params.items.find(item => item.name === dataItem.name);
        if (item) {
          setResult(item.result);
        }
        break;
      }
      default:
        break;
    }
  });

  const [result, setResult] = useState(() => {
    return schema.getResult(dataItem.name);
  });

  function set(result: Schema.Result | null | undefined) {
    schema.setResult(dataItem.name, result);
  };

  return [
    result,
    set,
  ] as const;
};

interface FieldSetContextProps {
  disabled: boolean;
  readOnly: boolean;
};

export const FieldSetContext = createContext<FieldSetContextProps>({
  disabled: false,
  readOnly: false,
});

export function useFieldSet() {
  return use(FieldSetContext);
};

export interface SchemaItemProps<D extends Schema.DataItem> extends InputWrapProps {
  $: D;
  readOnly?: boolean;
};

export const MODE_PRIORITY = {
  enabled: 0,
  readonly: 1,
  disabled: 2,
  hidden: 3,
} satisfies Record<Schema.Mode, number>;

export const MODE = {
  [MODE_PRIORITY.enabled]: "enabled",
  [MODE_PRIORITY.readonly]: "readonly",
  [MODE_PRIORITY.disabled]: "disabled",
  [MODE_PRIORITY.hidden]: "hidden",
} satisfies Record<number, Schema.Mode>;

export function getDefaultState() {
  return {
    enabled: true,
    disabled: false,
    readonly: false,
    hidden: false,
  } as Record<Schema.Mode, boolean>;
};

type SchemaEffectHookParams = ReturnType<typeof useSchemaEffect>;

export function getSchemaItemMode($: Schema.DataItem, schema: SchemaEffectHookParams) {
  let parent = $.parent;
  const modeParams: Schema.ModeParams = {
    data: schema.data.current,
    dep: schema.dep.current,
    env: schema.env,
  };
  let mode: keyof typeof MODE = MODE_PRIORITY[$._.mode?.(modeParams) ?? "enabled"];
  while (parent?.name) {
    if (mode === MODE_PRIORITY.hidden) break;
    mode = Math.max(MODE_PRIORITY[parent._.mode?.(modeParams) ?? "enabled"]);
    parent = parent.parent;
  }
  return MODE[mode];
};

export function getSchemaItemRequired(
  $: Schema.DataItem,
  schema: SchemaEffectHookParams,
) {
  if (typeof $._.required === "function") {
    return $._.required({
      name: $.name,
      data: schema.data.current,
      dep: schema.dep.current,
      env: schema.env,
      label: $.label,
    });
  }
  return $._.required === true;
};

export function getSchemaItemResult(
  $: Schema.DataItem,
  schema: ReturnType<typeof useSchemaEffect>,
  getValue: () => unknown,
) {
  if (schema.isInitialize.current) {
    if (!$.name) return undefined;
    return schema.getResult($.name);
  }
  return schemaItemValidation($, schema, getValue());
};

export function parseSchemaItemValue<D extends Schema.DataItem>(
  $: D,
  schema: SchemaEffectHookParams,
  value: unknown,
) {
  return $._.parser({
    dep: schema.dep.current,
    env: schema.env,
    value,
    label: $.label,
  }) as {
    value: Schema.ValueType<D["_"], true, true>;
    result: Schema.Result | null | undefined;
  };
};

export function schemaItemValidation<D extends Schema.DataItem>(
  $: D,
  schema: SchemaEffectHookParams,
  value: unknown,
) {
  let r: Schema.Result | null | undefined;

  const params: Schema.ValidationParams<any> = {
    name: $.name,
    label: $.label,
    data: schema.data.current,
    dep: schema.dep.current,
    env: schema.env,
    value,
    getSource: () => {
      if ("source" in $["_"]) {
        const source = $._.source;
        if (typeof source === "function") {
          return source({
            data: schema.data.current,
            dep: schema.dep.current,
            env: schema.env,
            label: $.label,
            name: $.name,
          });
        }
        return source;
      }
      return undefined;
    },
  };
  for (const vali of $._.validators) {
    r = vali(params);
    if (r) break;
  }
  return r;
};

export function schemaItemEffect<D extends Schema.DataItem>(
  $: D,
  schema: SchemaEffectHookParams,
  value: unknown,
) {
  const parsed = parseSchemaItemValue($, schema, value);
  let r = parsed.result;
  if (!r) {
    r = schemaItemValidation($, schema, parsed.value);
  }
  return {
    value: parsed.value,
    result: r,
  } as const;
};

export function optimizeRefs(
  $: Schema.DataItem,
  refs: Array<string> | undefined
): Array<string> {
  if (!refs) return [];
  return refs.map(ref => getRelativeName($.name, ref));
};

export function useSchemaItem<D extends Schema.DataItem>({
  $,
  omitOnSubmit,
  ...props
}: SchemaItemProps<D>, options: {
  effect?: (params: {
    value: Schema.ValueType<D["_"], true, true> | null | undefined;
    result: Schema.Result | null | undefined;
  }) => void;
  effectContext?: (params: {
    name: string;
    data: SchemaData;
    dep: Record<string, unknown>;
    env: Schema.Env;
    label: string | undefined;
  }) => void;
  watchChildEffect?: (params: SchemaEffectParams) => void;
}) {
  const id = useId();
  const isEffected = useRef(false);

  const fs = useFieldSet();

  const originalRefs = useRef(optimizeRefs($, $._.refs));
  const customRefs = useRef<Array<string>>([]);

  const schema = useSchemaEffect((params) => {
    switch (params.type) {
      case "refresh": {
        isEffected.current = false;
        const value = params.data.get<any>($.name);
        const result = params.results[$.name];
        setValue(value);
        setResult(result);
        options.effect?.({ value, result });
      }
      // eslint-disable-next-line no-fallthrough
      case "dep":
        setMode(getMode);
        setRequired(getRequired);
        options.effectContext?.({
          name: $.name,
          label: $.label,
          data: schema.data.current,
          dep: schema.dep.current,
          env: schema.env,
        });
        break;
      case "value-result":
      case "value": {
        const item = (params as SchemaEffectParams_ValueResult)
          .items.find(item => item.name === $.name) as {
            value: Schema.ValueType<D["_"], true, true>;
            result: Schema.Result | null | undefined;
          } | undefined;
        if (item) {
          if (params.type === "value-result") {
            setValue(item.value);
            if (schema.validationTrigger === "change") {
              setResult(item.result);
            }
            options.effect?.(item);
          } else {
            const submission = effect(item.value);
            setValue(submission.value);
            if (schema.validationTrigger === "change") {
              setResult(submission.result);
            }
            options.effect?.(submission);
          }
          isEffected.current = true;
        }
        if (
          originalRefs.current.some(ref => params.items.some(item => item.name === ref)) ||
          customRefs.current.some(ref => params.items.some(item => item.name === ref))
        ) {
          const result = validation(getValue());
          setMode(getMode);
          setRequired(getRequired);
          options.effectContext?.({
            name: $.name,
            label: $.label,
            data: schema.data.current,
            dep: schema.dep.current,
            env: schema.env,
          });
          if (schema.setResult($.name, result)) {
            isEffected.current = true;
          }
        }
        if (options.watchChildEffect) {
          if (params.items.some(item => item.name.startsWith($.name))) {
            options.watchChildEffect(params);
          }
        }
        break;
      }
      case "result": {
        const item = params.items.find(item => item.name === $.name);
        if (item) {
          setResult(item.result);
          isEffected.current = true;
        }
        break;
      }
      case "validation":
        setResult(params.results[$.name]);
        break;
      default:
        break;
    }
  }, () => {
    return {
      id,
      name: $.name,
    };
  });

  function getMode() {
    return getSchemaItemMode($, schema);
  };

  const [mode, setMode] = useState(getMode);

  function getValue() {
    return schema.data.current.get($.name) as Schema.ValueType<D["_"], true, true>;
  };

  const [value, setValue] = useState(getValue);

  function getResult() {
    return getSchemaItemResult($, schema, getValue);
  };

  const [result, setResult] = useState(getResult);

  function getRequired() {
    return getSchemaItemRequired($, schema);
  };

  const [required, setRequired] = useState(getRequired);

  function parse(value: unknown) {
    return parseSchemaItemValue($, schema, value);
  };

  function validation(value: unknown) {
    return schemaItemValidation($, schema, value);
  };

  function effect(value: unknown) {
    return schemaItemEffect($, schema, value);
  };

  function setRefs(refs: Array<string>) {
    customRefs.current = optimizeRefs($, refs);
  };

  function getCommonParams(): Schema.DynamicValidationValueParams {
    return {
      name: $.name,
      label: $.label,
      data: schema.data.current,
      dep: schema.dep.current,
      env: schema.env,
    };
  };

  useLayoutEffect(() => {
    setRequired(getRequired);
    if (!schema.isInitialize.current && result !== schema.getResult($.name)) {
      schema.setResult($.name, result);
    }
    return () => {
      schema.setResult($.name, undefined);
    };
  }, []);

  const stateRef = useRef<Schema.Mode>("enabled");
  if (mode === "hidden") {
    stateRef.current = "hidden";
  } else if (fs.disabled || mode === "disabled") {
    stateRef.current = "disabled";
  } else if (fs.readOnly || mode === "readonly" || schema.state === "loading" || schema.state === "submitting") {
    stateRef.current = "readonly";
  } else {
    stateRef.current = "enabled";
  }
  const isInvalid = result?.type === "e";

  function set(value: Schema.ValueType<D["_"], false> | null | undefined) {
    const submission = effect(value);
    schema.setValueAndResult(
      $.name,
      submission.value,
      schema.validationTrigger === "change" ? submission.result : result,
    );
    return submission;
  };

  return {
    props,
    id,
    name: $.name,
    label: $.label,
    value,
    result,
    dataItem: $,
    mode,
    required,
    state: stateRef,
    getValue,
    setValue: set,
    parse,
    validation,
    invalid: isInvalid,
    errormessage: isInvalid ? result.message : undefined,
    data: schema.data.current,
    dep: schema.dep.current,
    env: schema.env,
    validScripts: schema.isValidScripts.current,
    getCommonParams,
    setRefs,
    omitOnSubmit,
    formState: schema.state,
  } as const;
};

export function useSchemaArray<D extends Schema.DataItem<Schema.$Array>>(dataItem: D, options?: {
  watchChildValue?: boolean;
  readOnly?: boolean;
}) {
  type ArrayType = Exclude<Schema.ValueType<D["_"], true, true>, null | undefined>;
  type LaxArrayType = Schema.ValueType<D["_"], false, false>;
  type NonNullLaxArrayType = Exclude<LaxArrayType, null | undefined>;

  const schemaItem = useSchemaItem<D>({ $: dataItem, readOnly: options?.readOnly }, {
    watchChildEffect: options?.watchChildValue
      ? undefined
      : () => {
        setRev(c => c + 1);
      },
  });

  const [_, setRev] = useState(0);
  const [keyRev, setKeyRev] = useState(0);

  function push(
    value: Partial<NonNullLaxArrayType[number]>,
    options?: {
      position?: "first" | "last";
    }
  ) {
    if (schemaItem.state.current !== "enabled") return;
    const arr = schemaItem.getValue() ?? [] as ArrayType;
    const isFirst = options?.position === "first";
    schemaItem.setValue((isFirst ? [value, ...arr] : [...arr, value]) as LaxArrayType);
    if (isFirst) setKeyRev(c => c + 1);
  };

  function bulkPush(
    values: Array<Partial<NonNullLaxArrayType[number]>>,
    options?: {
      position?: "first" | "last";
    }
  ) {
    if (schemaItem.state.current !== "enabled") return;
    const arr = schemaItem.getValue() ?? [];
    const isFirst = options?.position === "first";
    schemaItem.setValue((isFirst ? [...values, ...arr] : [...arr, ...values]) as LaxArrayType);
    if (isFirst) setKeyRev(c => c + 1);
  }

  function remove(index: number) {
    if (schemaItem.state.current !== "enabled") return;
    const arr = schemaItem.getValue() ?? [] as ArrayType;
    if (arr == null) return;
    const isLast = index === (arr.length - 1);
    const newArr = [...arr];
    newArr.splice(index, 1);
    schemaItem.setValue(newArr as LaxArrayType);
    if (!isLast) setKeyRev(c => c + 1);
  };

  function removeFirst() {
    if (schemaItem.state.current !== "enabled") return;
    remove(0);
  };

  function removeLast() {
    if (schemaItem.state.current !== "enabled") return;
    const arr = schemaItem.getValue();
    if (arr == null) return;
    remove(arr.length - 1);
  };

  function removeAll() {
    if (schemaItem.state.current !== "enabled") return;
    const arr = schemaItem.getValue();
    if (arr == null || arr.length === 0) return;
    schemaItem.setValue([] as LaxArrayType);
  };

  function map<T>(func: (params: {
    key: string;
    value: ArrayType[number];
    index: number;
    name: string;
    dataItem: Schema.DataItem<D["_"]["prop"]>;
    remove: () => void;
  }) => T) {
    return schemaItem.value?.map((value, index) => {
      const di = dataItem.generateDataItem(index) as Schema.DataItem<D["_"]["prop"]>;

      const key = typeof dataItem._.key === "function" ? dataItem._.key(value as any) :
        (value && dataItem._.key) ? (value as Record<string, string>)[dataItem._.key] : `${keyRev}_${index}`;
      return func({
        key,
        value,
        index,
        name: di.name,
        dataItem: di,
        remove: () => remove(index),
      });
    });
  };

  return {
    value: schemaItem.value,
    result: schemaItem.result,
    mode: schemaItem.mode,
    isEmpty: schemaItem.value == null || schemaItem.value.length === 0,
    push,
    bulkPush,
    remove,
    removeFirst,
    removeLast,
    removeAll,
    map,
  };
};

import { createContext, use, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { SchemaData } from "./data";
import { parseWithSchema } from ".";
import { unstable_usePrompt } from "react-router";
import { clone } from "../objects";

export type SchemaEffectParameters =
  | {
    type: "data";
    data: SchemaData;
    results: Record<string, Schema.Result>;
    dep: Record<string, any>;
  }
  | {
    type: "value";
    items: Array<{ name: string; value: any; }>;
  }
  | {
    type: "result";
    items: Array<{ name: string; result: Schema.Result | null | undefined; }>;
  }
  | {
    type: "dep";
    dep: Record<string, any>;
  }
  ;

type FormItemMountProps = {
  id: string;
  name: string;
};

type SchemaContextProps<S extends Record<string, Schema.$Any> = Record<string, Schema.$Any>> = {
  env: Schema.Env;
  data: RefObject<SchemaData>;
  dep: RefObject<Record<string, any>>;
  dataItems: Schema.DataItems<S>;
  addSubscribe: (
    effect: (params: SchemaEffectParameters) => void,
    formItem?: FormItemMountProps
  ) => (() => void);
  getResult: (name: string) => Schema.Result | null | undefined;
  setResult: (name: string, result: Schema.Result | null | undefined) => boolean;
  setResults: (items: Array<{ name: string; result: Schema.Result | null | undefined; }>) => boolean;
  isInitialize: RefObject<boolean>;
  isFirstLoad: RefObject<boolean>;
  isValidScripts: RefObject<boolean>;
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
  isInitialize: { current: true },
  isFirstLoad: { current: true },
  isValidScripts: { current: false },
});

const EMPTY_STRUCT = {} as const;

type Props<S extends Record<string, Schema.$Any>> = {
  schema: S;
  data?: Record<string, any> | null | undefined;
  results?: Record<string, Schema.Result>;
  dep?: Record<string, any>;
  preventPrompt?: boolean;
};

export function useSchema<S extends Record<string, Schema.$Any>>(props: Props<S>) {
  const env = useRef<Schema.Env>({
    isServer: false,
    t: (k) => k,
  });

  const isInitialize = useRef(true);
  const isFirstLoad = useRef(true);
  const isValidScripts = useRef(false);
  const isEffected = useRef(false);

  const subscribes = useRef<Array<(params: SchemaEffectParameters) => void>>([]);
  const results = useRef<Record<string, Schema.Result>>({});
  const bindData = useRef<SchemaData>(null!);
  const dep = useRef(props.dep ?? EMPTY_STRUCT);
  const dataItems = useRef<Schema.DataItems<S>>(null!);

  useMemo(() => {
    isInitialize.current = true;
    isEffected.current = false;
    dep.current = props.dep ?? EMPTY_STRUCT;
    const submission = parseWithSchema({
      schema: props.schema,
      env: env.current,
      data: props.data,
      dep: dep.current,
      createDataItems: !dataItems.current,
    });
    if (!dataItems.current) dataItems.current = submission.dataItems;
    results.current = props.results ?? EMPTY_STRUCT;
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
      isEffected.current = true;
      const params: SchemaEffectParameters = { type: "value", items };
      subscribes.current.forEach(f => f(params));
    });
  }, [props.data]);

  const addSubscribe = useCallback((
    effect: (params: SchemaEffectParameters) => void,
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

  function setResultsImpl(items: Array<{ name: string; result: Schema.Result | null | undefined; }>) {
    let change = false;
    items.forEach(({ name, result }) => {
      if (result == null) {
        if (results.current[name]) {
          change = true;
          delete results.current[name];
        }
      } else {
        const current = results.current[name];
        change = current == null || current.message !== result.message || current.type !== result.type;
        results.current[name] = result;
      }
    })
    return change;
  };

  function setResults(items: Array<{ name: string; result: Schema.Result | null | undefined; }>) {
    const change = setResultsImpl(items);
    if (change) {
      const params: SchemaEffectParameters = { type: "result", items };
      subscribes.current.forEach(f => f(params));
    }
    return change;
  };


  function setResult(name: string, result: Schema.Result | null | undefined) {
    const change = setResultsImpl([{ name, result }]);
    if (change) {
      const params: SchemaEffectParameters = { type: "result", items: [{ name, result }] };
      subscribes.current.forEach(f => f(params));
    }
    return change;
  };

  const SchemaProvider = useCallback((p: {
    children?: ReactNode;
  }) => {
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
          isInitialize,
          isFirstLoad,
          isValidScripts,
        }}
      >
        {p.children}
      </SchemaContext>
    );
  }, []);

  useLayoutEffect(() => {
    if (isInitialize.current) return;
    const newDep = props.dep ?? EMPTY_STRUCT;
    if (dep.current === (newDep)) return;
    dep.current = newDep;
    const params: SchemaEffectParameters = { type: "dep", dep: newDep };
    subscribes.current.forEach(f => f(params));
  }, [props.dep]);

  useLayoutEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
    } else {
      const params: SchemaEffectParameters = {
        type: "data",
        data: bindData.current,
        results: results.current,
        dep: dep.current,
      };
      subscribes.current.forEach(f => f(params));
    }
    isInitialize.current = false;
  }, [props.data]);

  unstable_usePrompt({
    when: () => {
      return !props.preventPrompt && isEffected.current;
    },
    message: env.current.t("formPrompt") || "",
  });

  useLayoutEffect(() => {
    isValidScripts.current = true;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!props.preventPrompt && isEffected.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return {
    SchemaProvider,
    dataItems: dataItems.current,
    getData: function () {
      return clone(bindData.current);
    },
  } as const;
};


export function useSchemaContext<S extends Record<string, Schema.$Any> = Record<string, Schema.$Any>>() {
  return useContext(SchemaContext) as SchemaContextProps<S>;
};

export function useSchemaEffect(
  effect: (params: SchemaEffectParameters) => void,
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
  | ((currentValue: Schema.ValueType<P, true> | null | undefined) => Schema.ValueType<P, false>)
  ;

export function useSchemaValue<D extends Schema.DataItem<Schema.$Any>>(dataItem: D) {
  const { data, dep, env, setResult } = useSchemaEffect((params) => {
    switch (params.type) {
      case "data":
        setValue(getValue);
        break;
      case "value":
        const item = params.items.find(item => item.name === dataItem.name)
        if (item) {
          setValue(item.value);
        }
        break;
      default:
        break;
    }
  });

  const [value, setValue] = useState(getValue());

  function getValue() {
    return data.current.get(dataItem.name) as Schema.ValueType<D["_"]>;
  };

  function set(value: SetValue<D["_"]>) {
    const newValue = typeof value === "function" ? value(getValue()) : value;
    const parsed = dataItem._.parser({
      dep: dep.current,
      env,
      value: newValue,
    });
    data.current.set(dataItem.name, parsed.value);
    setResult(dataItem.name, parsed.result);
    return parsed.value as Schema.ValueType<D["_"]>;
  };

  return [
    value,
    set,
  ] as const;
};

export function useSchemaResult<D extends Schema.DataItem<Schema.$Any>>(dataItem: D) {
  const schema = useSchemaEffect((params) => {
    switch (params.type) {
      case "data":
        setResult(params.results[dataItem.name]);
        break;
      case "result":
        const item = params.items.find(item => item.name === dataItem.name);
        if (item) {
          setResult(item.result);
        }
        break;
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

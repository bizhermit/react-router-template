/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SchemaProviderProps } from "$/shared/providers/schema";
import { FormManager } from "$/shared/schema/form";
import type { $ObjSchema } from "$/shared/schema/object";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type FormContextHookProps<S extends $ObjSchema<any, any>> = {
  id: string;
  schema: S;
  values?: {
    loader?: Record<string, unknown> | null | undefined;
    action?: Record<string, unknown> | null | undefined;
  };
  messages?: {
    loader?: Schema.RecordMessages | null | undefined;
    action?: Schema.RecordMessages | null | undefined;
  };
  data?: Record<string, unknown>;
  state?: "idle" | "submitting" | "loading";
  submit?: {
    callback?: (error: boolean) => (void | boolean);
  };
  reset?: {
    execValidate?: boolean;
    callback?: () => void;
  };
};

/**
 * フォーム全体のコンテキストとフォーム要素向けプロパティを構築するカスタムフック。
 *
 * `FormManager` の初期化、エラー・dirty状態の購読、submit/reset の制御、
 * loader/action 由来の values/messages/data の同期を一元的に扱う。
 *
 * @typeParam S - フォームルートのオブジェクトスキーマ型
 * @param props - フォーム識別子、スキーマ、初期値、メッセージ、状態制御オプション
 * @returns Provider と `<form>` に渡すプロパティ、およびフォーム操作用API
 */
export function useForm<const S extends $ObjSchema<any, any>>(props: FormContextHookProps<S>) {
  const id = props.id;
  const initialized = useRef({
    values: false,
    messages: false,
    data: false,
  });

  const [manager] = useState(() => {
    const ret = new FormManager<S>({
      values: props.values?.loader ?? {},
      messages: props.messages?.loader,
      data: props.data ?? {},
      schema: props.schema,
    });
    return ret;
  });

  function getHasError() {
    return manager.hasError();
  };

  const hasError = useSyncExternalStore(
    (callback) => {
      const cleanup = manager.addErrorSubscribe(callback);
      return () => cleanup();
    },
    getHasError,
    getHasError
  );

  function getIsDirty() {
    return manager.isDirty();
  };

  const isDirty = useSyncExternalStore(
    (callback) => {
      const cleanup = manager.addDirtySubscribe(callback);
      return () => cleanup;
    },
    getIsDirty,
    getIsDirty
  );

  const state = props.state || "idle";

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    if (state !== "idle") {
      console.warn(`supress submit event. state: ${state}`);
      e.preventDefault();
      return;
    }
    const { hasError } = manager.validate();
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
    manager.reset({
      execValidate: options?.execValidate ?? props.reset?.execValidate,
    });
    props.reset?.callback?.();
  }

  function handleReset(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    reset(props.reset);
  };

  function getValues() {
    return manager.getValues();
  };

  useEffect(() => {
    if (initialized.current.values) {
      if (props.values?.action) {
        manager.setValues(props.values.action, {
          preventUpdateOrigin: true,
        });
      } else {
        manager.setValues(props.values?.loader ?? {});
      }
    }
    initialized.current.values = true;
  }, [
    props.values?.loader,
    props.values?.action,
  ]);

  useEffect(() => {
    if (initialized.current.messages) {
      if (props.messages?.action) {
        manager.setMessages(props.messages.action, {
          preventUpdateOrigin: true,
        });
      } else {
        manager.setMessages(props.messages?.loader);
      }
    }
    initialized.current.messages = true;
  }, [
    props.messages?.loader,
    props.messages?.action,
  ]);

  useEffect(() => {
    if (initialized.current.data) {
      manager.setData(props.data);
    }
    initialized.current.data = true;
  }, [props.data]);

  return {
    id,
    providerProps: {
      formId: id,
      formManager: manager,
      formState: state,
    } as const satisfies SchemaProviderProps,
    props: {
      noValidate: true,
      onSubmit: handleSubmit,
      onReset: handleReset,
    } as const satisfies React.FormHTMLAttributes<HTMLFormElement>,
    items: manager.getFormItems(),
    hasError,
    state,
    handleSubmit,
    handleReset,
    reset,
    isDirty,
    getValues,
  } as const;
};

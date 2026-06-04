/* eslint-disable @typescript-eslint/no-explicit-any */
import { use, useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { FieldSetContext } from "../../providers/field-set";
import type { SchemaItem } from "../../schema/core";
import type { FormItem } from "../../schema/form";
import { getResultMessage } from "../../schema/message";
import { I18nContext } from "../i18n";
import { FormContext } from "./context";

export type FormItemHookProps = {
  hideMessage?: boolean;
  omitOnSubmit?: boolean;
};

/**
 * 単一フォーム項目の状態と操作APIを提供するカスタムフック。
 *
 * 値・メッセージ・注入パラメータを購読し、fieldset 状態やフォーム送信状態を加味して
 * 項目の表示モード（enabled / readonly / disabled / hidden）を決定する。
 * また、参照項目の値が変化した際には dirty な項目のみ再バリデーションを行う。
 *
 * @typeParam S - フォーム項目に対応するスキーマ型
 * @param formItem - 状態を解決する対象のフォーム項目
 * @param props - 表示制御オプション（`hideMessage` など）
 * @returns フォーム項目の描画と更新に必要な状態・操作関数をまとめたAPI
 */
export function useFormItem<const S extends SchemaItem<any>>(
  formItem: FormItem<S>,
  props: FormItemHookProps
) {
  const t = use(I18nContext).t;
  const fs = use(FieldSetContext);
  const {
    id: schemaId,
    manager: context,
    state: formState,
  } = use(FormContext);

  const [{
    schemaItem,
    name,
    label,
    id,
  }] = useState(() => {
    const schemaItem = formItem.getSchemaItem();
    const name = formItem.getName();
    const label = t(schemaItem.getLabel() as I18nTextKey);
    const id = `${schemaId}_${name}`;
    return {
      schemaItem,
      name,
      label,
      id,
    };
  });

  const injectParamsSubscribe = useCallback((callback: () => void) => {
    const cleanup = context.addInjectParamsSubscribe(() => callback);
    return () => cleanup();
  }, [context]);

  function getInjectParams() {
    return context.getInjectParams();
  };

  const injectParams = useSyncExternalStore(
    injectParamsSubscribe,
    getInjectParams,
    getInjectParams
  );

  const refValuesStringSubscribe = useCallback((callback: () => void) => {
    const cleanups = formItem.getRefs().map(ref => {
      return context.addValuesSubscribe(ref, callback);
    });
    return () => {
      cleanups.forEach(cleanup => cleanup());
    };
  }, [
    formItem,
    context,
  ]);

  function getRefValuesString() {
    return formItem.getRefsValuesString();
  };

  const refValuesString = useSyncExternalStore(
    refValuesStringSubscribe,
    getRefValuesString,
    getRefValuesString
  );

  const valueSubscribe = useCallback((callback: () => void) => {
    const cleanup = context.addValuesSubscribe(name, callback);
    return () => cleanup();
  }, [
    context,
    name,
  ]);

  function getValue() {
    return context.getValue<Schema.Nullable<Schema.InferValue<S>>>(name);
  };

  const value = useSyncExternalStore(
    valueSubscribe,
    getValue,
    getValue
  );

  const messageSubscribe = useCallback((callback: () => void) => {
    const cleanup = context.addMessageSubscribe(name, callback);
    return () => cleanup();
  }, [
    context,
    name,
  ]);

  function getMessage() {
    return context.getMessage(name);
  };

  const message = useSyncExternalStore(
    messageSubscribe,
    getMessage,
    getMessage
  );

  function setValue(value: unknown) {
    return formItem.setValue(value);
  };

  const mode = formItem.getMode(injectParams);
  let state: Schema.Mode = "enabled";
  if (mode === "hidden") {
    state = "hidden";
  } else if (fs.disabled || mode === "disabled") {
    state = "disabled";
  } else if (fs.readOnly || mode === "readonly" || formState === "loading" || formState === "submitting") {
    state = "readonly";
  }

  const isInvalid = message?.type === "e";
  let errormMessageId: string | undefined;
  let errormessage: string | undefined;
  if (isInvalid) {
    if (props.hideMessage) {
      errormessage = getResultMessage(use(I18nContext).t, message);
    } else {
      errormMessageId = errormessage = `${id}__msg`;
    }
  }

  useEffect(() => {
    if (formItem.isDirty()) {
      formItem.validate();
    }
  }, [refValuesString]);

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
    refValuesString,
  } as const;
};

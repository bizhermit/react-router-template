import { clone, equals } from "$/shared/objects";
import { getArrayIndex, getRelativeName, getValue, setValue, splitName } from "$/shared/objects/data";
import { getHasError, mergeRecordMessages } from ".";
import { $ArrSchema } from "./array";
import type { SchemaItem } from "./core";
import { $ObjSchema } from "./object";

/**
 *
 * @param formContext
 * @param props
 * @param prefixName
 * @returns
 */
export function convertToFormItems(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formContext: FormContext<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, SchemaItem<any>>,
  prefixName?: string | undefined
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formItems: Record<string, FormItem<any>> = {};
  const pn = prefixName ? `${prefixName}.` : "";

  Object.entries(props).forEach(([name, item]) => {
    formItems[name] = new FormItem(
      formContext,
      `${pn}${name}`,
      item,
    );
  });

  return formItems;
};

export function convertToMessageMap(messages: Schema.RecordMessages | null | undefined) {
  const ret = new Map<string, Schema.Message | undefined>();
  if (messages == null) return ret;
  Object.entries(messages).forEach(([name, msgs]) => {
    if (!msgs || msgs.length === 0) return;
    const msg = msgs.find(msg => msg.type === "e") ?? msgs[0];
    ret.set(name, msg);
  });
  return ret;
};

export function equalMessage(
  msg1: Schema.Message | null | undefined,
  msg2: Schema.Message | null | undefined
) {
  if (equals(msg1, msg2)) return true;
  if (equals(msg1?.code, msg2?.code)) return true;
  return false;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class FormContext<S extends $ObjSchema<any, any>> {

  protected schema: S;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected formItems: Record<string, FormItem<any>>;

  protected originValues: Record<string, unknown>;
  protected values: Record<string, unknown>;

  protected originMessages: Map<string, Schema.Message | undefined>;
  protected messages: Map<string, Schema.Message | undefined>;

  protected error: boolean;

  protected injectParams: Schema.InjectParams;

  protected valuesSubscribes: Map<string, Set<() => void>>;
  protected messagesSubscribes: Map<string, Set<() => void>>;
  protected errorSubscribes: Set<() => void>;
  protected injectParamsSubscribes: Set<() => void>;
  protected dirtyFiels: Set<string>;
  protected dirtySubscribes: Set<() => void>;

  constructor(init: {
    schema: S;
    values: Record<string, unknown>;
    messages?: Schema.RecordMessages | null | undefined;
    data?: Record<string, unknown>;
  }) {
    this.schema = init.schema;
    this.injectParams = {
      data: clone(init.data ?? {}),
      isServer: false,
      values: this.values = init.values,
    };

    this.messages = convertToMessageMap(init.messages);
    this.originMessages = clone(this.messages);
    this.error = getHasError(init.messages);

    this.schema.initialize(this.injectParams);
    const parsed = this.schema.parse(this.injectParams.values, this.injectParams);
    this.injectParams.values = this.values = parsed.value ?? {};
    this.originValues = clone(this.values);

    this.formItems = convertToFormItems(
      this,
      this.schema.getChildren()
    );

    this.valuesSubscribes = new Map();
    this.messagesSubscribes = new Map();
    this.errorSubscribes = new Set();
    this.injectParamsSubscribes = new Set();
    this.dirtyFiels = new Set();
    this.dirtySubscribes = new Set();
  }

  public getFormItems() {
    return this.formItems as Schema.ObjectFormItems<S>;
  }

  public getInjectParams() {
    return this.injectParams;
  }

  public addInjectParamsSubscribe(listener: () => void) {
    this.injectParamsSubscribes.add(listener);
    return () => {
      this.injectParamsSubscribes.delete(listener);
    };
  }

  public setMessages(
    messages: Schema.RecordMessages | null | undefined,
    options?: {
      preventUpdateOrigin?: boolean;
    }
  ) {
    this.messages = convertToMessageMap(messages);
    if (!options?.preventUpdateOrigin) {
      this.originMessages = clone(this.messages);
    }
    this.callMessageSubscribes();
    this.updateHasError();
  }

  public getMessage(name: string) {
    return this.messages.get(name);
  }

  public setMessage(
    name: string,
    message: Schema.Message | null | undefined,
    options?: {
      preventCallSubscribes?: boolean;
      preventUpdateHasError?: boolean;
    }
  ) {
    const current = this.messages.get(name);
    if (equalMessage(current, message)) return false;
    if (message) {
      this.messages.set(name, message);
    } else {
      this.messages.delete(name);
    }
    if (!options?.preventCallSubscribes) {
      this.messagesSubscribes.get(name)?.forEach(listener => listener());
    }
    if (!options?.preventUpdateHasError) {
      this.updateHasError();
    }
    return true;
  }

  public addMessageSubscribe(name: string, listener: () => void) {
    if (!this.messagesSubscribes.has(name)) this.messagesSubscribes.set(name, new Set());
    const listeners = this.messagesSubscribes.get(name)!;
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  public hasError() {
    return this.error;
  }

  protected setHasError(error: boolean) {
    if (this.error === error) return this;
    this.error = error;
    this.errorSubscribes.forEach(fn => fn());
    return this;
  }

  public updateHasError() {
    this.setHasError(
      Array.from(this.messages.values()).some(
        message => message?.type === "e"
      )
    );
    return this;
  }

  public addErrorSubscribe(listener: () => void) {
    this.errorSubscribes.add(listener);
    return () => {
      this.errorSubscribes.delete(listener);
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getSchemaItem(name: string): SchemaItem<any> | null {
    const names = splitName(name);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let schemaItem: SchemaItem<any> = this.schema;
    for (const n of names) {
      if (schemaItem == null) {
        console.warn(`invalid access: ${name}`);
        return null;
      }

      const r = getArrayIndex(n);
      if (r) {
        const i = Number(r[1]);
        if (isNaN(i)) {
          console.warn(`invalid access ${name}`);
          return null;
        }
        if (!(schemaItem instanceof $ArrSchema)) {
          console.warn(`invalid access: ${name}`);
          return null;
        }
        schemaItem = schemaItem.getChild();
        continue;
      }
      if (!(schemaItem instanceof $ObjSchema)) {
        console.warn(`invalid access: ${name}`);
        return null;
      }

      schemaItem = schemaItem.getSchemaItem(n);
    }
    return schemaItem;
  }

  public getValues() {
    return clone(this.values);
  }

  public setValues(
    values: Record<string, unknown>,
    options?: {
      preventUpdateOrigin?: boolean;
      execValidate?: boolean;
    }
  ) {
    this.injectParams.values = this.values = values ?? {};
    if (options?.execValidate) {
      this.validate();
    } else {
      const parsed = this.schema.parse(this.injectParams.values, this.injectParams);
      this.injectParams.values = parsed.value ?? {};
      this.callValuesSubscribes();
    }

    if (!options?.preventUpdateOrigin) {
      this.originValues = clone(this.values);
      this.dirtyFiels = new Set();
      this.dirtySubscribes.forEach(listener => listener());
    }
    return this;
  }

  public setOriginValue(originValue: Record<string, unknown>) {
    const parsed = this.schema.parse(originValue, {
      ...this.injectParams,
      values: originValue,
    });
    this.originValues = parsed.value ?? {};
    return this;
  }

  public getValue<T = unknown>(name: string) {
    return getValue<T>(this.values, name)[0];
  }

  public getOriginValue<T = unknown>(name: string) {
    return getValue<T>(this.originValues, name)[0];
  }

  public setValue(name: string, value: unknown, options?: {
    skipValidate?: boolean;
  }) {
    const schemaItem = this.getSchemaItem(name);
    if (schemaItem == null) {
      console.warn(`invalid property: ${name}`);
      return {
        value: undefined,
        hasChanged: false,
        messages: [],
        schemaItem: null,
      } as const;
    }

    const isReplace = schemaItem instanceof $ArrSchema || schemaItem instanceof $ObjSchema;

    const parsed = schemaItem.parse(value, {
      ...this.injectParams,
      name,
    });

    const hasChanged = setValue(this.values, name, parsed.value);
    const validated = (hasChanged && !options?.skipValidate) ?
      schemaItem.validate(parsed.value, {
        ...this.injectParams,
        name,
      }) : {};

    const messages = mergeRecordMessages(parsed.messages, validated);

    if (hasChanged) {
      this.valuesSubscribes.get(name)?.forEach(fn => fn());
    }

    const updateMessages = Object.entries(messages).reduce((prev, [name, msgs]) => {
      const message = msgs?.find(msg => msg.type === "e");
      if (isReplace) {
        prev.push({ name, message });
        return prev;
      }
      const current = this.messages.get(name);
      if (equalMessage(current, message)) return prev;
      prev.push({ name, message });
      return prev;
    }, [] as ({ name: string; message: Schema.Message | undefined; }[]));

    if (isReplace) {
      const keys = Array.from(this.messages.keys());
      const regexp = new RegExp(`${name}($|\\[\\d\\]|.)`);
      keys.forEach(key => {
        if (regexp.test(key)) {
          this.messages.delete(key);
        }
      });
    }

    updateMessages.forEach(({ name, message }) => {
      this.messages.set(name, message);
      this.messagesSubscribes.get(name)?.forEach(fn => fn());
    });

    this.updateHasError();
    if (!this.dirtyFiels.has(name)) {
      this.dirtyFiels.add(name);
      this.dirtySubscribes.forEach(listener => listener());
    }

    return {
      value: parsed.value,
      hasChanged,
      messages,
      schemaItem,
    } as const;
  }

  public addValuesSubscribe(name: string, listener: () => void) {
    if (!this.valuesSubscribes.has(name)) this.valuesSubscribes.set(name, new Set());
    const listeners = this.valuesSubscribes.get(name)!;
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  public callValuesSubscribes() {
    this.valuesSubscribes.forEach(listeners => {
      listeners.forEach(listener => listener());
    });
    return this;
  }

  public callMessageSubscribes() {
    this.messagesSubscribes.forEach(listeners => {
      listeners.forEach(listener => listener());
    });
    return this;
  }

  public setData(data: Record<string, unknown> | null | undefined) {
    this.injectParams.data = clone(data ?? {});
    this.injectParamsSubscribes.forEach(listener => listener());
    return this;
  }

  public validate(options?: {
    preventUpdateValues?: boolean;
    preventUpdateMessages?: boolean;
  }) {
    const parsed = this.schema.parse(this.injectParams.values, this.injectParams);
    this.injectParams.values = parsed.value ?? {};
    const validated = this.schema.validate(parsed.value, this.injectParams);

    const messages = mergeRecordMessages(parsed.messages, validated);
    const hasError = getHasError(messages);

    if (!options?.preventUpdateValues) {
      this.injectParams.values = this.values = parsed.value ?? {};
      this.callValuesSubscribes();
    }
    if (!options?.preventUpdateMessages) {
      this.messages = convertToMessageMap(messages);
      this.callMessageSubscribes();
      this.updateHasError();
    }

    return {
      hasError,
      messages,
    } as const;
  }

  public reset(options?: {
    execValidate?: boolean;
  }) {
    this.injectParams.values = this.values = clone(this.originValues);
    this.dirtyFiels = new Set();
    this.dirtySubscribes.forEach(listener => listener());

    if (options?.execValidate) {
      this.validate();
    } else {
      this.messages = clone(this.originMessages);
      this.callValuesSubscribes();
      this.callMessageSubscribes();
      this.updateHasError();
    }
  }

  public addDirtySubscribe(listener: () => void) {
    this.dirtySubscribes.add(listener);
    return () => {
      this.dirtySubscribes.delete(listener);
    };
  };

  public isDirty(name?: string) {
    if (!name) return this.dirtyFiels.size > 0;
    return this.dirtyFiels.has(name);
  }

};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class FormItem<S extends SchemaItem<any>> {

  protected refs: string[];

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected formContext: FormContext<any>,
    protected name: string,
    protected schemaItem: S
  ) {
    const refs = schemaItem.getRefs();
    this.refs = refs?.map(ref => getRelativeName(name, ref)) ?? [];
  }

  public getName() {
    return this.name;
  }

  public getLabel() {
    return this.schemaItem.getLabel();
  }

  public getActionType() {
    return this.schemaItem.getActionType();
  }

  public getRefs() {
    return this.refs;
  }

  public getMode(params: Schema.InjectParams) {
    return this.schemaItem.getMode(params);
  }

  public getSchemaItem() {
    return this.schemaItem;
  }

  public getValue() {
    return this.formContext.getValue<Schema.Infer<S>>(this.name);
  }

  public setValue(value: unknown) {
    return this.formContext.setValue(this.name, value);
  }

  public initializeValue() {
    this.formContext.setValue(this.name, this.getValue(), {
      skipValidate: true,
    });
  }

  public validate() {
    const value = this.getValue();
    const injectParams = {
      ...this.formContext.getInjectParams(),
      name: this.name,
    };
    const parsed = this.schemaItem.parse(value, injectParams);
    const validated = this.schemaItem.validate(parsed.value, injectParams);
    const messages = mergeRecordMessages(parsed.messages, validated);

    Object.entries(messages).forEach(([name, msgs]) => {
      const msg = msgs?.find(msg => msg.type === "e") ?? msgs?.[0];
      this.formContext.setMessage(name, msg, {
        preventCallSubscribes: true,
        preventUpdateHasError: true,
      });
    });
    this.formContext.callMessageSubscribes();
    this.formContext.updateHasError();
  }

};

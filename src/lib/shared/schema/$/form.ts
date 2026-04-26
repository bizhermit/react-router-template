import { equals } from "$/shared/objects";
import { getArrayIndex, getValue, setValue, splitName } from "$/shared/objects/data";
import { mergeRecordMessages } from ".";
import { $ArrSchema } from "./array";
import type { SchemaItem } from "./core";
import { $ObjSchema } from "./object";

export function convertToFormItems(
  formContext: FormContext<any>,
  props: Record<string, SchemaItem<any>>,
  prefixName?: string | undefined
) {
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

export class FormContext<S extends $ObjSchema<any, any>> {

  protected schema: S;
  protected values: Record<string, any>;
  protected data: Record<string, any>;
  protected isServer: boolean;

  protected formItems: Record<string, FormItem<any>>;

  protected messages: Map<string, $Schema.Message | undefined>;
  protected messagesSubscribes: Map<string, Set<() => void>>;

  protected error: boolean;
  protected errorSubscribes: Set<() => void>;

  protected valuesSubscribes: Map<string, Set<() => void>>;

  constructor(init: {
    schema: S;
    values: Record<string, any>;
    data: Record<string, any>;
  }) {
    this.schema = init.schema;
    this.values = init.values;
    this.data = init.data;
    this.isServer = false;

    this.messages = new Map();
    this.messagesSubscribes = new Map();

    this.error = false;
    this.errorSubscribes = new Set();

    this.valuesSubscribes = new Map();

    this.formItems = convertToFormItems(
      this,
      init.schema.getChildren()
    );
  }

  public getFormItems() {
    return this.formItems as $Schema.ObjectFormItems<S>;
  }

  public getInjectParams(): $Schema.InjectParams {
    return {
      values: this.values,
      data: this.data,
      isServer: this.isServer,
    } as const;
  }

  public setMessages() {
    // TODO:
  }

  public getMessage(name: string) {
    return this.messages.get(name);
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

  public setHasError(error: boolean) {
    if (this.error === error) return this;
    this.error = error;
    this.errorSubscribes.forEach(fn => fn());
    return this;
  }

  public addErrorSubscribe(listener: () => void) {
    this.errorSubscribes.add(listener);
    return () => {
      this.errorSubscribes.delete(listener);
    };
  };

  public getSchemaItem(name: string): SchemaItem<any> | null {
    const names = splitName(name);
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
    return this.values;
  }

  public getValue<T = unknown>(name: string) {
    return getValue<T>(this.values, name)[0];
  }

  public setValue(name: string, value: unknown) {
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

    const parsed = schemaItem.parse(value, {
      data: this.data,
      isServer: this.isServer,
      values: this.values,
      name,
    });

    // TODO: rollback when error
    const hasChanged = setValue(this.values, name, parsed.value);
    const validated = hasChanged ? schemaItem.validate(parsed.value, {
      data: this.data,
      isServer: this.isServer,
      values: this.values,
      name,
    }) : {};

    const messages = mergeRecordMessages(parsed.messages, validated);

    if (hasChanged) {
      this.valuesSubscribes.get(name)?.forEach(fn => fn());
    }

    Object.entries(messages).forEach(([name, msgs]) => {
      const current = this.messages.get(name);
      const message = msgs?.find(msg => msg.type === "e");
      if (equals(current, message)) return;
      if (equals(current?.code, message?.code)) return;

      this.messages.set(name, message);
      this.messagesSubscribes.get(name)?.forEach(fn => fn());
    });

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

};

export class FormItem<S extends SchemaItem<any>> {

  constructor(
    protected formContext: FormContext<any>,
    protected name: string,
    protected schemaItem: S
  ) {

  }

  public getName() {
    return this.name;
  }

  public getSchemaItem() {
    return this.schemaItem;
  }

  public getValue() {
    return this.formContext.getValue<$Schema.Infer<S>>(this.name);
  }

  public setValue(value: unknown) {
    return this.formContext.setValue(this.name, value);
  }

};

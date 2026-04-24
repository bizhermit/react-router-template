import { getArrayIndex, getValue, setValue, splitName } from "$/shared/objects/data";
import { $ArrSchema } from "./array";
import type { SchemaItem } from "./core";
import { $ObjSchema } from "./object";

export class FormContext<S extends $ObjSchema<any, any>> {

  protected schema: S;
  protected values: Record<string, any>;
  protected data: Record<string, any>;
  protected isServer: boolean;

  constructor(init: {
    schema: S;
    values: Record<string, any>;
    data: Record<string, any>;
  }) {
    this.schema = init.schema;
    this.values = init.values;
    this.data = init.data;
    this.isServer = false;
  }

  public getInjectParams(): $Schema.InjectParams {
    return {
      values: this.values,
      data: this.data,
      isServer: this.isServer,
    } as const;
  }

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
        schemaItem = schemaItem.getSchemaItem();
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
      console.warn(`invalid access: ${name}`);
      return {
        value: undefined,
        hasChanged: false,
        messages: [],
        schemaItem: null,
      } as const;
    }

    const messages: $Schema.Message[] = [];

    const parsed = schemaItem.parse(value, {
      data: this.data,
      isServer: this.isServer,
      values: this.values,
      name,
    });
    if (parsed.messages) {
      messages.push(...parsed.messages);
    }

    const hasChanged = setValue(this.values, name, parsed.value);
    if (hasChanged) {
      const msgs = schemaItem.validate(parsed.value, {
        data: this.data,
        isServer: this.isServer,
        values: this.values,
        name,
      });
      messages.push(...msgs);
    }

    return {
      value: parsed.value,
      hasChanged,
      messages,
      schemaItem,
    } as const;
  }

};

export class FormItem<S extends SchemaItem<any>> {

  constructor(
    protected formContext: FormContext<any>,
    protected name: string,
    protected schemaItem: S
  ) {

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

import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { getValidationValue, InputField, Placeholder, type InputWrapProps } from "./common";
import { getBooleanSource } from "./utilities";
import { clsx, ZERO_WIDTH_SPACE } from "../utilities";
import { useSchemaItem } from "~/components/schema/hooks";
import { isEmpty } from "~/components/objects";

type SelectBoxSchemaProps = Schema.$String | Schema.$Number | Schema.$Boolean;

export type SelectBoxProps<D extends Schema.DataItem<SelectBoxSchemaProps>> = InputWrapProps & {
  $: D;
  placeholder?: string;
  emptyText?: string;
  children?: ReactNode;
};

export function SelectBox<D extends Schema.DataItem<SelectBoxSchemaProps>>({
  placeholder,
  emptyText,
  children,
  ...$props
}: SelectBoxProps<D>) {
  const ref = useRef<HTMLSelectElement>(null!);

  const {
    name,
    dataItem,
    state,
    required,
    value,
    setValue,
    result,
    label,
    invalid,
    errormessage,
    data,
    dep,
    env,
    props,
  } = useSchemaItem<Schema.DataItem<SelectBoxSchemaProps>>($props, {
    effect: function ({ value }) {
      if (!ref.current) return;
      const sv = String(value ?? "");
      if (ref.current.value !== sv) ref.current.value = sv;
    },
    effectContext: function(p) {
      if ("source" in dataItem._) {
        setSource(getValidationValue(p, dataItem._.source) ?? []);
      }
    },
  });

  const [source, setSource] = useState<Schema.Source<any>>(() => {
    if ("source" in dataItem._) {
      return getValidationValue({
        data,
        dep,
        env,
        label: dataItem.label,
      }, dataItem._.source) ?? [];
    }
    if (dataItem._.type === "bool") {
      return getBooleanSource({
        dataItem: dataItem as Schema.DataItem<Schema.$Boolean>,
        t: env.t,
      });
    }
    return [];
  });

  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    if (!state.current.enabled) return;
    setValue(e.target.value);
  };

  return (
    <InputField
      {...props}
      core={{
        state,
        result,
      }}
    >
      <select
        className="ipt-main ipt-select"
        ref={ref}
        name={name}
        disabled={!state.current.enabled}
        aria-disabled={state.current.disabled}
        aria-readonly={state.current.readonly}
        required={required}
        defaultValue={value as string || undefined}
        onChange={handleChange}
        aria-label={label}
        aria-invalid={invalid}
        aria-errormessage={errormessage}
      >
        {children ?? <>
          <option
            value=""
            hidden={required}
            data-notext={isEmpty(emptyText)}
          >
            {emptyText || ZERO_WIDTH_SPACE}
          </option>
          {
            source.map(item => {
              return (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.text}
                </option>
              );
            })
          }
        </>}
      </select>
      <Placeholder>{placeholder}</Placeholder>
      <div
        className={clsx(
          "ipt-btn",
          !state.current.enabled && "opacity-0"
        )}
      />
      {!state.current.disabled && state.current.readonly &&
        <input
          type="hidden"
          name={name}
          value={value as string || undefined}
        />
      }
    </InputField>
  );
};
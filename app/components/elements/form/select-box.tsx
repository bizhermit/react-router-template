import { useRef, type ChangeEvent, type ReactNode } from "react";
import { isEmpty } from "~/components/objects";
import { useSchemaItem } from "~/components/schema/hooks";
import { clsx, ZERO_WIDTH_SPACE } from "../utilities";
import { InputField, Placeholder, type InputWrapProps } from "./common";
import { useSource } from "./utilities";

type SelectBoxSchemaProps = Schema.$String | Schema.$Number | Schema.$Boolean;

export type SelectBoxProps<D extends Schema.DataItem<SelectBoxSchemaProps>> = InputWrapProps & {
  $: D;
  placeholder?: string;
  emptyText?: string;
  source?: Schema.Source<Schema.ValueType<D["_"]>>;
  children?: ReactNode;
};

export function SelectBox<D extends Schema.DataItem<SelectBoxSchemaProps>>({
  placeholder,
  emptyText,
  children,
  source: propsSource,
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
    env,
    getCommonParams,
    omitOnSubmit,
    props,
  } = useSchemaItem<Schema.DataItem<SelectBoxSchemaProps>>($props, {
    effect: function ({ value }) {
      if (!ref.current) return;
      const sv = String(value ?? "");
      if (ref.current.value !== sv) ref.current.value = sv;
    },
    effectContext: function () {
      resetDataItemSource();
    },
  });

  const { source, resetDataItemSource } = useSource({
    dataItem,
    propsSource,
    env,
    getCommonParams,
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
        name={omitOnSubmit ? undefined : name}
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
        {
          children ?? <>
            <option
              value=""
              hidden={required}
              data-notext={isEmpty(emptyText)}
            >
              {emptyText || ZERO_WIDTH_SPACE}
            </option>
            {
              source?.map(item => {
                const key = String(item.value);
                return (
                  <option
                    key={key}
                    value={key}
                  >
                    {item.text}
                  </option>
                );
              })
            }
          </>
        }
      </select>
      <Placeholder>{placeholder}</Placeholder>
      <div
        className={clsx(
          "ipt-btn",
          !state.current.enabled && "opacity-0"
        )}
      />
      {
        !state.current.disabled && state.current.readonly &&
        <input
          type="hidden"
          name={name}
          value={value as string || undefined}
        />
      }
    </InputField>
  );
};

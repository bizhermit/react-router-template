import { useEffect, useRef, useState, type ChangeEvent, type MouseEvent } from "react";
import { useSchemaItem } from "~/components/schema/hooks";
import { getValidationValue, InputGroup, InputLabel, InputLabelText, type InputWrapProps } from "./common";
import { getBooleanSource } from "./utilities";

type RadioButtonsSchemaProps = Schema.$String | Schema.$Number | Schema.$Boolean;

export type RadioButtonsProps<D extends Schema.DataItem<RadioButtonsSchemaProps>> =
  & InputWrapProps
  & {
    $: D;
    source?: Schema.Source<Schema.ValueType<D["_"]>>;
  };

export function RadioButtons<D extends Schema.DataItem<RadioButtonsSchemaProps>>({
  source: propsSource,
  ...$props
}: RadioButtonsProps<D>) {
  const ref = useRef<HTMLDivElement>(null!);

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
  } = useSchemaItem<Schema.DataItem<RadioButtonsSchemaProps>>($props, {
    effect: function ({ value }) {
      if (!ref.current) return;
      const sv = String(value ?? "");
      const target = ref.current.querySelector(`input[type="radio"][value="${sv}"]`) as HTMLInputElement;
      if (target) {
        target.checked = true;
      } else {
        ref.current.querySelectorAll(`input[type="radio"]:checked`).forEach(elem => {
          (elem as HTMLInputElement).checked = false;
        });
      }
    },
    effectContext: function (p) {
      if (propsSource == null && "source" in dataItem._) {
        setSource(getValidationValue(p, dataItem._.source) ?? []);
      }
    },
  });

  const [source, setSource] = useState<Schema.Source<unknown>>(() => {
    if (propsSource) return propsSource;
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

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (!state.current.enabled) return;
    setValue(e.target.value);
  };

  function handleClick(e: MouseEvent<HTMLInputElement>) {
    if (!state.current.enabled) return;
    if (required) return;
    e.currentTarget.checked = false;
    setValue(undefined);
  };

  useEffect(() => {
    if (propsSource) {
      setSource(propsSource);
    }
  }, [propsSource]);

  return (
    <InputGroup
      {...props}
      ref={ref}
      core={{
        state,
        result,
      }}
    >
      {source.map(item => {
        const key = String(item.value);
        return (
          <InputLabel key={key}>
            <input
              className="ipt-point ipt-radio"
              type="radio"
              name={name}
              disabled={!state.current.enabled}
              aria-disabled={state.current.disabled}
              aria-readonly={state.current.readonly}
              required={required}
              value={key}
              defaultChecked={item.value === value}
              onChange={handleChange}
              onClick={handleClick}
              aria-label={`${label ? `${label} - ` : ""}${item.text}`}
              aria-invalid={invalid}
              aria-errormessage={errormessage}
            />
            <InputLabelText>
              {item.text}
            </InputLabelText>
          </InputLabel>
        );
      })}
      {
        !state.current.disabled && state.current.readonly &&
        <input
          type="hidden"
          name={name}
          value={value as string || undefined}
        />
      }
    </InputGroup>
  );
};

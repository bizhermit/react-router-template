import { useRef, type ChangeEvent, type MouseEvent } from "react";
import { useSchemaItem } from "~/components/schema/hooks";
import { InputDummyFocus, InputGroup, InputLabel, InputLabelText, type InputWrapProps } from "./common";
import { useSource } from "./utilities";

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
    env,
    getCommonParams,
    omitOnSubmit,
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

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (state.current !== "enabled") return;
    setValue(e.target.value);
  };

  function handleClick(e: MouseEvent<HTMLInputElement>) {
    if (state.current !== "enabled") return;
    if (required) return;
    e.currentTarget.checked = false;
    setValue(undefined);
  };

  return (
    <InputGroup
      {...props}
      ref={ref}
      core={{
        state,
        result,
      }}
    >
      {source?.map((item, index) => {
        const key = String(item.value);
        const isSelected = item.value === value;

        return (
          <InputLabel key={key}>
            <input
              className="ipt-point ipt-radio"
              type="radio"
              name={name}
              disabled={state.current !== "enabled"}
              aria-disabled={state.current === "disabled"}
              aria-readonly={state.current === "readonly"}
              required={required}
              value={key}
              defaultChecked={isSelected}
              onChange={handleChange}
              onClick={handleClick}
              aria-label={`${label ? `${label} - ` : ""}${item.text}`}
              aria-invalid={invalid}
              aria-errormessage={errormessage}
            />
            <InputLabelText>
              {item.text}
            </InputLabelText>
            {
              state.current === "readonly" && ((value == null && index === 0) || isSelected) &&
              <InputDummyFocus />
            }
          </InputLabel>
        );
      })}
      {
        state.current === "readonly" &&
        <input
          type="hidden"
          name={omitOnSubmit ? undefined : name}
          value={value as string || undefined}
        />
      }
    </InputGroup>
  );
};

import { useRef, type ChangeEvent, type ReactNode } from "react";
import { useSchemaItem } from "~/components/schema/hooks";
import { InputLabel, InputLabelText, type InputWrapProps } from "./common";

export type SwitchBoxProps<D extends Schema.DataItem<Schema.$Boolean>> = InputWrapProps & {
  $: D;
  children?: ReactNode;
};

export function SwitchBox<D extends Schema.DataItem<Schema.$Boolean>>({
  children,
  ...$props
}: SwitchBoxProps<D>) {
  const ref = useRef<HTMLInputElement>(null!);

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
    props,
  } = useSchemaItem<Schema.DataItem<Schema.$Boolean>>($props, {
    effect: function ({ value }) {
      if (!ref.current) return;
      const isSwitch = value === dataItem._.trueValue;
      if (isSwitch !== ref.current.checked) ref.current.checked = isSwitch;
    },
  });

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (!state.current.enabled) return;
    setValue(e.target.checked ? dataItem._.trueValue : dataItem._.falseValue);
  };

  return (
    <InputLabel
      {...props}
      core={{
        state,
        result,
      }}
    >
      <input
        className="ipt-switch"
        ref={ref}
        type="checkbox"
        name={name}
        disabled={!state.current.enabled}
        aria-disabled={state.current.disabled}
        aria-readonly={state.current.readonly}
        required={required}
        defaultChecked={value === dataItem._.trueValue}
        onChange={handleChange}
        aria-label={label}
        aria-invalid={invalid}
        aria-errormessage={errormessage}
      />
      <InputLabelText>
        {children}
      </InputLabelText>
      {
        !state.current.disabled && state.current.readonly &&
        <input
          type="hidden"
          name={name}
          value={value as string || undefined}
        />
      }
    </InputLabel>
  );
};

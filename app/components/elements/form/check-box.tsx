import { useRef, type ChangeEvent, type ReactNode } from "react";
import { useSchemaItem } from "~/components/schema/hooks";
import { InputDummyFocus, InputLabel, InputLabelText, type InputWrapProps } from "./common";

export type CheckBoxProps<D extends Schema.DataItem<Schema.$Boolean>> = InputWrapProps & {
  $: D;
  children?: ReactNode;
};

export function CheckBox<D extends Schema.DataItem<Schema.$Boolean>>({
  children,
  ...$props
}: CheckBoxProps<D>) {
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
    omitOnSubmit,
    props,
  } = useSchemaItem<Schema.DataItem<Schema.$Boolean>>($props, {
    effect: function ({ value }) {
      if (!ref.current) return;
      const isCheck = value === dataItem._.trueValue;
      if (isCheck !== ref.current.checked) ref.current.checked = isCheck;
    },
  });

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (state.current !== "enabled") return;
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
        className="ipt-point ipt-check"
        ref={ref}
        type="checkbox"
        name={omitOnSubmit ? undefined : name}
        disabled={state.current !== "enabled"}
        aria-disabled={state.current === "disabled"}
        aria-readonly={state.current === "readonly"}
        required={required}
        value={String(dataItem._.trueValue)}
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
        state.current === "readonly" &&
        <>
          <input
            type="hidden"
            name={name}
            value={value as string || undefined}
          />
          <InputDummyFocus />
        </>
      }
    </InputLabel>
  );
};

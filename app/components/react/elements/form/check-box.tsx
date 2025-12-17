import { useRef, type ChangeEvent, type ReactNode } from "react";
import { useSchemaItem } from "~/components/react/hooks/schema";
import { clsx, getColorClassName } from "../utilities";
import { InputDummyFocus, InputLabel, InputLabelText, type InputWrapProps } from "./common";
import type { FormItemHookProps } from "./hooks";

export type CheckBoxProps<D extends Schema.DataItem<Schema.$Boolean>> = InputWrapProps & {
  $: D;
  appearance?: "checkbox" | "button";
  color?: StyleColor;
  hook?: FormItemHookProps;
  children?: ReactNode;
};

export function CheckBox<D extends Schema.DataItem<Schema.$Boolean>>({
  autoFocus,
  appearance = "checkbox",
  color,
  hook,
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

  if (hook) {
    hook.focus = () => ref.current.focus();
  }

  const colorClassName = getColorClassName(color);

  return (
    <InputLabel
      {...props}
      core={{
        state,
        result,
        className: appearance === "button" ?
          clsx(
            "_ipt-label-button",
            colorClassName,
          ) :
          undefined,
      }}
    >
      <input
        className={
          appearance === "checkbox" ?
            clsx(
              "_ipt-point _ipt-check",
              colorClassName,
            ) :
            "appearance-none"
        }
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
        autoFocus={autoFocus}
      />
      <InputLabelText
        className={appearance === "button" ? "px-0" : undefined}
      >
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

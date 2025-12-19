import { useRef, type ChangeEvent, type ReactNode } from "react";
import { useSchemaItem } from "~/components/react/hooks/schema";
import { clsx, getColorClassName } from "../utilities";
import { InputDummyFocus, InputLabel, InputLabelText, WithMessage, type InputWrapProps } from "./common";
import type { FormItemHookProps } from "./hooks";

export type SwitchBoxProps<D extends Schema.DataItem<Schema.$Boolean>> = InputWrapProps & {
  $: D;
  color?: StyleColor;
  hook?: FormItemHookProps;
  children?: ReactNode;
};

export function SwitchBox<D extends Schema.DataItem<Schema.$Boolean>>({
  children,
  color,
  hook,
  autoFocus,
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
    omitOnSubmit,
    hideMessage,
    props,
  } = useSchemaItem<Schema.DataItem<Schema.$Boolean>>($props, {
    effect: function ({ value }) {
      if (!ref.current) return;
      const isSwitch = value === dataItem._.trueValue;
      if (isSwitch !== ref.current.checked) ref.current.checked = isSwitch;
    },
  });

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (state.current !== "enabled") return;
    setValue(e.target.checked ? dataItem._.trueValue : dataItem._.falseValue);
  };

  if (hook) {
    hook.focus = () => ref.current.focus();
  }

  return (
    <WithMessage
      hide={hideMessage}
      state={state.current}
      result={result}
    >
      <InputLabel
        {...props}
        state={state}
      >
        <input
          className={clsx(
            "_ipt-switch",
            getColorClassName(color),
          )}
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
        <InputLabelText>
          {children}
        </InputLabelText>
        {
          state.current === "readonly" &&
          <>
            <input
              type="hidden"
              name={omitOnSubmit ? undefined : name}
              value={value as string || undefined}
            />
            <InputDummyFocus />
          </>
        }
      </InputLabel>
    </WithMessage>
  );
};

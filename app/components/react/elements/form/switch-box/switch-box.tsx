import { useImperativeHandle, useRef, type ChangeEvent, type ReactNode, type RefObject } from "react";
import { useSchemaItem } from "~/components/react/hooks/schema";
import { SwitchBox$, type SwitchBox$Ref } from ".";
import { type InputRef, type InputWrapProps } from "../common";
import { WithMessage } from "../message";

export interface SwitchBoxRef extends SwitchBox$Ref { };

export type SwitchBoxProps<D extends Schema.DataItem<Schema.$Boolean>> = Overwrite<
  InputWrapProps,
  {
    $: D;
    color?: StyleColor;
    ref?: RefObject<InputRef | null>;
    children?: ReactNode;
  }
>;

export function SwitchBox<D extends Schema.DataItem<Schema.$Boolean>>({
  className,
  style,
  children,
  color,
  autoFocus,
  ...$props
}: SwitchBoxProps<D>) {
  const ref = useRef<SwitchBox$Ref>(null!);

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
  } = useSchemaItem<Schema.DataItem<Schema.$Boolean>>($props, {
    effect: function ({ value }) {
      if (!ref.current) return;
      const isSwitch = value === dataItem._.trueValue;
      if (isSwitch !== ref.current.inputElement.checked) {
        ref.current.inputElement.checked = isSwitch;
      }
    },
  });

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (state.current !== "enabled") return;
    setValue(e.target.checked ? dataItem._.trueValue : dataItem._.falseValue);
  };

  useImperativeHandle($props.ref, () => ref.current);

  return (
    <WithMessage
      hide={hideMessage}
      state={state.current}
      result={result}
    >
      <SwitchBox$
        className={className}
        style={style}
        ref={ref}
        state={state}
        color={color}
        inputProps={{
          name: omitOnSubmit ? undefined : name,
          required,
          value: String(dataItem._.trueValue),
          defaultChecked: value === dataItem._.trueValue,
          onChange: handleChange,
          "aria-label": label,
          "aria-invalid": invalid,
          "aria-errormessage": errormessage,
          autoFocus,
        }}
      >
        {children}
      </SwitchBox$>
    </WithMessage>
  );
};

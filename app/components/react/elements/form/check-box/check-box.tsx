import { useImperativeHandle, useRef, type ChangeEvent, type ReactNode, type RefObject } from "react";
import { useSchemaItem } from "~/components/react/hooks/schema";
import { CheckBox$, type CheckBox$Ref, type CheckBoxAppearance } from ".";
import { WithMessage, type InputRef, type InputWrapProps } from "../common";

export interface CheckBoxRef extends CheckBox$Ref { };

export type CheckBoxProps<D extends Schema.DataItem<Schema.$Boolean>> = InputWrapProps & {
  $: D;
  appearance?: CheckBoxAppearance;
  color?: StyleColor;
  ref?: RefObject<InputRef | null>;
  children?: ReactNode;
};

export function CheckBox<D extends Schema.DataItem<Schema.$Boolean>>({
  autoFocus,
  appearance,
  color,
  children,
  ...$props
}: CheckBoxProps<D>) {
  const ref = useRef<CheckBox$Ref>(null!);

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
      const isCheck = value === dataItem._.trueValue;
      if (isCheck !== ref.current.inputElement.checked) {
        ref.current.inputElement.checked = isCheck;
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
      <CheckBox$
        ref={ref}
        color={color}
        appearance={appearance}
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
      </CheckBox$>
    </WithMessage>
  );
};

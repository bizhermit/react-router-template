import { useImperativeHandle, useRef, type ChangeEvent, type ReactNode } from "react";
import { useSchemaItem } from "~/components/react/hooks/schema";
import { CheckBox$, type CheckBox$Ref, type CheckBoxAppearance } from ".";
import { WithMessage } from "../message";

export interface CheckBoxRef extends CheckBox$Ref { };

export type CheckBoxProps<D extends Schema.DataItem<Schema.$Boolean>> = Overwrite<
  InputPropsWithDataItem<D>,
  {
    appearance?: CheckBoxAppearance;
    color?: StyleColor;
    children?: ReactNode;
  }
>;

export function CheckBox<D extends Schema.DataItem<Schema.$Boolean>>({
  className,
  style,
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
    if (state !== "enabled") return;
    setValue(e.target.checked ? dataItem._.trueValue : dataItem._.falseValue);
  };

  useImperativeHandle($props.ref, () => ref.current);

  return (
    <WithMessage
      hide={hideMessage}
      state={state}
      result={result}
    >
      <CheckBox$
        ref={ref}
        invalid={invalid}
        className={className}
        style={style}
        color={color}
        appearance={appearance}
        state={state}
        inputProps={{
          name: omitOnSubmit ? undefined : name,
          required,
          value: String(dataItem._.trueValue),
          defaultChecked: value === dataItem._.trueValue,
          onChange: handleChange,
          "aria-label": label,
          "aria-errormessage": errormessage,
          autoFocus,
        }}
      >
        {children}
      </CheckBox$>
    </WithMessage>
  );
};

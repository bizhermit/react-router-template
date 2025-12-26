import { useSchemaItem } from "$/shared/hooks/schema";
import { useImperativeHandle, useRef, type ReactNode } from "react";
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
  } = useSchemaItem<Schema.DataItem<Schema.$Boolean>>($props, {});

  function handleChangeValue(checked: boolean) {
    setValue(checked ? dataItem._.trueValue : dataItem._.falseValue);
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
        checked={dataItem._.trueValue === value}
        onChangeChecked={handleChangeValue}
        trueValue={dataItem._.trueValue}
        falseValue={dataItem._.falseValue}
        inputProps={{
          name: omitOnSubmit ? undefined : name,
          required,
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

import { useImperativeHandle, useRef, useState, type ChangeEvent, type RefObject } from "react";
import { useSchemaItem } from "~/components/react/hooks/schema";
import { getValidationValue } from "~/components/schema/utilities";
import { Slider$, type Slider$Ref } from ".";
import { useSource } from "../../../hooks/data-item-source";
import { type InputRef, type InputWrapProps } from "../common";
import { WithMessage } from "../message";

export interface SliderRef extends Slider$Ref { };

export type SliderProps<D extends Schema.DataItem<Schema.$Number>> = Overwrite<
  InputWrapProps,
  {
    $: D;
    color?: StyleColor;
    source?: Schema.Source<Schema.ValueType<D["_"]>>;
    step?: number;
    showValueText?: boolean;
    hideScales?: boolean;
    ref?: RefObject<InputRef | null>;
  }
>;

export function Slider<D extends Schema.DataItem<Schema.$Number>>({
  className,
  style,
  color,
  source: propsSource,
  step,
  showValueText,
  hideScales,
  autoFocus,
  ...$props
}: SliderProps<D>) {
  const ref = useRef<Slider$Ref>(null!);

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
    getCommonParams,
    env,
    omitOnSubmit,
    hideMessage,
  } = useSchemaItem<Schema.DataItem<Schema.$Number>>($props, {
    effect: function ({ value }) {
      if (!ref.current) return;
      const v = value == null ? "" : String(value);
      if (ref.current.inputElement.value !== v) ref.current.inputElement.value = v;
    },
    effectContext: function () {
      setMin(getMin);
      setMax(getMax);
      resetDataItemSource();
    },
  });

  function getMin() {
    return getValidationValue(getCommonParams(), dataItem._.min);
  };

  const [min, setMin] = useState(getMin);

  function getMax() {
    return getValidationValue(getCommonParams(), dataItem._.max);
  };

  const [max, setMax] = useState(getMax);

  const { source, resetDataItemSource } = useSource({
    dataItem,
    propsSource,
    env,
    getCommonParams,
  });

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (state.current !== "enabled") return;
    setValue(e.currentTarget.value as `${number}`);
  };

  useImperativeHandle($props.ref, () => ref.current);

  return (
    <WithMessage
      hide={hideMessage}
      state={state.current}
      result={result}
    >
      <Slider$
        className={className}
        style={style}
        ref={ref}
        state={state}
        color={color}
        showValueText
        dataList={source ? {
          id: `${name}_dl`,
          source,
        } : undefined}
        inputProps={{
          name: omitOnSubmit ? undefined : name,
          required,
          min,
          max,
          step,
          value,
          onChange: handleChange,
          "aria-label": label,
          "aria-invalid": invalid,
          "aria-errormessage": errormessage,
          title: value == null ? undefined : String(value),
          autoFocus,
        }}
      />
    </WithMessage>
  );
};

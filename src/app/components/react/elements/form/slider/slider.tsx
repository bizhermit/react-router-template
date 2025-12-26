import { useState } from "react";
import { useSchemaItem } from "~/components/react/hooks/schema";
import { getValidationValue } from "~/components/schema/utilities";
import { Slider$, type Slider$Ref } from ".";
import { useSource } from "../../../hooks/data-item-source";
import { WithMessage } from "../message";

export interface SliderRef extends Slider$Ref { };

export type SliderProps<D extends Schema.DataItem<Schema.$Number>> = Overwrite<
  InputPropsWithDataItem<D>,
  {
    color?: StyleColor;
    source?: Schema.Source<Schema.ValueType<D["_"]>>;
    step?: number;
    showValueText?: boolean;
    hideScales?: boolean;
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
  ref,
  ...$props
}: SliderProps<D>) {
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

  return (
    <WithMessage
      hide={hideMessage}
      state={state}
      result={result}
    >
      <Slider$
        className={className}
        style={style}
        ref={ref}
        invalid={invalid}
        state={state}
        color={color}
        showValueText
        dataList={source ? {
          id: `${name}_dl`,
          source,
        } : undefined}
        value={value}
        onChangeValue={setValue}
        inputProps={{
          name: omitOnSubmit ? undefined : name,
          required,
          min,
          max,
          step,
          "aria-label": label,
          "aria-errormessage": errormessage,
          title: value == null ? undefined : String(value),
          autoFocus,
        }}
      />
    </WithMessage>
  );
};

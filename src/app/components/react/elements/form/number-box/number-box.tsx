import { useImperativeHandle, useRef, useState, type InputHTMLAttributes } from "react";
import { useSchemaItem } from "~/components/react/hooks/schema";
import { getValidationValue } from "~/components/schema/utilities";
import { NumberBox$, type NumberBox$Ref } from ".";
import { useSource } from "../../../hooks/data-item-source";
import { WithMessage } from "../message";

export interface NumberBoxRef extends NumberBox$Ref { };

export type NumberBoxProps<D extends Schema.DataItem<Schema.$Number>> = Overwrite<
  InputPropsWithDataItem<D>,
  {
    placeholder?: string;
    source?: Schema.Source<Schema.ValueType<D["_"]>>;
    step?: number;
  } & Pick<InputHTMLAttributes<HTMLInputElement>,
    | "autoComplete"
    | "enterKeyHint"
  >
>;

export function NumberBox<D extends Schema.DataItem<Schema.$Number>>({
  className,
  style,
  placeholder,
  source: propsSource,
  step,
  autoFocus,
  autoComplete = "off",
  enterKeyHint,
  ...$props
}: NumberBoxProps<D>) {
  const ref = useRef<NumberBox$Ref>(null!);

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
      setFloat(getFloat);
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

  function getFloat() {
    return getValidationValue(getCommonParams(), dataItem._.float);
  };

  const [float, setFloat] = useState(getFloat);

  const { source, resetDataItemSource } = useSource({
    dataItem,
    propsSource,
    env,
    getCommonParams,
  });

  const dataListId = source == null ? undefined : `${name}_dl`;

  useImperativeHandle($props.ref, () => ref.current);

  return (
    <WithMessage
      hide={hideMessage}
      state={state}
      result={result}
    >
      <NumberBox$
        className={className}
        style={style}
        state={state}
        ref={ref}
        invalid={invalid}
        value={value}
        onChangeValue={setValue}
        inputProps={{
          name: omitOnSubmit ? undefined : name,
          required,
          min,
          max,
          float,
          step,
          placeholder,
          "aria-label": label,
          "aria-errormessage": errormessage,
          list: dataListId,
          autoFocus,
          autoComplete,
          enterKeyHint,
        }}
      >
        {
          source &&
          <datalist
            id={dataListId}
          >
            {source.map(item => {
              return (
                <option
                  key={item.value}
                  value={item.value ?? ""}
                >
                  {item.text}
                </option>
              );
            })}
          </datalist>
        }
      </NumberBox$>
    </WithMessage>
  );
};

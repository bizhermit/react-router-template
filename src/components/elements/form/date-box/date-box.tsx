import { useSource } from "$/shared/hooks/data-item-source";
import { useSchemaItem } from "$/shared/hooks/schema";
import { parseTypedDateString } from "$/shared/schema/date";
import { getValidationValue } from "$/shared/schema/utilities";
import { useImperativeHandle, useRef, useState } from "react";
import { DateBox$, type DateBox$Ref } from ".";
import { WithMessage } from "../message";

type DateBoxSchemaProps = Schema.$Date | Schema.$Month | Schema.$DateTime;

export interface DateBoxRef extends DateBox$Ref { };

export type DateBoxProps<D extends Schema.DataItem<DateBoxSchemaProps>> = Overwrite<
  InputPropsWithDataItem<D>,
  {
    source?: Schema.Source<Schema.ValueType<D["_"]>>;
    placeholder?: string;
  }
>;

export function DateBox<P extends Schema.DataItem<DateBoxSchemaProps>>({
  className,
  style,
  placeholder,
  autoFocus,
  source: propsSource,
  ...$props
}: DateBoxProps<P>) {
  const ref = useRef<DateBox$Ref>(null!);

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
    setRefs,
    env,
    omitOnSubmit,
    hideMessage,
  } = useSchemaItem<Schema.DataItem<DateBoxSchemaProps>>($props, {
    effectContext: function () {
      setMin(getMin);
      setMax(getMax);
      setPair(getPair);
      resetDataItemSource();
    },
  });

  const type = dataItem._.type;
  const time = (dataItem._ as Schema.$DateTime).time;

  function getMin() {
    return parseTypedDateString(
      getValidationValue(getCommonParams(), dataItem._.minDate),
      type,
      time,
    );
  };

  const [min, setMin] = useState(getMin);

  function getMax() {
    return parseTypedDateString(
      getValidationValue(getCommonParams(), dataItem._.maxDate),
      type,
      time,
    );
  };

  const [max, setMax] = useState(getMax);

  function getPair() {
    const pair = getValidationValue(getCommonParams(), dataItem._.pair);
    setRefs(pair?.name ? [pair.name] : []);
    return pair;
  };

  const [_pair, setPair] = useState(getPair);

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
      <DateBox$
        className={className}
        style={style}
        ref={ref}
        invalid={invalid}
        state={state}
        value={value}
        onChangeValue={setValue}
        inputProps={{
          type: type === "datetime" ? "datetime-local" : type,
          name: omitOnSubmit ? undefined : name,
          placeholder,
          required,
          min,
          max,
          step: type === "datetime"
            ? (dataItem._.time === "hm" ? 60 : undefined)
            : undefined,
          "aria-label": label,
          "aria-errormessage": errormessage,
          list: dataListId,
          autoFocus,
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
                  value={item.value || ""}
                >
                  {item.text}
                </option>
              );
            })}
          </datalist>
        }
      </DateBox$>
    </WithMessage>
  );
};

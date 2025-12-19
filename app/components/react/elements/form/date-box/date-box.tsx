import { useImperativeHandle, useMemo, useRef, useState, type ChangeEvent, type RefObject } from "react";
import { useSchemaItem } from "~/components/react/hooks/schema";
import { parseTypedDateString } from "~/components/schema/date";
import { DateBox$, type DateBox$Ref } from ".";
import { getValidationValue, WithMessage, type InputRef, type InputWrapProps } from "../common";
import { useSource } from "../utilities";

type DateBoxSchemaProps = Schema.$Date | Schema.$Month | Schema.$DateTime;

export interface DateBoxRef extends DateBox$Ref { };

export type DateBoxProps<D extends Schema.DataItem<DateBoxSchemaProps>> = InputWrapProps & {
  $: D;
  source?: Schema.Source<Schema.ValueType<D["_"]>>;
  placeholder?: string;
  ref?: RefObject<InputRef | null>;
};

export function DateBox<P extends Schema.DataItem<DateBoxSchemaProps>>({
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
    effect: function ({ value }) {
      if (!ref.current) return;
      const v = (value as string) || "";
      if (ref.current.inputElement.value !== v) {
        ref.current.inputElement.value = v;
      }
    },
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

  const defaultValue = useMemo(() => {
    return parseTypedDateString(
      value,
      type,
      time,
    );
  }, []);

  const { source, resetDataItemSource } = useSource({
    dataItem,
    propsSource,
    env,
    getCommonParams,
  });

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (state.current !== "enabled") return;
    setValue(e.target.value);
  };

  const dataListId = source == null ? undefined : `${name}_dl`;

  useImperativeHandle($props.ref, () => ref.current);

  return (
    <WithMessage
      hide={hideMessage}
      state={state.current}
      result={result}
    >
      <DateBox$
        ref={ref}
        state={state}
        bindMode="dom"
        inputProps={{
          type: type === "datetime" ? "datetime-local" : type,
          name: omitOnSubmit ? undefined : name,
          placeholder,
          required,
          min,
          max,
          defaultValue,
          step: type === "datetime" ? (dataItem._.time === "hm" ? 60 : undefined) : undefined,
          "aria-label": label,
          "aria-invalid": invalid,
          "aria-errormessage": errormessage,
          value: value === undefined ? undefined : (value || ""),
          list: dataListId,
          autoFocus,
          onChange: handleChange,
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

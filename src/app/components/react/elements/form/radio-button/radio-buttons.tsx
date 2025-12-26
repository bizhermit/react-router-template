import { useImperativeHandle, useRef, type MouseEvent } from "react";
import { RadioButton$, type RadioButton$Ref, type RadioButtonAppearance } from ".";
import { useSource } from "../../../hooks/data-item-source";
import { useSchemaItem } from "../../../hooks/schema";
import { WithMessage } from "../message";
import { InputGroupWrapper } from "../wrapper/input-group";

type RadioButtonsSchemaProps =
  | Schema.$String
  | Schema.$Number
  | Schema.$Boolean;
;

export interface RadioButtonsRef extends InputRef { };

export type RadioButtonsProps<D extends Schema.DataItem<RadioButtonsSchemaProps>> = Overwrite<
  InputPropsWithDataItem<D>,
  {
    appearance?: RadioButtonAppearance;
    color?: StyleColor;
    source?: Schema.Source<Schema.ValueType<D["_"]>>;
  }
>;

export function RadioButtons<D extends Schema.DataItem<RadioButtonsSchemaProps>>({
  className,
  style,
  appearance = "radio",
  color,
  source: propsSource,
  autoFocus,
  ...$props
}: RadioButtonsProps<D>) {
  const wref = useRef<HTMLDivElement>(null!);
  const firstRef = useRef<RadioButton$Ref | null>(null);

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
    env,
    getCommonParams,
    omitOnSubmit,
    hideMessage,
  } = useSchemaItem<Schema.DataItem<RadioButtonsSchemaProps>>($props, {
    effectContext: function () {
      resetDataItemSource();
    },
  });

  const { source, resetDataItemSource } = useSource({
    dataItem,
    propsSource,
    env,
    getCommonParams,
  });

  function handleClick(e: MouseEvent<HTMLInputElement>) {
    if (state !== "enabled") return;
    if (required) return;
    e.currentTarget.checked = false;
    setValue(undefined);
  };

  const hasValue = value != null;

  useImperativeHandle($props.ref, () => ({
    element: wref.current,
    focus: () => firstRef.current?.focus(),
  } as const satisfies RadioButtonsRef));

  return (
    <WithMessage
      hide={hideMessage}
      state={state}
      result={result}
    >
      <InputGroupWrapper
        className={className}
        style={style}
        ref={wref}
        state={state}
      >
        {source?.map((item, index) => {
          const key = String(item.value);
          const isSelected = item.value === value;

          return (
            <RadioButton$
              key={key}
              ref={index === 0 ? firstRef : undefined}
              invalid={invalid}
              state={state}
              color={color}
              appearance={appearance}
              checked={isSelected}
              value={key}
              onChangeChecked={() => setValue(key)}
              inputProps={{
                name,
                required,
                onClick: handleClick,
                "aria-label": `${label ? `${label} - ` : ""}${item.text}`,
                "aria-errormessage": errormessage,
                autoFocus: autoFocus
                  ? (hasValue ? isSelected : index === 0)
                  : undefined,
              }}
            >
              {item.node ?? item.text}
            </RadioButton$>
          );
        })}
        {
          state === "readonly" &&
          <input
            type="hidden"
            name={omitOnSubmit ? undefined : name}
            value={value as string ?? undefined}
          />
        }
      </InputGroupWrapper>
    </WithMessage>
  );
};

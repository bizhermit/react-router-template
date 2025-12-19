import { useImperativeHandle, useRef, type ChangeEvent, type MouseEvent, type RefObject } from "react";
import { useSchemaItem } from "~/components/react/hooks/schema";
import { RadioButton$, type RadioButton$Ref, type RadioButtonAppearance } from ".";
import { useSource } from "../../../hooks/data-item-source";
import { type InputRef, type InputWrapProps } from "../common";
import { WithMessage } from "../message";
import { InputGroupWrapper } from "../wrapper/input-group";

type RadioButtonsSchemaProps =
  | Schema.$String
  | Schema.$Number
  | Schema.$Boolean;
;

export interface RadioButtonsRef extends InputRef { };

export type RadioButtonsProps<D extends Schema.DataItem<RadioButtonsSchemaProps>> = Overwrite<
  InputWrapProps,
  {
    $: D;
    appearance?: RadioButtonAppearance;
    color?: StyleColor;
    source?: Schema.Source<Schema.ValueType<D["_"]>>;
    ref?: RefObject<InputRef | null>;
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
    effect: function ({ value }) {
      if (!wref.current) return;
      const sv = String(value ?? "");
      const target = wref.current.querySelector(`input[type="radio"][value="${sv}"]`) as HTMLInputElement;
      if (target) {
        target.checked = true;
      } else {
        wref.current.querySelectorAll(`input[type="radio"]:checked`).forEach(elem => {
          (elem as HTMLInputElement).checked = false;
        });
      }
    },
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

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (state.current !== "enabled") return;
    setValue(e.target.value);
  };

  function handleClick(e: MouseEvent<HTMLInputElement>) {
    if (state.current !== "enabled") return;
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
      state={state.current}
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
              state={state}
              color={color}
              appearance={appearance}
              inputProps={{
                name,
                required,
                value: key,
                defaultChecked: isSelected,
                onChange: handleChange,
                onClick: handleClick,
                "aria-label": `${label ? `${label} - ` : ""}${item.text}`,
                "aria-invalid": invalid,
                "aria-errormessage": errormessage,
                autoFocus: autoFocus ? (hasValue ? isSelected : index === 0) : undefined,
              }}
            >
              {item.node ?? item.text}
            </RadioButton$>
          );
        })}
        {
          state.current === "readonly" &&
          <input
            type="hidden"
            name={omitOnSubmit ? undefined : name}
            value={value as string || undefined}
          />
        }
      </InputGroupWrapper>
    </WithMessage>
  );
};

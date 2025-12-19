import { useImperativeHandle, useRef, type ChangeEvent, type RefObject } from "react";
import { useSchemaItem } from "~/components/react/hooks/schema";
import { CheckBox$, type CheckBox$Ref } from ".";
import { useSource } from "../../../hooks/data-item-source";
import { type InputRef, type InputWrapProps } from "../common";
import { WithMessage } from "../message";
import { InputGroupWrapper } from "../wrapper/input-group";

type CheckListItemSchemaProps =
  | Schema.$String
  | Schema.$Number
  | Schema.$Boolean
  ;

export interface CheckListRef extends InputRef { };

export type CheckListProps<D extends Schema.DataItem<Schema.$Array<CheckListItemSchemaProps>>> = Overwrite<
  InputWrapProps,
  {
    $: D;
    appearance?: "checkbox" | "button";
    color?: StyleColor;
    source?: Schema.Source<Schema.ValueType<D["_"]>>;
    ref?: RefObject<InputRef | null>;
  }
>;

export function CheckList<D extends Schema.DataItem<Schema.$Array<CheckListItemSchemaProps>>>({
  className,
  style,
  appearance = "checkbox",
  color,
  autoFocus,
  source: propsSource,
  ...$props
}: CheckListProps<D>) {
  const wref = useRef<HTMLDivElement>(null!);
  const firstRef = useRef<CheckBox$Ref | null>(null);

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
  } = useSchemaItem<Schema.DataItem<Schema.$Array>>($props, {
    effect: function ({ value }) {
      if (!wref.current) return;
      const arr = ((value == null || !Array.isArray(value)) ? [] : value)
        .map(v => v == null ? "" : String(v));
      wref.current.querySelectorAll(`input[type="checkbox"]`).forEach(elem => {
        const v = (elem as HTMLInputElement).value;
        const isChecked = arr.some(av => av === v);
        (elem as HTMLInputElement).checked = isChecked;
      });
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleChange(e: ChangeEvent<HTMLInputElement>, v: any) {
    if (state.current !== "enabled") return;
    const newValue = [...value ?? []];
    const index = newValue.findIndex(item => item === v);
    if (index < 0) {
      newValue.push(v);
    } else {
      newValue.splice(index, 1);
    }
    setValue(newValue);
  };

  useImperativeHandle($props.ref, () => ({
    element: wref.current,
    focus: () => firstRef.current?.focus(),
  } as const satisfies CheckListRef));

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
          const isChecked = value?.some(v => v === item.value);

          return (
            <CheckBox$
              key={key}
              ref={index === 0 ? firstRef : undefined}
              appearance={appearance}
              state={state}
              color={color}
              inputProps={{
                name: omitOnSubmit ? undefined : name,
                required,
                value: key,
                defaultChecked: isChecked,
                onChange: e => handleChange(e, item.value),
                "aria-label": `${label ? `${label} - ` : ""}${item.text}`,
                "aria-invalid": invalid,
                "aria-errormessage": errormessage,
                autoFocus: autoFocus ? index === 0 : undefined,
              }}
            >
              {item.node || item.text}
            </CheckBox$>
          );
        })}
      </InputGroupWrapper>
    </WithMessage>
  );
};

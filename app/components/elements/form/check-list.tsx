import { useRef, type ChangeEvent } from "react";
import { useSchemaItem } from "~/components/schema/hooks";
import { clsx, getColorClassName } from "../utilities";
import { InputDummyFocus, InputGroup, InputLabel, InputLabelText, type InputWrapProps } from "./common";
import type { FormItemHookProps } from "./hooks";
import { useSource } from "./utilities";

type CheckListItemSchemaProps = Schema.$String | Schema.$Number | Schema.$Boolean;

export type CheckListProps<D extends Schema.DataItem<Schema.$Array<CheckListItemSchemaProps>>> = InputWrapProps & {
  $: D;
  appearance?: "checkbox" | "button";
  color?: StyleColor;
  source?: Schema.Source<Schema.ValueType<D["_"]>>;
  hook?: FormItemHookProps;
};

export function CheckList<D extends Schema.DataItem<Schema.$Array<CheckListItemSchemaProps>>>({
  appearance = "checkbox",
  color,
  autoFocus,
  source: propsSource,
  hook,
  ...$props
}: CheckListProps<D>) {
  const ref = useRef<HTMLDivElement>(null!);
  const dummyRef = useRef<HTMLDivElement | null>(null);

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
    props,
  } = useSchemaItem<Schema.DataItem<Schema.$Array>>($props, {
    effect: function ({ value }) {
      if (!ref.current) return;
      const arr = ((value == null || !Array.isArray(value)) ? [] : value).map(v => v == null ? "" : String(v));
      ref.current.querySelectorAll(`input[type="checkbox"]`).forEach(elem => {
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

  if (hook) {
    hook.focus = () => {
      if (dummyRef.current) return dummyRef.current.focus();
      const checkedElem = ref.current.querySelector(`input[type="checkbox"]:checked`) ?? ref.current.querySelector(`input[type="checkbox"]`);
      (checkedElem as HTMLInputElement | null)?.focus();
    };
  }

  const checkBoxClassName = appearance === "checkbox" ? "ipt-point ipt-check" : "appearance-none";
  const labelClassName = appearance === "button" ?
    clsx("ipt-label-button", getColorClassName(color))
    : undefined;
  const labelTextClassName = appearance === "button" ? "px-0" : undefined;

  return (
    <InputGroup
      {...props}
      ref={ref}
      core={{
        state,
        result,
      }}
    >
      {source?.map((item, index) => {
        const key = String(item.value);
        const isChecked = value?.some(v => v === item.value);

        return (
          <InputLabel
            key={key}
            core={{
              classNames: labelClassName,
            }}
          >
            <input
              className={checkBoxClassName}
              type="checkbox"
              name={omitOnSubmit ? undefined : name}
              disabled={state.current !== "enabled"}
              aria-disabled={state.current === "disabled"}
              aria-readonly={state.current === "readonly"}
              required={required}
              value={key}
              defaultChecked={isChecked}
              onChange={e => handleChange(e, item.value)}
              aria-label={`${label ? `${label} - ` : ""}${item.text}`}
              aria-invalid={invalid}
              aria-errormessage={errormessage}
              autoFocus={autoFocus ? index === 0 : undefined}
            />
            <InputLabelText
              className={labelTextClassName}
            >
              {item.node || item.text}
            </InputLabelText>
            {
              state.current === "readonly" &&
              <>
                <input
                  type="hidden"
                  name={omitOnSubmit ? undefined : name}
                  value={isChecked ? key : ""}
                />
                <InputDummyFocus
                  ref={index === 0 ? dummyRef : undefined}
                />
              </>
            }
          </InputLabel>
        );
      })}
    </InputGroup>
  );
};

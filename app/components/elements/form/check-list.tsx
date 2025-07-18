import { useRef, type ChangeEvent } from "react";
import { useSchemaItem } from "~/components/schema/hooks";
import { InputDummyFocus, InputGroup, InputLabel, InputLabelText, type InputWrapProps } from "./common";
import { useSource } from "./utilities";

type CheckListItemSchemaProps = Schema.$String | Schema.$Number | Schema.$Boolean;

export type CheckListProps<D extends Schema.DataItem<Schema.$Array<CheckListItemSchemaProps>>> = InputWrapProps & {
  $: D;
  source?: Schema.Source<Schema.ValueType<D["_"]>>;
};

export function CheckList<D extends Schema.DataItem<Schema.$Array<CheckListItemSchemaProps>>>({
  source: propsSource,
  ...$props
}: CheckListProps<D>) {
  const ref = useRef<HTMLDivElement>(null!);

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
    if (!state.current.enabled) return;
    const newValue = [...value ?? []];
    const index = newValue.findIndex(item => item === v);
    if (index < 0) {
      newValue.push(v);
    } else {
      newValue.splice(index, 1);
    }
    setValue(newValue);
  };

  const isReadOnly = !state.current.disabled && state.current.readonly;

  return (
    <InputGroup
      {...props}
      ref={ref}
      core={{
        state,
        result,
      }}
    >
      {source?.map(item => {
        const key = String(item.value);
        const isChecked = value?.some(v => v === item.value);

        return (
          <InputLabel key={key}>
            <input
              className="ipt-point ipt-check"
              type="checkbox"
              name={omitOnSubmit ? undefined : name}
              disabled={!state.current.enabled}
              aria-disabled={state.current.disabled}
              aria-readonly={state.current.readonly}
              required={required}
              value={key}
              defaultChecked={isChecked}
              onChange={e => handleChange(e, item.value)}
              aria-label={`${label ? `${label} - ` : ""}${item.text}`}
              aria-invalid={invalid}
              aria-errormessage={errormessage}
            />
            <InputLabelText>
              {item.text}
            </InputLabelText>
            {
              isReadOnly &&
              <>
                <input
                  type="hidden"
                  name={omitOnSubmit ? undefined : name}
                  value={isChecked ? key : ""}
                />
                <InputDummyFocus />
              </>
            }
          </InputLabel>
        );
      })}
    </InputGroup>
  );
};

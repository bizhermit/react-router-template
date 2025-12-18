import { useImperativeHandle, useRef, type ChangeEvent, type ReactNode, type RefObject } from "react";
import { useSchemaItem } from "~/components/react/hooks/schema";
import { SelectBox$, SelectBoxEmptyOption, type SelectBox$Ref } from ".";
import { WithMessage, type InputWrapProps } from "../common";
import { useSource } from "../utilities";

type SelectBoxSchemaProps = Schema.$String | Schema.$Number | Schema.$Boolean;

export interface SelectBoxRef extends SelectBox$Ref { };

export type SelectBoxProps<D extends Schema.DataItem<SelectBoxSchemaProps>> = InputWrapProps & {
  $: D;
  placeholder?: string;
  emptyText?: string;
  source?: Schema.Source<Schema.ValueType<D["_"]>>;
  ref?: RefObject<SelectBoxRef>;
  children?: ReactNode;
};

export function SelectBox<D extends Schema.DataItem<SelectBoxSchemaProps>>({
  className,
  style,
  placeholder,
  emptyText,
  children,
  source: propsSource,
  autoFocus,
  ...$props
}: SelectBoxProps<D>) {
  const ref = useRef<SelectBoxRef>(null!);

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
  } = useSchemaItem<Schema.DataItem<SelectBoxSchemaProps>>($props, {
    effect: function ({ value }) {
      if (!ref.current) return;
      const sv = String(value ?? "");
      if (ref.current.selectElement.value !== sv) {
        ref.current.selectElement.value = sv;
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

  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    if (state.current !== "enabled") return;
    setValue(e.target.value);
  };

  useImperativeHandle($props.ref, () => ref.current);

  return (
    <WithMessage
      hide={hideMessage}
      state={state.current}
      result={result}
    >
      <SelectBox$
        className={className}
        style={style}
        state={state}
        ref={ref}
        placeholder={placeholder}
        selectProps={{
          name: omitOnSubmit ? undefined : name,
          required,
          "aria-label": label,
          "aria-invalid": invalid,
          "aria-errormessage": errormessage,
          autoFocus,
          defaultValue: value as string || undefined,
          onChange: handleChange,
        }}
      >
        {
          children ?? <>
            <SelectBoxEmptyOption
              required={required}
            >
              {emptyText}
            </SelectBoxEmptyOption>
            {
              source?.map(item => {
                const key = String(item.value);
                return (
                  <option
                    key={key}
                    value={key}
                  >
                    {item.text}
                  </option>
                );
              })
            }
          </>
        }
      </SelectBox$>
    </WithMessage>
  );
};

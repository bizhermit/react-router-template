import { useImperativeHandle, useRef, type ReactNode } from "react";
import { SelectBox$, SelectBoxEmptyOption, type SelectBox$Ref } from ".";
import { useSource } from "../../../../shared/hooks/data-item-source";
import { useSchemaItem } from "../../../../shared/hooks/schema";
import { WithMessage } from "../message";

type SelectBoxSchemaProps =
  | Schema.$String
  | Schema.$Number
  | Schema.$Boolean
  ;

export interface SelectBoxRef extends SelectBox$Ref { };

export type SelectBoxProps<D extends Schema.DataItem<SelectBoxSchemaProps>> = Overwrite<
  InputPropsWithDataItem<D>,
  {
    placeholder?: string;
    emptyText?: string;
    source?: Schema.Source<Schema.ValueType<D["_"]>>;
    children?: ReactNode;
  }
>;

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
  const ref = useRef<SelectBox$Ref>(null!);

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

  useImperativeHandle($props.ref, () => ref.current);

  return (
    <WithMessage
      hide={hideMessage}
      state={state}
      result={result}
    >
      <SelectBox$
        className={className}
        style={style}
        state={state}
        ref={ref}
        invalid={invalid}
        placeholder={placeholder}
        value={value}
        onChangeValue={setValue}
        selectProps={{
          name: omitOnSubmit ? undefined : name,
          required,
          "aria-label": label,
          "aria-errormessage": errormessage,
          autoFocus,
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

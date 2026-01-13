import { useSource } from "$/shared/hooks/data-item-source";
import { useSchemaItem } from "$/shared/hooks/schema";
import { useImperativeHandle, useRef, type ReactNode } from "react";
import { ComboBox$, ComboBoxItem, type ComboBox$Ref } from ".";
import { WithMessage } from "../message";

type ComboBoxSchemaProps =
  | Schema.$String
  | Schema.$Number
  | Schema.$Boolean
  ;

export interface ComboBoxRef extends ComboBox$Ref { };

export type ComboBoxProps<D extends Schema.DataItem<ComboBoxSchemaProps>> = Overwrite<
  InputPropsWithDataItem<D>,
  {
    placeholder?: string;
    emptyText?: boolean | ReactNode;
    source?: Schema.Source<Schema.ValueType<D["_"]>>;
    children?: ReactNode;
  }
>;

export function ComboBox<D extends Schema.DataItem<ComboBoxSchemaProps>>({
  className,
  style,
  placeholder,
  emptyText,
  children,
  source: propsSource,
  autoFocus,
  ...$props
}: ComboBoxProps<D>) {
  const ref = useRef<ComboBox$Ref>(null!);

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
    // errormessage,
    env,
    getCommonParams,
    omitOnSubmit,
    hideMessage,
  } = useSchemaItem<Schema.DataItem<ComboBoxSchemaProps>>($props, {
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
      <ComboBox$
        className={className}
        style={style}
        label={label}
        state={state}
        ref={ref}
        invalid={invalid}
        placeholder={placeholder}
        value={value}
        onChangeValue={setValue}
        name={omitOnSubmit ? undefined : name}
        autoFocus={autoFocus}
      >
        {
          children ?? <>
            {
              !required && emptyText &&
              <ComboBoxItem
                value=""
                displayValue=""
              >
                {emptyText}
              </ComboBoxItem>
            }
            {
              source?.map(item => {
                const key = String(item.value);
                return (
                  <ComboBoxItem
                    key={key}
                    value={key}
                    displayValue={item.text ?? ""}
                  >
                    {item.node ?? item.text}
                  </ComboBoxItem>
                );
              })
            }
          </>
        }
      </ComboBox$>
    </WithMessage>
  );
};

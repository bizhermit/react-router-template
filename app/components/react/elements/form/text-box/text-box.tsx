import { useState, type HTMLAttributes, type HTMLInputTypeAttribute, type InputHTMLAttributes } from "react";
import { useSchemaItem } from "~/components/react/hooks/schema";
import { getValidationValue } from "~/components/schema/utilities";
import { TextBox$, type TextBox$Ref } from ".";
import { useSource } from "../../../hooks/data-item-source";
import { WithMessage } from "../message";

export interface TextBoxRef extends TextBox$Ref { };

export type TextBoxProps<D extends Schema.DataItem<Schema.$String>> = Overwrite<
  InputPropsWithDataItem<D>,
  {
    placeholder?: string;
    source?: Schema.Source<Schema.ValueType<D["_"]>>;
  } & Pick<
    InputHTMLAttributes<HTMLInputElement>,
    | "autoComplete"
    | "autoCapitalize"
    | "enterKeyHint"
  >
>;

interface PatternProps {
  type?: HTMLInputTypeAttribute;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
};

function getPatternInputProps(pattern: Schema.StringProps["pattern"]): PatternProps {
  if (pattern == null || typeof pattern !== "string") return {};
  switch (pattern) {
    case "int":
    case "h-num":
      return { inputMode: "decimal" };
    case "h-alpha":
    case "h-alpha-num":
    case "h-alpha-num-syn":
      return { inputMode: "url" };
    case "email":
      return { type: "email" };
    case "tel":
      return { type: "tel" };
    case "url":
      return { type: "url" };
    default:
      return {};
  }
}

export function TextBox<D extends Schema.DataItem<Schema.$String>>({
  className,
  style,
  placeholder,
  source: propsSource,
  autoFocus,
  autoComplete = "off",
  autoCapitalize,
  enterKeyHint,
  ref,
  ...$props
}: TextBoxProps<D>) {
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
    env,
    omitOnSubmit,
    hideMessage,
  } = useSchemaItem<Schema.DataItem<Schema.$String>>($props, {
    effectContext: function () {
      setMinLen(getMinLen);
      setMaxLen(getMaxLen);
      resetDataItemSource();
    },
  });

  function getMinLen() {
    return getValidationValue(getCommonParams(), dataItem._.minLength);
  };

  const [minLen, setMinLen] = useState<number | undefined>(getMinLen);

  function getMaxLen() {
    const params = getCommonParams();
    const len = getValidationValue(params, dataItem._.length);
    if (len != null) return len;
    return getValidationValue(params, dataItem._.maxLength);
  };

  const [maxLen, setMaxLen] = useState<number | undefined>(getMaxLen);

  const { source, resetDataItemSource } = useSource({
    dataItem,
    propsSource,
    env,
    getCommonParams,
  });

  const patternProps = getPatternInputProps(dataItem._.pattern);

  const dataListId = source == null ? undefined : `${name}_dl`;

  return (
    <WithMessage
      hide={hideMessage}
      state={state}
      result={result}
    >
      <TextBox$
        className={className}
        style={style}
        ref={ref}
        state={state}
        invalid={invalid}
        value={value}
        onChangeValue={setValue}
        inputProps={{
          type: patternProps.type || "text",
          name: omitOnSubmit ? undefined : name,
          required,
          minLength: minLen,
          maxLength: maxLen,
          placeholder,
          inputMode: patternProps.inputMode,
          "aria-label": label,
          "aria-errormessage": errormessage,
          list: dataListId,
          autoFocus,
          autoComplete,
          autoCapitalize,
          enterKeyHint,
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
                  value={item.value ?? ""}
                >
                  {item.text}
                </option>
              );
            })}
          </datalist>
        }
      </TextBox$>
    </WithMessage>
  );
};

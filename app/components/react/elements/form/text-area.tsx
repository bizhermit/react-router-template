import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useSchemaItem } from "~/components/react/hooks/schema";
import { getValidationValue, InputField, type InputWrapProps } from "./common";
import type { FormItemHookProps } from "./hooks";

type Resize = "none" | "vertical" | "horizontal" | "both";

export type TextAreaProps<D extends Schema.DataItem<Schema.$String>> = InputWrapProps & {
  $: D;
  placeholder?: string;
  cols?: number;
  resize?: Resize;
  hook?: FormItemHookProps;
} & ({
  rows?: number;
  maxRows?: undefined;
} | {
  rows: "fit";
  maxRows?: number;
});

function getResizeClassName(resize: Resize | undefined) {
  switch (resize) {
    case "none": return "resize-none";
    case "vertical": return "resize-y";
    case "horizontal": return "resize-x";
    default: return "resize";
  }
};

const DEFAULT_ROWS = 3;

export function TextArea<D extends Schema.DataItem<Schema.$String>>({
  placeholder,
  rows: propsRows,
  maxRows,
  cols,
  resize,
  autoFocus,
  hook,
  ...$props
}: TextAreaProps<D>) {
  const ref = useRef<HTMLTextAreaElement>(null!);

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
    omitOnSubmit,
    props,
  } = useSchemaItem<Schema.DataItem<Schema.$String>>($props, {
    effect: function ({ value }) {
      if (!ref.current) return;
      const sv = String(value || "");
      if (ref.current.value !== sv) ref.current.value = sv;
      calcFitContentHeight();
    },
    effectContext: function () {
      setMinLen(getMinLen);
      setMaxLen(getMaxLen);
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

  function calcFitContentHeight() {
    if (propsRows !== "fit" || !ref.current) return;

    ref.current.style.height = "0";
    const height = ref.current.scrollHeight;

    if (maxRows == null) {
      ref.current.style.height = height + "px";
      ref.current.style.overflowY = "hidden";
      return;
    }

    const marginBlock = parseFloat(getComputedStyle(ref.current).paddingTop) +
      parseFloat(getComputedStyle(ref.current).paddingBottom);
    const lineHeight = parseFloat(getComputedStyle(ref.current).lineHeight);
    const maxHeight = lineHeight * maxRows + marginBlock;

    if (height > maxHeight) {
      ref.current.style.height = maxHeight + "px";
      ref.current.style.overflowY = "auto";
      return;
    }
    ref.current.style.height = height + "px";
    ref.current.style.overflowY = "hidden";
  };

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    if (state.current !== "enabled") return;
    setValue(e.target.value);
    calcFitContentHeight();
  };

  if (hook) {
    hook.focus = () => ref.current.focus();
  }

  const rows = (() => {
    if (propsRows == null) return DEFAULT_ROWS;
    if (propsRows === "fit") return 1;
    return propsRows;
  })();

  useEffect(() => {
    calcFitContentHeight();
  }, []);

  return (
    <InputField
      {...props}
      core={{
        state,
        result,
      }}
    >
      <textarea
        className={`_ipt-box py-input-pad-y min-h-input min-w-input ${getResizeClassName(resize)}`}
        ref={ref}
        name={omitOnSubmit ? undefined : name}
        disabled={state.current === "disabled"}
        readOnly={state.current === "readonly"}
        required={required}
        minLength={minLen}
        maxLength={maxLen}
        defaultValue={value || undefined}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        cols={cols}
        aria-label={label}
        aria-invalid={invalid}
        aria-errormessage={errormessage}
        autoFocus={autoFocus}
      />
    </InputField>
  );
};

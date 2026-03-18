import { useEffect, useImperativeHandle, useRef, type ChangeEvent, type TextareaHTMLAttributes } from "react";
import { clsx } from "../../utilities";
import { InputFieldWrapper, type InputFieldProps, type InputFieldWrapperProps } from "../wrapper/input-field";

/** テキストエリア ref オブジェクト */
export interface TextArea$Ref extends InputRef {
  /** DOM textarea */
  textAreaElement: HTMLTextAreaElement;
  /** テキストエリア高さ再計算 */
  calcFitContentHeight: () => void;
};

/** テキストエリア リサイズモード */
export type TextAreaResize =
  | "none"
  | "vertical"
  | "horizontal"
  | "both"
  ;

/** テキストエリア Props */
export type TextArea$Props = Overwrite<
  InputFieldWrapperProps,
  InputFieldProps<{
    /** textarea Props */
    textAreaProps?: Overwrite<
      Omit<
        TextareaHTMLAttributes<HTMLTextAreaElement>,
        InputOmitProps
      >,
      {
        /** 表示行数（高さ） */
        rows?: number | "fit";
      }
    >;
    /** 最小表示行数 */
    minRows?: number;
    /** 最大表示行数 */
    maxRows?: number;
    /** リサイズ {@link TextAreaResize} */
    resize?: TextAreaResize;
  } & InputValueProps<string>>
>;

const DEFAULT_ROWS = 3; // デフォルト行数

/**
 * リサイズ属性値取得
 * @param resize {@link TextAreaResize}
 * @returns
 */
function getResizeClassName(resize: TextAreaResize | undefined) {
  switch (resize) {
    case "none": return "resize-none";
    case "vertical": return "resize-y";
    case "horizontal": return "resize-x";
    default: return "resize";
  }
};

/**
 * テキストエリア
 * @param param {@link TextArea$Props}
 * @returns
 */
export function TextArea$({
  ref,
  invalid,
  textAreaProps,
  state = "enabled",
  minRows,
  maxRows,
  resize,
  children,
  defaultValue,
  onChangeValue,
  ...props
}: TextArea$Props) {
  const isControlled = "value" in props;
  const { value, ...wrapperProps } = props;

  const wref = useRef<HTMLDivElement>(null!);
  const iref = useRef<HTMLTextAreaElement>(null!);

  function calcFitContentHeight() {
    if (textAreaProps?.rows !== "fit" || !iref.current) return;

    iref.current.style.height = "0";
    const height = iref.current.scrollHeight;
    const marginBlock = parseFloat(getComputedStyle(iref.current).paddingTop) +
      parseFloat(getComputedStyle(iref.current).paddingBottom);
    const lineHeight = parseFloat(getComputedStyle(iref.current).lineHeight);

    function setMinHeight() {
      if (minRows == null) {
        iref.current.style.height = height + "px";
      } else {
        iref.current.style.height = Math.max(
          height,
          lineHeight * minRows + marginBlock
        ) + "px";
      }
    }

    if (maxRows == null) {
      iref.current.style.overflowY = "hidden";
      setMinHeight();
      return;
    }

    const maxHeight = lineHeight * maxRows + marginBlock;

    if (height > maxHeight) {
      iref.current.style.height = maxHeight + "px";
      iref.current.style.overflowY = "auto";
      return;
    }
    setMinHeight();
    iref.current.style.overflowY = "hidden";
  };

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    if (state === "enabled") {
      onChangeValue?.(e.currentTarget.value);
    }
    if (!isControlled) calcFitContentHeight();
    textAreaProps?.onChange?.(e);
  };

  const rows = (() => {
    if (textAreaProps?.rows == null) return DEFAULT_ROWS;
    if (textAreaProps?.rows === "fit") {
      if (minRows != null) return minRows;
      return 1;
    }
    return textAreaProps?.rows;
  })();

  useEffect(() => {
    calcFitContentHeight();
  }, [isControlled ? value : undefined]);

  useImperativeHandle(ref, () => ({
    element: wref.current,
    textAreaElement: iref.current,
    focus: () => iref.current.focus(),
    calcFitContentHeight,
  } as const satisfies TextArea$Ref));

  return (
    <InputFieldWrapper
      {...wrapperProps}
      ref={wref}
      state={state}
    >
      <textarea
        disabled={state === "disabled"}
        readOnly={state === "readonly"}
        aria-invalid={invalid}
        {...textAreaProps}
        className={clsx(
          `_ipt-box py-input-pad-y min-h-input min-w-input ${getResizeClassName(resize)}`,
          textAreaProps?.className,
        )}
        ref={iref}
        rows={rows}
        onChange={handleChange}
        {...isControlled
          ? { value: value ?? "" }
          : { defaultValue: defaultValue ?? "" }
        }
      />
    </InputFieldWrapper>
  );
};

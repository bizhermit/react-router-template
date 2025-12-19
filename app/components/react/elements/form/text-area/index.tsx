import { useEffect, useImperativeHandle, useRef, type ChangeEvent, type RefObject, type TextareaHTMLAttributes } from "react";
import { clsx } from "../../utilities";
import { InputField, type InputFieldProps, type InputRef } from "../common";

export interface TextArea$Ref extends InputRef {
  textAreaElement: HTMLTextAreaElement;
  calcFitContentHeight: () => void;
};

export type Resize = "none" | "vertical" | "horizontal" | "both";

export type TextArea$Props = Overwrite<InputFieldProps, {
  ref?: RefObject<InputRef | null>;
  textAreaProps?: Overwrite<TextareaHTMLAttributes<HTMLTextAreaElement>, {
    rows?: number | "fit";
  }>;
  minRows?: number;
  maxRows?: number;
  resize?: Resize;
}>;

const DEFAULT_ROWS = 3;

function getResizeClassName(resize: Resize | undefined) {
  switch (resize) {
    case "none": return "resize-none";
    case "vertical": return "resize-y";
    case "horizontal": return "resize-x";
    default: return "resize";
  }
};

export function TextArea$({
  ref,
  textAreaProps,
  state = { current: "enabled" },
  minRows,
  maxRows,
  resize,
  children,
  ...props
}: TextArea$Props) {
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
    calcFitContentHeight();
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
  }, []);

  useImperativeHandle(ref, () => ({
    element: wref.current,
    textAreaElement: iref.current,
    focus: () => iref.current.focus(),
    calcFitContentHeight,
  } as const satisfies TextArea$Ref));

  return (
    <InputField
      {...props}
      ref={wref}
      state={state}
    >
      <textarea
        disabled={state.current === "disabled"}
        readOnly={state.current === "readonly"}
        {...textAreaProps}
        className={clsx(
          `_ipt-box py-input-pad-y min-h-input min-w-input ${getResizeClassName(resize)}`,
          textAreaProps?.className,
        )}
        ref={iref}
        onChange={handleChange}
        rows={rows}
      />
    </InputField>
  );
};

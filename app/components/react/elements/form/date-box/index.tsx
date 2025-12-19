import { use, useImperativeHandle, useRef, type FocusEvent, type InputHTMLAttributes, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { ValidScriptsContext } from "~/components/react/providers/valid-scripts";
import { clsx } from "../../utilities";
import { InputDummyFocus, InputField, type InputFieldProps, type InputRef } from "../common";

export interface DateBox$Ref extends InputRef {
  inputElement: HTMLInputElement;
};

export type DateBox$Props = Overwrite<InputFieldProps, {
  ref?: RefObject<InputRef | null>;
  inputProps?: Overwrite<InputHTMLAttributes<HTMLInputElement>, {
    type: "date" | "month" | "datetime-local";
  }>;
  children?: ReactNode;
  bindMode?: "state" | "dom";
}>;

export function DateBox$({
  ref,
  inputProps,
  state = { current: "enabled" },
  children,
  bindMode = "state",
  ...props
}: DateBox$Props) {
  const validScripts = use(ValidScriptsContext).valid;
  const type = inputProps?.type || "date";

  const wref = useRef<HTMLDivElement>(null!);
  const iref = useRef<HTMLInputElement>(null!);
  const dref = useRef<HTMLDivElement | null>(null);

  function applyInputedValue() {
    iref.current.value = iref.current.value || ""; // NOTE: 日付が揃っていない場合はクリア
  };

  function handleKeydown(e: KeyboardEvent<HTMLInputElement>) {
    if (state.current === "enabled") {
      if (e.key === "Enter") applyInputedValue();
    }
    inputProps?.onKeyDown?.(e);
  };

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    applyInputedValue();
    inputProps?.onBlur?.(e);
  };

  useImperativeHandle(ref, () => ({
    element: wref.current,
    inputElement: iref.current,
    focus: () => (dref.current ?? iref.current).focus(),
  } as const satisfies DateBox$Ref));

  return (
    <InputField
      {...props}
      ref={wref}
      state={state}
    >
      <input
        disabled={state.current !== "enabled"}
        aria-disabled={state.current === "disabled"}
        aria-readonly={state.current === "readonly"}
        {...inputProps}
        className={clsx(
          "_ipt-box",
          validScripts && "_ipt-date",
          inputProps?.className,
        )}
        ref={iref}
        type={type}
        name={state.current === "readonly" ? undefined : inputProps?.name}
        onKeyDown={handleKeydown}
        onBlur={handleBlur}
        value={bindMode === "dom" ? undefined : inputProps?.value}
        data-hasvalue={
          bindMode === "dom" ?
            !!inputProps?.value :
            (inputProps && "value" in inputProps) ? !!inputProps.value : true
        }
      />
      {
        state.current === "readonly" &&
        <>
          <input
            type="hidden"
            name={inputProps?.name}
            value={inputProps?.value as string || undefined}
          />
          <InputDummyFocus
            ref={dref}
          />
        </>
      }
      {children}
    </InputField>
  );
}

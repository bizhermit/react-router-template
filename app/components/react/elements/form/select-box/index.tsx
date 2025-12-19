import { use, useImperativeHandle, useRef, type ReactNode, type RefObject, type SelectHTMLAttributes } from "react";
import { ValidScriptsContext } from "~/components/react/providers/valid-scripts";
import { DownIcon } from "../../icon";
import { clsx, ZERO_WIDTH_SPACE } from "../../utilities";
import { InputDummyFocus, InputField, Placeholder, type InputFieldProps, type InputRef } from "../common";

export interface SelectBox$Ref extends InputRef {
  selectElement: HTMLSelectElement;
};

export type SelectBox$Props = Overwrite<InputFieldProps, {
  ref?: RefObject<InputRef | null>;
  selectProps?: SelectHTMLAttributes<HTMLSelectElement>;
  children?: ReactNode;
  placeholder?: ReactNode;
}>;

export function SelectBox$({
  ref,
  selectProps,
  state = { current: "enabled" },
  children,
  placeholder,
  ...props
}: SelectBox$Props) {
  const validScripts = use(ValidScriptsContext).valid;

  const dummyRef = useRef<HTMLDivElement | null>(null);
  const wref = useRef<HTMLDivElement>(null!);
  const sref = useRef<HTMLSelectElement>(null!);

  useImperativeHandle(ref, () => ({
    element: wref.current,
    selectElement: sref.current,
    focus: () => (dummyRef.current ?? sref.current)?.focus(),
  } as const satisfies SelectBox$Ref));

  return (
    <InputField
      {...props}
      ref={wref}
      state={state}
    >
      <select
        {...selectProps}
        className="_ipt-box _ipt-select"
        ref={sref}
        disabled={state.current !== "enabled"}
        aria-disabled={state.current === "disabled"}
        aria-readonly={state.current === "readonly"}
      >
        {children}
      </select>
      <Placeholder
        validScripts={validScripts}
        state={state}
      >
        {placeholder}
      </Placeholder>
      <div
        className={clsx(
          "_ipt-btn",
          state.current !== "enabled" && "opacity-0"
        )}
      >
        <DownIcon />
      </div>
      {
        state.current === "readonly" &&
        <>
          <input
            type="hidden"
            name={selectProps?.name}
            value={selectProps?.value as string || undefined}
          />
          <InputDummyFocus
            ref={dummyRef}
          />
        </>
      }
    </InputField>
  );
};

interface SelectBoxEmptyOptionProps {
  required?: boolean;
  children?: ReactNode;
};

export function SelectBoxEmptyOption({
  required,
  children,
}: SelectBoxEmptyOptionProps) {
  return (
    <option
      value=""
      hidden={required}
      data-notext={children == null || children === ""}
    >
      {children || ZERO_WIDTH_SPACE}
    </option>
  );
};

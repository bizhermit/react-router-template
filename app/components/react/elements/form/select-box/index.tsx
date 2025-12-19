import { use, useImperativeHandle, useRef, type ReactNode, type SelectHTMLAttributes } from "react";
import { ValidScriptsContext } from "~/components/react/providers/valid-scripts";
import { DownIcon } from "../../icon";
import { clsx, ZERO_WIDTH_SPACE } from "../../utilities";
import { InputDummyFocus } from "../dummy-focus";
import { Placeholder } from "../placeholder";
import { InputFieldWrapper, type InputFieldProps, type InputFieldWrapperProps } from "../wrapper/input-field";

export interface SelectBox$Ref extends InputRef {
  selectElement: HTMLSelectElement;
};

export type SelectBox$Props = Overwrite<
  InputFieldWrapperProps,
  InputFieldProps<{
    selectProps?: SelectHTMLAttributes<HTMLSelectElement>;
    children?: ReactNode;
    placeholder?: ReactNode;
  }>
>;

export function SelectBox$({
  ref,
  invalid,
  selectProps,
  state = { current: "enabled" },
  children,
  placeholder,
  ...props
}: SelectBox$Props) {
  const validScripts = use(ValidScriptsContext).valid;

  const wref = useRef<HTMLDivElement>(null!);
  const sref = useRef<HTMLSelectElement>(null!);
  const dref = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => ({
    element: wref.current,
    selectElement: sref.current,
    focus: () => (dref.current ?? sref.current)?.focus(),
  } as const satisfies SelectBox$Ref));

  return (
    <InputFieldWrapper
      {...props}
      ref={wref}
      state={state}
    >
      <select
        disabled={state.current !== "enabled"}
        aria-disabled={state.current === "disabled"}
        aria-readonly={state.current === "readonly"}
        aria-invalid={invalid}
        {...selectProps}
        className={clsx(
          "_ipt-box _ipt-select",
          selectProps?.className,
        )}
        ref={sref}
      >
        {children}
      </select>
      {
        validScripts &&
        state.current !== "disabled" &&
        <Placeholder>
          {placeholder}
        </Placeholder>
      }
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
          {
            selectProps?.name &&
            <input
              type="hidden"
              name={selectProps.name}
              value={selectProps.value as string || undefined}
            />
          }
          <InputDummyFocus
            ref={dref}
          />
        </>
      }
    </InputFieldWrapper>
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

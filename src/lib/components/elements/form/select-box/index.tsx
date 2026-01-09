import { use, useImperativeHandle, useRef, type ChangeEvent, type ReactNode, type SelectHTMLAttributes } from "react";
import { ValidScriptsContext } from "../../../../shared/providers/valid-scripts";
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
    selectProps?: Omit<
      SelectHTMLAttributes<HTMLSelectElement>,
      InputOmitProps
    >;
    children?: ReactNode;
    placeholder?: ReactNode;
  } & InputValueProps<string | number | boolean, string>>
>;

export function SelectBox$({
  ref,
  invalid,
  selectProps,
  state = "enabled",
  children,
  placeholder,
  defaultValue,
  onChangeValue,
  ...props
}: SelectBox$Props) {
  const validScripts = use(ValidScriptsContext).valid;

  const isControlled = "value" in props;
  const { value, ...wrapperProps } = props;

  const wref = useRef<HTMLDivElement>(null!);
  const sref = useRef<HTMLSelectElement>(null!);
  const dref = useRef<HTMLDivElement | null>(null);

  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    if (state === "enabled") {
      onChangeValue?.(e.currentTarget.value);
    }
    selectProps?.onChange?.(e);
  };

  useImperativeHandle(ref, () => ({
    element: wref.current,
    selectElement: sref.current,
    focus: () => (dref.current ?? sref.current)?.focus(),
  } as const satisfies SelectBox$Ref));

  return (
    <InputFieldWrapper
      {...wrapperProps}
      ref={wref}
      state={state}
    >
      <select
        disabled={state !== "enabled"}
        aria-disabled={state === "disabled"}
        aria-readonly={state === "readonly"}
        aria-invalid={invalid}
        {...selectProps}
        className={clsx(
          "_ipt-box _ipt-select",
          selectProps?.className,
        )}
        ref={sref}
        onChange={handleChange}
        {...isControlled
          ? { value: String(value ?? "") }
          : { defaultValue: String(defaultValue ?? "") }
        }
      >
        {children}
      </select>
      {
        state !== "disabled" &&
        <Placeholder>
          {placeholder}
        </Placeholder>
      }
      <div
        className={clsx(
          "_ipt-btn",
          state !== "enabled" && "opacity-0"
        )}
      >
        <DownIcon />
      </div>
      {
        state === "readonly" &&
        <>
          {
            selectProps?.name &&
            isControlled &&
            <input
              type="hidden"
              name={selectProps.name}
              value={value as string ?? undefined}
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

import { use, useImperativeHandle, useRef, useState, type ChangeEvent, type InputHTMLAttributes } from "react";
import { ValidScriptsContext } from "~/components/react/providers/valid-scripts";
import { CircleFillIcon, CircleIcon } from "../../icon";
import { clsx } from "../../utilities";
import { InputFieldWrapper, type InputFieldProps, type InputFieldWrapperProps } from "../wrapper/input-field";

export interface PasswordBox$Ref extends InputRef {
  inputElement: HTMLInputElement;
  toggleMask: () => void;
};

export type PasswordBox$Props = Overwrite<
  InputFieldWrapperProps,
  InputFieldProps<{
    inputProps?: Omit<
      InputHTMLAttributes<HTMLInputElement>,
      InputOmitProps
    >;
  } & InputValueProps<string>>
>;

export function PasswordBox$({
  ref,
  invalid,
  inputProps,
  state = "enabled",
  className,
  defaultValue,
  onChangeValue,
  ...props
}: PasswordBox$Props) {
  const isControlled = "value" in props;
  const { value, ...wrapperProps } = props;
  const validScripts = use(ValidScriptsContext).valid;

  const wref = useRef<HTMLDivElement>(null!);
  const iref = useRef<HTMLInputElement>(null!);
  const [type, setType] = useState<"password" | "text">("password");

  function toggleMask() {
    setType(type => type === "password" ? "text" : "password");
  };

  function handleClickToggleButton() {
    if (state !== "enabled") return;
    toggleMask();
  };

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (state === "enabled") {
      onChangeValue?.(e.currentTarget.value);
    }
    inputProps?.onChange?.(e);
  };

  useImperativeHandle(ref, () => ({
    element: wref.current,
    inputElement: iref.current,
    focus: () => iref.current.focus(),
    toggleMask,
  } as const satisfies PasswordBox$Ref));

  return (
    <InputFieldWrapper
      {...wrapperProps}
      className={clsx(
        "_ipt-default-width",
        className,
      )}
      ref={wref}
      state={state}
    >
      <input
        disabled={state === "disabled"}
        readOnly={state === "readonly"}
        aria-invalid={invalid}
        {...inputProps}
        type={type}
        className={clsx(
          "_ipt-box",
          validScripts && "pr-input-pad-btn",
          inputProps?.className,
        )}
        ref={iref}
        onChange={handleChange}
        {...isControlled
          ? { value: value ?? "" }
          : { defaultValue: defaultValue ?? "" }
        }
      />
      {
        validScripts &&
        <button
          type="button"
          className={clsx(
            "_ipt-btn",
            state === "enabled" && "cursor-pointer",
          )}
          aria-label="toggle masked"
          tabIndex={-1}
          onClick={handleClickToggleButton}
        >
          {
            type === "text" ?
              <CircleFillIcon /> :
              <CircleIcon />
          }
        </button>
      }
    </InputFieldWrapper>
  );
};

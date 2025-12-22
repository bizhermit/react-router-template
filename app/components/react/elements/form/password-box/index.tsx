import { use, useImperativeHandle, useRef, useState, type InputHTMLAttributes } from "react";
import { ValidScriptsContext } from "~/components/react/providers/valid-scripts";
import { CircleFillIcon, CircleIcon } from "../../icon";
import { clsx } from "../../utilities";
import { InputFieldWrapper, type InputFieldProps, type InputFieldWrapperProps } from "../wrapper/input-field";

export interface PasswordBox$Ref extends InputRef {
  inputElement: HTMLInputElement;
};

export type PasswordBox$Props = Overwrite<
  InputFieldWrapperProps,
  InputFieldProps<{
    inputProps?: InputHTMLAttributes<HTMLInputElement>;
  }>
>;

export function PasswordBox$({
  ref,
  invalid,
  inputProps,
  state = "enabled",
  className,
  ...props
}: PasswordBox$Props) {
  const wref = useRef<HTMLDivElement>(null!);
  const iref = useRef<HTMLInputElement>(null!);

  const validScripts = use(ValidScriptsContext).valid;

  const [type, setType] = useState<"password" | "text">("password");

  function handleClickToggleButton() {
    if (state !== "enabled") return;
    setType(type => type === "password" ? "text" : "password");
  };

  useImperativeHandle(ref, () => ({
    element: wref.current,
    inputElement: iref.current,
    focus: () => iref.current.focus(),
  } as const satisfies PasswordBox$Ref));

  return (
    <InputFieldWrapper
      {...props}
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
      />
      {
        validScripts &&
        state === "enabled" &&
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

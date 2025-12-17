import { use, useState, type InputHTMLAttributes, type ReactNode, type RefObject } from "react";
import { ValidScriptsContext } from "~/components/react/providers/valid-scripts";
import { CircleFillIcon, CircleIcon } from "../../icon";
import { clsx } from "../../utilities";
import { InputField, type InputFieldProps } from "../common";

type PasswordBox$Props = Overwrite<InputFieldProps, {
  ref?: RefObject<HTMLDivElement>;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  inputRef?: RefObject<HTMLInputElement>;
  state?: Schema.Mode;
  children?: ReactNode;
}>;

export function PasswordBox$({
  ref,
  inputProps,
  inputRef,
  state = "enabled",
  className,
  children,
  ...props
}: PasswordBox$Props) {
  const validScripts = use(ValidScriptsContext).valid;

  const [type, setType] = useState<"password" | "text">("password");

  function handleClickToggleButton() {
    if (state !== "enabled") return;
    setType(type => type === "password" ? "text" : "password");
  };

  return (
    <InputField
      {...props}
      className={clsx(
        "_ipt-default-width",
        className,
      )}
      ref={ref}
      state={state}
    >
      <input
        disabled={state === "disabled"}
        readOnly={state === "readonly"}
        {...inputProps}
        type={type}
        className={clsx(
          "_ipt-box",
          validScripts && "pr-input-pad-btn",
          inputProps?.className,
        )}
        ref={inputRef}
      />
      {children}
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
    </InputField>
  );
};

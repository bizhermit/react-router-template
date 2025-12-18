import { use, useImperativeHandle, useRef, useState, type InputHTMLAttributes, type RefObject } from "react";
import { ValidScriptsContext } from "~/components/react/providers/valid-scripts";
import { CircleFillIcon, CircleIcon } from "../../icon";
import { clsx } from "../../utilities";
import { InputField, type InputFieldProps, type InputRef } from "../common";

export interface PasswordBox$Ref extends InputRef<HTMLInputElement> { };

export type PasswordBox$Props = Overwrite<InputFieldProps, {
  ref?: RefObject<InputRef | null>;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
}>;

export function PasswordBox$({
  ref,
  inputProps,
  state = { current: "enabled" },
  className,
  ...props
}: PasswordBox$Props) {
  const wref = useRef<HTMLDivElement>(null!);
  const iref = useRef<HTMLInputElement>(null!);

  const validScripts = use(ValidScriptsContext).valid;

  const [type, setType] = useState<"password" | "text">("password");

  function handleClickToggleButton() {
    if (state.current !== "enabled") return;
    setType(type => type === "password" ? "text" : "password");
  };

  useImperativeHandle(ref, () => ({
    element: wref.current,
    inputElement: iref.current,
    focus: () => iref.current.focus(),
  }));

  return (
    <InputField
      {...props}
      className={clsx(
        "_ipt-default-width",
        className,
      )}
      ref={wref}
      state={state}
    >
      <input
        disabled={state.current === "disabled"}
        readOnly={state.current === "readonly"}
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
        state.current === "enabled" &&
        <button
          type="button"
          className={clsx(
            "_ipt-btn",
            state.current === "enabled" && "cursor-pointer",
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

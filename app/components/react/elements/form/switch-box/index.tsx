import { useImperativeHandle, useRef, type InputHTMLAttributes } from "react";
import { clsx, getColorClassName } from "../../utilities";
import { InputDummyFocus } from "../dummy-focus";
import { InputLabelText } from "../input-label-text";
import { InputLabelWrapper, type InputLabelProps, type InputLabelWrapperProps } from "../wrapper/input-label";

export interface SwitchBox$Ref extends InputRef {
  inputElement: HTMLInputElement;
};

export type SwitchBox$Props = Overwrite<
  InputLabelWrapperProps,
  InputLabelProps<{
    inputProps?: InputHTMLAttributes<HTMLInputElement>;
    color?: StyleColor;
  }>
>;

export function SwitchBox$({
  ref,
  invalid,
  inputProps,
  state = { current: "enabled" },
  children,
  color,
  ...props
}: SwitchBox$Props) {
  const wref = useRef<HTMLLabelElement>(null!);
  const iref = useRef<HTMLInputElement>(null!);
  const dref = useRef<HTMLDivElement>(null!);

  useImperativeHandle(ref, () => ({
    element: wref.current,
    inputElement: iref.current,
    focus: () => (dref.current ?? iref.current).focus(),
  } as const satisfies SwitchBox$Ref));

  return (
    <InputLabelWrapper
      {...props}
      ref={wref}
      state={state}
    >
      <input
        disabled={state.current !== "enabled"}
        aria-disabled={state.current === "disabled"}
        aria-readonly={state.current === "readonly"}
        aria-invalid={invalid}
        {...inputProps}
        className={clsx(
          "_ipt-switch",
          getColorClassName(color),
          inputProps?.className,
        )}
        ref={iref}
        type="checkbox"
      />
      <InputLabelText>
        {children}
      </InputLabelText>
      {
        state.current === "readonly" &&
        <>
          {
            inputProps?.name &&
            <input
              type="hidden"
              name={inputProps.name}
              value={inputProps?.value as string || undefined}
            />
          }
          <InputDummyFocus
            ref={dref}
          />
        </>
      }
    </InputLabelWrapper>
  );
};

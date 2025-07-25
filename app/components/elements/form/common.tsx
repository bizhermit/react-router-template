import type { HTMLAttributes, ReactNode, RefObject } from "react";
import { clsx, ZERO_WIDTH_SPACE } from "../utilities";
import { InputMessageSpan } from "./message";

export type InputWrapProps = {
  className?: string;
  autoFocus?: boolean;
  hideMessage?: boolean;
  omitOnSubmit?: boolean;
};

type CoreProps = {
  core?: {
    classNames?: string;
    state?: RefObject<Schema.Mode>;
    result?: Schema.Result | null | undefined;
  };
};

type InputFieldProps =
  & HTMLAttributes<HTMLDivElement>
  & InputWrapProps
  & CoreProps;

export function InputField({
  className,
  hideMessage,
  core,
  children,
  ...props
}: InputFieldProps) {
  if (core?.state?.current === "hidden") return null;

  return (
    <>
      <div
        {...props}
        className={clsx(
          "ipt ipt-field",
          core?.classNames,
          className,
        )}
      >
        <fieldset
          aria-hidden
          className={clsx(
            "ipt-field-appearance",
            core?.state?.current === "disabled" ?
              "ipt-field-disabled" :
              core?.state?.current === "readonly" ?
                "ipt-field-readonly" :
                "ipt-field-enabled",
          )}
        >
          <legend>{ZERO_WIDTH_SPACE}</legend>
        </fieldset>
        {children}
      </div>
      {
        !hideMessage && core?.state?.current === "enabled" &&
        <InputMessageSpan result={core.result} />
      }
    </>
  );
};

type InputGroupProps =
  & HTMLAttributes<HTMLDivElement>
  & InputWrapProps
  & CoreProps
  & {
    ref?: RefObject<HTMLDivElement>;
  };

export function InputGroup({
  className,
  hideMessage,
  core,
  ref,
  ...props
}: InputGroupProps) {
  if (core?.state?.current === "hidden") return null;
  return (
    <>
      <div
        {...props}
        ref={ref}
        className={clsx(
          "ipt ipt-group",
          core?.classNames,
          className,
        )}
      />
      {
        !hideMessage && core?.state?.current === "enabled" &&
        <InputMessageSpan result={core.result} />
      }
    </>
  );
};

type InputLabelProps =
  & HTMLAttributes<HTMLLabelElement>
  & InputWrapProps
  & CoreProps;

export function InputLabel({
  className,
  hideMessage,
  core,
  ...props
}: InputLabelProps) {
  if (core?.state?.current === "hidden") return null;

  return (
    <>
      <label
        {...props}
        className={clsx(
          "ipt-label",
          core?.classNames,
          className,
        )}
      />
      {
        !hideMessage && core?.state?.current === "enabled" &&
        <InputMessageSpan result={core.result} />
      }
    </>
  );
};

export function InputLabelText({
  className,
  children,
}: { className?: string; children?: ReactNode; }) {
  if (!children) return;
  return <span className={clsx("ipt-label-text", className)}>{children}</span>;
}

interface PlaceholderProps {
  validScripts: boolean;
  state: RefObject<Schema.Mode>;
  children?: string;
};

export function Placeholder({
  validScripts,
  state,
  children,
}: PlaceholderProps) {
  if (!children) return null;
  if (validScripts && state.current === "disabled") return null;
  return (
    <div
      className="ipt-placeholder"
    >
      <span className="w-full overflow-hidden">
        {children}
      </span>
    </div>
  );
};

export function InputDummyFocus(props: { ref?: RefObject<HTMLDivElement | null>; }) {
  return (
    <div
      ref={props.ref}
      tabIndex={0}
      className="absolute inset-0 z-10 select-none outline-none"
    />
  );
};

type FormItemProps =
  & HTMLAttributes<HTMLDivElement>
  & {
  };

export function FormItem({
  className,
  children,
  ...props
}: FormItemProps) {
  return (
    <div
      {...props}
      className={clsx("form-item", className)}
    >
      {children}
    </div>
  );
};

export function getValidationValue<T extends Schema.$ValidationValue<unknown>>(
  params: Schema.DynamicValidationValueParams,
  validationValue: T,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type V = T extends ((...args: any[]) => infer V) ? V : T;
  if (validationValue == null) return undefined as V;
  if (typeof validationValue === "function") return validationValue(params) as V;
  return validationValue as V;
};

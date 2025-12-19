import type { CSSProperties, HTMLAttributes, ReactNode, RefObject } from "react";
import { clsx, ZERO_WIDTH_SPACE } from "../utilities";
import { InputMessageSpan } from "./message";

export interface InputRef {
  element: HTMLDivElement;
  focus: () => void;
};

export type InputWrapProps = {
  className?: string;
  style?: CSSProperties;
  autoFocus?: boolean;
  hideMessage?: boolean;
  omitOnSubmit?: boolean;
};

type CoreProps = {
  core?: {
    className?: string;
    state?: RefObject<Schema.Mode>;
    result?: Schema.Result | null | undefined;
  };
};

export interface WithMessage {
  hide?: boolean;
  state: Schema.Mode;
  result: Schema.Result | null | undefined;
  children?: ReactNode;
};

export function WithMessage({
  hide = false,
  state,
  result,
  children,
}: WithMessage) {
  return (
    <>
      {children}
      {
        !hide &&
        state === "enabled" &&
        <InputMessageSpan
          result={result}
        />
      }
    </>
  );
}

export type InputFieldProps = Overwrite<HTMLAttributes<HTMLDivElement>, {
  ref?: RefObject<HTMLDivElement>;
  label?: ReactNode;
  state?: RefObject<Schema.Mode>;
}>;

export function InputField({
  className,
  children,
  ref,
  label,
  state,
  ...props
}: InputFieldProps) {
  if (state?.current === "hidden") return null;
  return (
    <div
      {...props}
      ref={ref}
      className={clsx(
        "_ipt _ipt-field",
        className,
      )}
    >
      <fieldset
        aria-hidden
        className={`_ipt-field-appearance _ipt-field-${state?.current || "enabled"}`}
      >
        <legend>
          {label ?? ZERO_WIDTH_SPACE}
        </legend>
      </fieldset>
      {children}
    </div>
  );
};

type OldInputFieldProps =
  & HTMLAttributes<HTMLDivElement>
  & InputWrapProps
  & CoreProps;

export function OldInputField({
  className,
  hideMessage,
  core,
  children,
  ...props
}: OldInputFieldProps) {
  if (core?.state?.current === "hidden") return null;

  return (
    <>
      <div
        {...props}
        className={clsx(
          "_ipt _ipt-field",
          core?.className,
          className,
        )}
      >
        <fieldset
          aria-hidden
          className={clsx(
            "_ipt-field-appearance",
            core?.state?.current === "disabled" ?
              "_ipt-field-disabled" :
              core?.state?.current === "readonly" ?
                "_ipt-field-readonly" :
                "_ipt-field-enabled",
          )}
        >
          <legend>
            {ZERO_WIDTH_SPACE}
          </legend>
        </fieldset>
        {children}
      </div>
      {
        !hideMessage &&
        core?.state?.current === "enabled" &&
        <InputMessageSpan
          result={core.result}
        />
      }
    </>
  );
};

type InputGroupProps = Overwrite<HTMLAttributes<HTMLDivElement>, {
  ref?: RefObject<HTMLDivElement>;
  state?: RefObject<Schema.Mode>;
}>;

export function InputGroup({
  className,
  ref,
  state,
  ...props
}: InputGroupProps) {
  if (state?.current === "hidden") return null;

  return (
    <div
      {...props}
      ref={ref}
      className={clsx(
        "_ipt _ipt-group",
        className,
      )}
    />
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
          "_ipt-label",
          core?.className,
          className,
        )}
      />
      {
        !hideMessage &&
        core?.state?.current === "enabled" &&
        <InputMessageSpan
          result={core.result}
        />
      }
    </>
  );
};

export function InputLabelText({
  className,
  children,
}: { className?: string; children?: ReactNode; }) {
  if (!children) return;
  return (
    <span
      className={clsx(
        "_ipt-label-text",
        className,
      )}
    >
      {children}
    </span>
  );
}

interface PlaceholderProps {
  className?: string;
  validScripts: boolean;
  state: RefObject<Schema.Mode>;
  children?: ReactNode;
};

export function Placeholder({
  className,
  validScripts,
  state,
  children,
}: PlaceholderProps) {
  if (!children) return null;
  if (validScripts && state.current === "disabled") return null;

  return (
    <div
      className={clsx(
        "_ipt-placeholder",
        className,
      )}
    >
      <span
        className="w-full overflow-hidden"
      >
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
      className={clsx(
        "_form-item",
        className,
      )}
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

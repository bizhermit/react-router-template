import { type FieldsetHTMLAttributes } from "react";
import { FieldSetContext, useFieldSet } from "~/components/schema/hooks";

type FieldSetProps = FieldsetHTMLAttributes<HTMLFieldSetElement> & {
  readOnly?: boolean;
  hide?: boolean;
};

export function FieldSet({
  disabled,
  readOnly,
  hide,
  children,
  ...props
}: FieldSetProps) {
  if (hide) return null;

  const ctx = useFieldSet();
  const isDisabled = ctx.disabled || !!disabled;
  const isReadOnly = ctx.readOnly || !!readOnly;

  return (
    <FieldSetContext
      value={{
        disabled: isDisabled,
        readOnly: isReadOnly,
      }}
    >
      <fieldset
        {...props}
        disabled={isDisabled}
        aria-readonly={isReadOnly}
      >
        {children}
      </fieldset>
    </FieldSetContext>
  );
};

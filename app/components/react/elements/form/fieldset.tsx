import { use, type FieldsetHTMLAttributes } from "react";
import { FieldSetContext } from "~/components/react/hooks/schema";

type FieldSetProps = Overwrite<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  {
    readOnly?: boolean;
    hide?: boolean;
  }
>;

export function FieldSet({
  disabled,
  readOnly,
  hide,
  children,
  ...props
}: FieldSetProps) {
  if (hide) return null;

  const ctx = use(FieldSetContext);
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

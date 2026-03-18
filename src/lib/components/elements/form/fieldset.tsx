import { use, type FieldsetHTMLAttributes } from "react";
import { FieldSetContext } from "../../../shared/hooks/schema";

/** フィールドセット Props  */
type FieldSetProps = Overwrite<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  {
    /** 読取専用 @default false */
    readOnly?: boolean;
    /** 非表示 @default false */
    hide?: boolean;
  }
>;

/**
 * フィールドセット（disabled, readonly対応）
 * @param param {@link FieldSetProps}
 * @returns
 */
export function FieldSet({
  disabled = false,
  readOnly = false,
  hide = false,
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

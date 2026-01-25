import type { MouseEvent } from "react";
// eslint-disable-next-line no-restricted-imports
import { Link, type LinkProps } from "react-router";
import type { ButtonOptions } from ".";
import { clsx, getColorClassName } from "../utilities";

type LinkButtonProps = LinkProps
  & React.RefAttributes<HTMLAnchorElement>
  & ButtonOptions
  & {
    disabled?: boolean;
  };

export function LinkButton({
  className,
  color,
  appearance = "outline",
  round,
  disabled,
  processing,
  ...props
}: LinkButtonProps) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    if (disabled) e.preventDefault();
  };

  return (
    <Link
      prefetch="intent"
      {...props}
      className={clsx(
        "_btn",
        getColorClassName(color),
        className,
      )}
      role="button"
      aria-disabled={disabled}
      data-appearance={appearance}
      data-round={round}
      data-processing={processing}
      onClick={handleClick}
    />
  );
};

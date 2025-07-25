import type { MouseEvent } from "react";
// eslint-disable-next-line no-restricted-imports
import { Link, type LinkProps } from "react-router";
import type { ButtonOptions } from "./button";
import { clsx, getColorClassName } from "./utilities";

type LinkButtonProps = LinkProps
  & React.RefAttributes<HTMLAnchorElement>
  & Omit<ButtonOptions, "onClick">;

export function LinkButton({
  className,
  color,
  appearance,
  round,
  disabled,
  ...props
}: LinkButtonProps) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    if (disabled) e.preventDefault();
  };

  return (
    <Link
      {...props}
      className={clsx(getColorClassName(color), className)}
      role="button"
      aria-disabled={disabled}
      data-appearance={appearance || "fill"}
      data-round={round}
      onClick={handleClick}
    />
  );
};

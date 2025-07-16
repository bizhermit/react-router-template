import type { MouseEvent } from "react";
import { Link, type LinkProps } from "react-router";
import type { ButtonOptions } from "./button";

type LinkButtonProps = LinkProps
  & React.RefAttributes<HTMLAnchorElement>
  & Omit<ButtonOptions, "onClick">;

export function LinkButton({
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
      role="button"
      aria-disabled={disabled}
      data-color={color || "primary"}
      data-appearance={appearance || "fill"}
      data-round={round}
      onClick={handleClick}
    />
  );
};

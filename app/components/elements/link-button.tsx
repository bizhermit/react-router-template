import { Link, type LinkProps } from "react-router";
import type { ButtonOptions } from "./button";

type LinkButtonProps = LinkProps
  & React.RefAttributes<HTMLAnchorElement>
  & ButtonOptions;

export function LinkButton({
  color,
  appearance,
  round,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      {...props}
      role="button"
      data-color={color || "primary"}
      data-appearance={appearance || "fill"}
      data-round={round}
    />
  );
};

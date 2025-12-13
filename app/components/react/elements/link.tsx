// eslint-disable-next-line no-restricted-imports
import { Link as $Link, type LinkProps as $LinkProps } from "react-router";
import { clsx } from "./utilities";

type LinkProps = $LinkProps
  & React.RefAttributes<HTMLAnchorElement>;

export function Link({
  className,
  ...props
}: LinkProps) {
  return (
    <$Link
      {...props}
      className={clsx(
        "_link",
        className,
      )}
    />
  );
};

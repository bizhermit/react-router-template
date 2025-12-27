// eslint-disable-next-line no-restricted-imports
import { Link as $Link, generatePath, type LinkProps as $LinkProps, type Register } from "react-router";
import { clsx } from "./utilities";

type DynamicPath = `${string}/${"*" | ":"}${string}`;
type Pages = Register["pages"];
type PagePath = keyof Pages;
type PageToUnion = {
  [K in PagePath]: {
    pathname: K;
    params?: K extends DynamicPath ? Pages[K]["params"] : never;
    search?: string;
    hash?: string;
  }
}[PagePath];

type LinkProps = Overwrite<
  $LinkProps & React.RefAttributes<HTMLAnchorElement>,
  {
    to:
    | Exclude<PagePath, DynamicPath>
    | PageToUnion;
  }
>;

export function Link({
  className,
  to,
  ...props
}: LinkProps) {
  return (
    <$Link
      {...props}
      to={
        typeof to === "string"
          ? to
          : {
            pathname: generatePath(
              to.pathname as string, // NOTE: paramsの型を推論させない
              to.params
            ),
            search: to.search,
            hash: to.hash,
          }
      }
      className={clsx(
        "_link",
        className,
      )}
    />
  );
};

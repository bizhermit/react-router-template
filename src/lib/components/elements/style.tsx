import { use, type StyleHTMLAttributes } from "react";
import { CspContext } from "~/auth/shared/providers/csp";

/** スタイル Props */
export type StyleProps = Overwrite<
  Omit<StyleHTMLAttributes<HTMLStyleElement>, "nonce">,
  {
    children?: string | string[];
  }
>;

/**
 * Style（nonce対応）
 * @param props {@link StyleProps}
 * @returns
 */
export function Style(props: StyleProps) {
  const nonce = use(CspContext).nonce;
  return (
    <style
      {...props}
      nonce={nonce}
    />
  );
};

import { use, type StyleHTMLAttributes } from "react";
import { CspContext } from "~/auth/shared/providers/csp";

export type StyleProps = Overwrite<
  Omit<StyleHTMLAttributes<HTMLStyleElement>, "nonce">,
  {
    children?: string | string[];
  }
>;

export function Style(props: StyleProps) {
  const nonce = use(CspContext).nonce;
  return (
    <style
      {...props}
      nonce={nonce}
    />
  );
};

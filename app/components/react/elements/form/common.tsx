import type { CSSProperties } from "react";

export interface InputRef {
  element: HTMLElement;
  focus: () => void;
};

export type InputWrapProps = {
  className?: string;
  style?: CSSProperties;
  autoFocus?: boolean;
  hideMessage?: boolean;
  omitOnSubmit?: boolean;
};

interface InputRef {
  element: HTMLElement;
  focus: () => void;
};

interface InputProps {
  ref?: React.RefObject<InputRef | null>;
  invalid?: boolean | undefined;
};

interface InputPropsWithDataItem<D extends Schema.DataItem> {
  className?: string;
  style?: React.CSSProperties;
  $: D;
  ref?: React.RefObject<InputRef | null>;
  autoFocus?: boolean;
  hideMessage?: boolean;
  omitOnSubmit?: boolean;
};

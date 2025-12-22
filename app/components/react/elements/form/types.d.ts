interface InputRef {
  element: HTMLElement;
  focus: () => void;
};

interface InputProps {
  ref?: React.RefObject<InputRef | null>;
  invalid?: boolean | undefined;
};

type InputOmitProps =
  | "value"
  | "defaultValue"
  | "checked"
  | "defaultChecked";

interface InputPropsWithDataItem<D extends Schema.DataItem> {
  className?: string;
  style?: React.CSSProperties;
  $: D;
  ref?: React.RefObject<InputRef | null>;
  autoFocus?: boolean;
  hideMessage?: boolean;
  omitOnSubmit?: boolean;
};

type InputValueProps<T, U = T> = {
  onChangeValue?: (v: U | undefined) => void;
} & (
    | {
      value: T | null | undefined;
      defaultValue?: never;
    }
    | {
      value?: never;
      defaultValue?: T | null | undefined;
    }
  );

type InputCheckedProps = {
  onChangeValue?: (v: boolean) => void;
} & (
    | {
      checked: boolean | null | undefined;
      defaultChecked?: never;
    }
    | {
      checked?: never;
      defaultChecked?: boolean | null | undefined;
    }
  );

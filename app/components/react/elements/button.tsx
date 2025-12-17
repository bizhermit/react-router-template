import { useRef, useState, type ButtonHTMLAttributes, type MouseEvent, type MouseEventHandler, type RefObject } from "react";
import { clsx, getColorClassName } from "./utilities";

export interface ButtonClickParams {
  event: MouseEvent<HTMLButtonElement>;
  unlock: (focus?: boolean) => void;
};

type ButtonClickEventHandler = (parmas: ButtonClickParams) => (void | Promise<void>);

export interface ButtonActionProps {
  disabled?: boolean;
  onClick?: ButtonClickEventHandler;
};

export interface ButtonOptions {
  ref?: RefObject<HTMLButtonElement>;
  color?: StyleColor;
  appearance?: "fill" | "outline" | "text";
  round?: boolean;
};

type ButtonProps = Overwrite<ButtonHTMLAttributes<HTMLButtonElement>, ButtonActionProps & ButtonOptions>;

export function useButtonClickHandler(props: ButtonActionProps): {
  handleClick: MouseEventHandler;
  disabled: boolean;
  processing: boolean;
  processingRef: RefObject<boolean>;
} {
  const disabledRef = useRef(false);
  disabledRef.current = props.disabled ?? false;
  const [processing, setProcessing] = useState(false);
  const processingRef = useRef(processing);
  const revRef = useRef(0);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (
      disabledRef.current ||
      processingRef.current ||
      event.currentTarget.matches(":disabled")
    ) {
      event.preventDefault();
      return;
    }
    setProcessing(processingRef.current = true);
    const rev = ++revRef.current;
    const unlock = () => {
      if (revRef.current !== rev) return;
      setProcessing(processingRef.current = false);
    };
    const res = props.onClick?.({ event, unlock });
    if (res == null) unlock();
  };

  return {
    handleClick,
    disabled: disabledRef.current,
    processing,
    processingRef,
  } as const;
};

export function Button({
  className,
  color,
  appearance,
  round,
  disabled,
  onClick,
  ...props
}: ButtonProps) {
  const {
    handleClick,
    processing,
  } = useButtonClickHandler({
    disabled,
    onClick,
  });

  return (
    <button
      type="button"
      {...props}
      className={clsx(
        "_btn",
        getColorClassName(color),
        className,
      )}
      disabled={disabled || processing}
      data-appearance={appearance || "fill"}
      data-round={round}
      data-processing={processing}
      onClick={handleClick}
    />
  );
};

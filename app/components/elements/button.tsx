import { useRef, useState, type ButtonHTMLAttributes, type MouseEvent, type RefObject } from "react";
import { clsx } from "./utilities";

export interface ButtonClickParams {
  event: MouseEvent<HTMLButtonElement>;
  unlock: (focus?: boolean) => void;
};

export interface ButtonOptions {
  ref?: RefObject<HTMLButtonElement>;
  disabled?: boolean;
  color?: StyleColor;
  appearance?: "fill" | "outline" | "text";
  round?: boolean;
  onClick?: (parmas: ButtonClickParams) => (void | Promise<void>);
};

type ButtonProps = Overwrite<ButtonHTMLAttributes<HTMLButtonElement>, ButtonOptions>;

export function Button({
  className,
  color,
  appearance,
  round,
  onClick,
  ...props
}: ButtonProps) {
  const [disabled, setDisabled] = useState(false);
  const disabledRef = useRef(disabled);

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    if (props.disabled || disabledRef.current || e.currentTarget.matches(":disabled")) {
      e.preventDefault();
      return;
    }
    setDisabled(disabledRef.current = true);
    const unlock = () => setDisabled(disabledRef.current = false);
    const res = onClick?.({ event: e, unlock });
    if (res == null) unlock();
  };

  return (
    <button
      type="button"
      {...props}
      className={clsx(
        "btn",
        className,
      )}
      disabled={props.disabled || disabled}
      data-color={color}
      data-appearance={appearance || "fill"}
      data-round={round}
      onClick={handleClick}
    />
  );
};

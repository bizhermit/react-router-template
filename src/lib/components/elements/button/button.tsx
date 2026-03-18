import { useRef, useState, type MouseEvent } from "react";
import { Button$, type Button$Props } from ".";

/** ボタンクリックイベント引数 */
export interface ButtonClickParams {
  /** イベント */
  event: MouseEvent<HTMLButtonElement>;
  /**
   * 非同期関数の場合にボタン非活性状態を解除する
   * @param focus ボタンにフォーカスする
   * @returns
   */
  unlock: (focus?: boolean) => void;
};

/** ボタンクリック制御フック引数 */
export interface ButtonActionProps {
  /** 非活性 */
  disabled?: boolean;
  /**
   * クリックイベント
   * @param parmas {@link ButtonClickParams}
   * @returns
   */
  onClick?: (parmas: ButtonClickParams) => (void | Promise<void>);
};

/**
 * ボタンクリック制御フック
 * @param props {@link ButtonActionProps}
 * @returns
 */
export function useButtonClickHandler(props: ButtonActionProps) {
  const [processing, setProcessing] = useState(false);
  const processingRef = useRef(processing);
  const revRef = useRef(0);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (
      props.disabled ||
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
    disabled: props.disabled ?? false,
    processing,
    processingRef,
  } as const;
};

/** ボタン Props */
export type ButtonProps = Overwrite<
  Omit<Button$Props, "type">,
  ButtonActionProps
>;

/**
 * ボタン（多重クリック防止制御あり）
 * - 純粋なsubmit/resetの場合は{@link Button$}を使用する
 * @param props {@link ButtonProps}
 * @returns
 */
export function Button({
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
    <Button$
      {...props}
      disabled={disabled || processing}
      processing={processing}
      onClick={handleClick}
    />
  );
};

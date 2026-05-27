import { useRef, useState, type MouseEvent } from "react";

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
export function useClickButton(props: ButtonActionProps) {
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
    onClick: handleClick,
    disabled: props.disabled ?? false,
    processing,
  } as const;
};

export type ClickButtonProps = ReturnType<typeof useClickButton>;

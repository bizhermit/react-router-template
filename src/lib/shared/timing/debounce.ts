export interface DebounceFunc<T extends Array<unknown>> {
  (...args: T): void;
  cancel: () => void;
};

/**
 * 連続する最後の処理を実行する
 * @param callback
 * @param delay 連続と見なす間隔
 * @returns
 */
export default function debounce<T extends Array<unknown>>(
  callback: (...args: T) => void,
  delay = 0
) {
  let t: NodeJS.Timeout | null = null;

  const f = function (this: unknown, ...args: T) {
    if (t) clearTimeout(t);

    t = setTimeout(() => {
      callback.apply(this, args);
      t = null;
    }, delay);
  } as DebounceFunc<T>;

  f.cancel = function () {
    if (t) {
      clearTimeout(t);
      t = null;
    }
  };

  return f;
};

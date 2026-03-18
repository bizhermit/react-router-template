export interface DebounceFunc<T extends Array<unknown>> {
  (...args: T): void;
  cancel: () => void;
};

/**
 * 連続する最後の処理を実行する
 * @param callback 処理
 * @param delay 連続と見なす間隔 @default 0
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

/**
 * 連続する最初の処理を実行し、その後はロックが解除されるまで呼び出しを無視する
 * @param callback 処理
 * @param delay ロックを解除する間隔 @default 0
 * @param noExtend ロック期間を延長しない @default false
 * - false: 連打されるとロック期間が延長される
 * - true: 連打されてもロック期間は延長されない
 * @returns
 */
export function debounceLeading<T extends Array<unknown>>(
  callback: (...args: T) => void,
  delay = 0,
  noExtend = false
) {
  let t: NodeJS.Timeout | null = null;

  const f = function (this: unknown, ...args: T) {
    if (t) {
      if (noExtend) return;
      clearTimeout(t);
    }

    const shouldInvoke = !t;

    t = setTimeout(() => {
      t = null;
    }, delay);

    if (shouldInvoke) callback.apply(this, args);
  } as DebounceFunc<T>;

  f.cancel = function () {
    if (t) {
      clearTimeout(t);
      t = null;
    }
  };

  return f;
};

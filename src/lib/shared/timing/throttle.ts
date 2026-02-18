export interface ThrottleFunc<T extends Array<unknown>> {
  (...args: T): void;
  cancel: () => void;
};

/**
 * 一定間隔で処理を実行する
 * @param callback
 * @param timeout
 * @param delayFirst
 * @returns
 */
export default function throttle<T extends Array<unknown>>(
  callback: (...args: T) => void,
  timeout = 0,
  delayFirst = false
) {
  let t: NodeJS.Timeout | null = null;
  let l = delayFirst ? Date.now() : 0;

  const f = function (this: unknown, ...args: T) {
    if (t) clearTimeout(t);
    const remaining = timeout - (Date.now() - l);

    if (remaining <= 0) {
      callback.apply(this, args);
      t = null;
      l = Date.now();
      return;
    }

    t = setTimeout(() => {
      callback.apply(this, args);
      t = null;
      l = Date.now();
    }, remaining);
  } as ThrottleFunc<T>;

  f.cancel = function () {
    if (t) {
      clearTimeout(t);
      t = null;
    }
    l = delayFirst ? Date.now() : 0;
  };

  return f;
};

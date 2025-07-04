export default function throttle<T extends Array<unknown>>(
  func: (...args: T) => void,
  timeout = 0
) {
  let t: NodeJS.Timeout | null = null;
  let l = Date.now();
  return (...args: T) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => {
      func(...args);
      t = null;
      l = Date.now();
    }, timeout - (Date.now() - l));
  };
};

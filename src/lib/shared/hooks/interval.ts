import { useEffect, useRef } from "react";

/**
 * 一定間隔で処理を実行する
 * @param callback 処理
 * @param delay 間隔
 */
export function useInterval(
  callback: () => void,
  delay: number | false | null,
) {
  const t = useRef<NodeJS.Timeout | null>(null);
  const c = useRef<() => void>(callback);

  function dispose() {
    if (!t.current) return;
    clearInterval(t.current);
    t.current = null;
  };

  useEffect(() => {
    c.current = callback;
  });

  useEffect(() => {
    dispose();
    if (typeof delay === "number") {
      t.current = setInterval(
        () => {
          c.current();
        },
        delay
      );
    }
  }, [delay]);

  useEffect(() => {
    return () => {
      dispose();
    };
  }, []);
};

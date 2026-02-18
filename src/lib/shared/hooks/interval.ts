import { useEffect, useRef } from "react";

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

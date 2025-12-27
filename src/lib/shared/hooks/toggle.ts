import { useState } from "react";

export const useToggle = (init: boolean | (() => boolean) = false) => {
  const [f, set] = useState(init);
  return {
    flag: f,
    on: () => set(true),
    off: () => set(false),
    toggle: () => set(c => !c),
  } as const;
};

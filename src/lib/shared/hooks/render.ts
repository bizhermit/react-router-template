import { useState } from "react";

/**
 * 強制再描画フック
 * @returns
 */
export function useRender() {
  const [_, setRevision] = useState(0);
  function render() {
    setRevision(c => c + 1);
  };
  return render;
};

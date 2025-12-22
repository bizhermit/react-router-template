import { useState } from "react";

export function useRender() {
  const [_, setRevision] = useState(0);
  function render() {
    setRevision(c => c + 1);
  };
  return render;
};

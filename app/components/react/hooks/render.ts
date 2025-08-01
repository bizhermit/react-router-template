import { useState } from "react";

const useRender = () => {
  const [revision, setRevision] = useState(0);
  const render = () => setRevision(c => c + 1);
  render.revision = revision;
  return render;
};

export default useRender;

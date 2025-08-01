import { createContext, useLayoutEffect, useState, type ReactNode } from "react";

type ContextProps = {
  valid: boolean;
};

export const ValidScriptsContext = createContext<ContextProps>({
  valid: false,
});

export function ValidScriptsProvider(props: {
  initValid?: boolean;
  children?: ReactNode;
}) {
  const [valid, setVaild] = useState(props.initValid ?? false);
  useLayoutEffect(() => {
    document.cookie = "js=t; path=/";
    setVaild(true);
  }, []);
  return (
    <ValidScriptsContext value={{ valid }}>
      {props.children}
    </ValidScriptsContext>
  );
};

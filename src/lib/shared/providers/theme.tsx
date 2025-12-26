import { deleteCookie, setCookie } from "$/client/cookie";
import { createContext, use, useReducer, type Dispatch, type ReactNode } from "react";

type Theme = "auto" | "light" | "dark";

const DATA_ATTR_NAME = "data-theme";
const COOKIE_KEY = "theme";

interface ThemeContextProps {
  theme: Theme;
  setTheme: Dispatch<Theme>;
};

const ThemeContext = createContext<ThemeContextProps>({
  theme: "auto",
  setTheme: () => { },
});

interface ThemeProviderProps {
  defaultTheme?: string;
  children?: ReactNode;
};

export function useTheme() {
  return use(ThemeContext);
}

export function ThemeProvider(props: ThemeProviderProps) {
  const [theme, setTheme] = useReducer((_: Theme, action: Theme) => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute(DATA_ATTR_NAME, action);
      if (action === "auto") deleteCookie(COOKIE_KEY);
      else setCookie(COOKIE_KEY, action);
    }
    return action;
  }, (props.defaultTheme || "auto") as Theme);

  return (
    <ThemeContext
      value={{
        theme,
        setTheme,
      }}
    >
      {props.children}
    </ThemeContext>
  );
};

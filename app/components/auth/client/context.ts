import { createContext, use } from "react";

interface AuthContextProps {
  csrfToken?: string | undefined;
}

export const AuthContext = createContext<AuthContextProps>({});

export function useAuthContext() {
  return use(AuthContext);
};

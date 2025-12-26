import { createContext, use } from "react";

interface AuthContextProps {
  user?: UserData;
};

export const AuthContext = createContext<AuthContextProps>({});

export function useAuthContext() {
  return use(AuthContext);
};

import { createContext, use, type ReactNode } from "react";

interface AuthContextProps {
  user?: UserData;
};

export const AuthContext = createContext<AuthContextProps>({});

export function useAuthContext() {
  return use(AuthContext);
};

interface Props {
  user: UserData | undefined;
  children?: ReactNode;
};

export function AuthProvider({
  user,
  children,
}: Props) {
  return (
    <AuthContext
      value={{
        user,
      }}
    >
      {children}
    </AuthContext>
  );
};

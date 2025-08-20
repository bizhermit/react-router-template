import { type ReactNode } from "react";
import { AuthContext } from "./context";

interface Props {
  children: ReactNode;
  csrfToken: string | undefined;
  session: import("@auth/core/types").Session | null;
}

export function AuthProvider({ children, csrfToken, session }: Props) {
  return (
    <AuthContext
      value={{
        csrfToken,
        session,
      }}
    >
      {children}
    </AuthContext>
  );
};

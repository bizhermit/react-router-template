import type { ReactNode } from "react";
import { AuthContext } from "./context";

interface Props {
  children: ReactNode;
  csrfToken?: string;
}

export function AuthProvider({ children, csrfToken }: Props) {
  return (
    <AuthContext
      value={{
        csrfToken,
      }}
    >
      {csrfToken && <meta name="csrf-token" content={csrfToken} />}
      {children}
    </AuthContext>
  );
};

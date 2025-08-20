import type { ReactNode } from "react";
import { AuthContext } from "./context";

interface Props {
  children: ReactNode;
  csrfToken: string | undefined;
  session: import("@auth/core/types").Session | null;
}

export function AuthProvider({ children, csrfToken, session }: Props) {
  console.log("- AuthProvider -");
  console.log("  - csrfToken", csrfToken);
  console.log("  - session", session);
  return (
    <AuthContext
      value={{
        csrfToken,
        session,
      }}
    >
      {csrfToken && <meta name="csrf-token" content={csrfToken} />}
      {children}
    </AuthContext>
  );
};

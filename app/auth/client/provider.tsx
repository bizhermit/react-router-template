import { useState, type ReactNode } from "react";
import { AuthContext } from "./context";

interface Props {
  children: ReactNode;
  csrfToken: string | undefined;
  session: import("@auth/core/types").Session | null;
}

export function AuthProvider(props: Props) {
  const [csrfToken, setCsrfToken] = useState(props.csrfToken);
  const [session, setSession] = useState(props.session);

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
      {props.children}
    </AuthContext>
  );
};

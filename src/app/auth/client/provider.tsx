import type { ReactNode } from "react";
import { AuthContext } from "./context";

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

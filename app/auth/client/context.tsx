import { createContext, use } from "react";

interface AuthContextProps {
  csrfToken?: string | undefined;
  session?: import("@auth/core/types").Session["data"] | null;
}

export const AuthContext = createContext<AuthContextProps>({});

export function useAuthContext() {
  const ctx = use(AuthContext);
  return {
    ...ctx,
    CsrfTokenHidden: function () {
      return (
        <input
          type="hidden"
          name="csrfToken"
          value={ctx.csrfToken}
        />
      );
    },
  };
};

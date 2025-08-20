import "@auth/core";
import "@auth/core/jwt";

type _AuthSession = import("@auth/core/types").Session;
type _AuthUser = import("@auth/core/types").User;

declare module "@auth/core/types" {

  interface Session extends _AuthSession {

  }

  interface User extends _AuthUser {
    role?: string;
  }

};

type _AuthJWT = import("@auth/core/jwt").JWT;

declare module "@auth/core/jwt" {

  interface JWT extends _AuthJWT {
    role?: string;
  }

}

type AuthPayloadProps = {
  csrfToken: string | undefined;
  session: import("@auth/core/types").Session | null;
};

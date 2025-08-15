import "@auth/core";
import "@auth/core/jwt";

type DefaultUser = import("@auth/core/adapters").User;

declare module "@auth/core/types" {

  interface Session extends DefaultSession {
  }

  interface User extends DefaultUser {
    role?: string;
  }

}

type DefaultJWT = import("@auth/core/jwt").DefaultJWT;

declare module "@auth/core/jwt" {

  interface JWT extends DefaultJWT {
    role?: string;
  }

}

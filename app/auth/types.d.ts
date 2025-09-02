import "@auth/core";
import "@auth/core/jwt";

type _AuthSession = import("@auth/core/types").Session;
type _AuthUser = import("@auth/core/types").User;

type SignInUserData = {
  id: string;
  name: string;
  role: string;
};

declare module "@auth/core/types" {

  interface Session extends _AuthSession {
    data: SignInUserData;
    csrfToken: string | undefined;
    csrfTokenWithHash: string | undefined;
  }

  interface User extends _AuthUser {
    data: SignInUserData;
  }

};

type _AuthJWT = import("@auth/core/jwt").JWT;

declare module "@auth/core/jwt" {

  interface JWT extends _AuthJWT {
    data: SignInUserData;
    csrfToken: string | undefined;
    csrfTokenWithHash: string | undefined;
  }

}

type AuthPayloadProps = {
  csrfToken: string | undefined;
  session: import("@auth/core/types").Session | null;
};

type AuthLoaderContext = {
  csrfToken: string | undefined;
  csrfTokenCookie: string | null | undefined;
  session: _AuthSession | null;
  sessionCookie: string | null | undefined;
};

type _ReactRouterAppLoadContext = import("react-router").AppLoadContext;

declare module "react-router" {
  interface AppLoadContext extends _ReactRouterAppLoadContext {
    auth: Promise<AuthLoaderContext> | undefined;
  }
}

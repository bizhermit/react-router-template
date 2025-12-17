import { useEffect } from "react";
import { data, redirect, useFetcher } from "react-router";
import { useAuthContext } from "~/auth/client/context";
import { authSchema } from "~/auth/schema";
import { signIn_credentials } from "~/auth/server/sign-in";
import { Button$ } from "~/components/react/elements/button";
import { FormItem } from "~/components/react/elements/form/common";
import { useFormItem } from "~/components/react/elements/form/hooks";
import { PasswordBox } from "~/components/react/elements/form/password-box";
import { TextBox } from "~/components/react/elements/form/text-box/text-box";
import { useSchema } from "~/components/react/hooks/schema";
import type { Route } from "./+types/sign-in";

export async function action({ request }: Route.ActionArgs) {
  const res = await signIn_credentials(request);
  if (!res.ok) {
    return data({
      message: "Sign in failed",
    });
  }

  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("to");
  const headers = new Headers();
  res.cookies.forEach(cookie => {
    if (cookie) headers.append("Set-Cookie", cookie);
  });

  return redirect(redirectTo ? decodeURIComponent(redirectTo) : "/home", {
    headers,
  });
};

export default function Page({ actionData }: Route.ComponentProps) {
  const fetcher = useFetcher<typeof actionData>();

  const {
    SchemaProvider,
    dataItems,
    getFormProps,
  } = useSchema({
    schema: authSchema,
    state: fetcher.state,
  });

  const userId = useFormItem();

  const auth = useAuthContext();

  useEffect(() => {
    if (fetcher.state === "idle") {
      userId.focus();
    }
  }, [fetcher.state]);

  const errorMessage = fetcher.data?.message || actionData?.message;

  return (
    <div className="flex flex-col justify-center items-center grow gap-8">
      <h1>Template</h1>
      <SchemaProvider>
        <fetcher.Form
          {...getFormProps("post")}
          className="grid place-items-center gap-4"
        >
          <auth.CsrfTokenHidden />
          <FormItem>
            <TextBox
              $={dataItems.userId}
              hideMessage
              hook={userId}
            />
          </FormItem>
          <FormItem>
            <PasswordBox
              $={dataItems.password}
              hideMessage
            />
          </FormItem>
          <Button$
            type="submit"
            color="primary"
            disabled={fetcher.state === "submitting"}
          >
            Sign In
          </Button$>
        </fetcher.Form>
        {
          errorMessage &&
          <p className="text-red-500">
            {errorMessage}
          </p>
        }
      </SchemaProvider>
    </div>
  );
};

import { useEffect } from "react";
import { redirect, useFetcher } from "react-router";
import { useAuthContext } from "~/components/auth/client/context";
import { signIn_credentials } from "~/components/auth/server/sign-in";
import { Button } from "~/components/react/elements/button";
import { FormItem } from "~/components/react/elements/form/common";
import { useFormItem } from "~/components/react/elements/form/hooks";
import { TextBox } from "~/components/react/elements/form/text-box";
import { useSchema } from "~/components/react/hooks/schema";
import { authSchema } from "~/features/auth/schema";
import type { Route } from "./+types/sign-in";

export async function action({ request }: Route.ActionArgs) {
  const res = await signIn_credentials(request);
  if (!res.ok) return null;
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("to");
  return redirect(redirectTo ? decodeURIComponent(redirectTo) : "/home", {
    headers: {
      "Set-Cookie": res.cookie || "",
    },
  });
};

export default function Page({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();

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
            <TextBox
              $={dataItems.password}
              hideMessage
            />
          </FormItem>
          <Button
            type="submit"
            color="primary"
            disabled={fetcher.state === "submitting"}
          >
            SignIn
          </Button>
        </fetcher.Form>
      </SchemaProvider>
    </div>
  );
};

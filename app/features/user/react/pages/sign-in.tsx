import { APIError } from "better-auth";
import { useEffect } from "react";
import { data, redirect, useFetcher } from "react-router";
import { authSchema } from "~/auth/schema";
import { auth } from "~/auth/server/auth";
import { getSignedInUrl } from "~/auth/signed-in-url";
import { Button$ } from "~/components/react/elements/button";
import { useFormItem } from "~/components/react/elements/form/hooks";
import { PasswordBox } from "~/components/react/elements/form/password-box/password-box";
import { TextBox } from "~/components/react/elements/form/text-box/text-box";
import { FormItem } from "~/components/react/elements/form/wrapper/form-item";
import { useSchema } from "~/components/react/hooks/schema";
import { getPayload } from "~/components/schema/server";
import type { Route } from "./+types/sign-in";

export async function action({ request }: Route.ActionArgs) {
  try {
    const submission = await getPayload({
      request,
      schema: authSchema,
    });
    if (submission.hasError) {
      return data({
        message: "Sign-in failed.",
      });
    }

    const { headers } = await auth.api.signInEmail({
      body: {
        email: submission.data.userId,
        password: submission.data.password,
      },
      returnHeaders: true,
    });

    return redirect(
      getSignedInUrl(request.url),
      { headers }
    );
  } catch (err) {
    if (err instanceof APIError) {
      return data({
        message: err.message,
      });
    }
    return data({
      message: "Sign-in fatal error.",
    });
  }
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

  useEffect(() => {
    if (fetcher.state === "idle") {
      userId.current?.focus();
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
          <FormItem>
            <TextBox
              $={dataItems.userId}
              hideMessage
              ref={userId}
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

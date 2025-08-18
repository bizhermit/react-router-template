import { useEffect } from "react";
import { data, useFetcher } from "react-router";
import { getSession } from "~/components/auth/server/session";
import { signIn } from "~/components/auth/server/sign-in";
import { Button } from "~/components/react/elements/button";
import { FormItem } from "~/components/react/elements/form/common";
import { useFormItem } from "~/components/react/elements/form/hooks";
import { TextBox } from "~/components/react/elements/form/text-box";
import { useSchema } from "~/components/react/hooks/schema";
import { authSchema } from "~/features/auth/schema";
import type { Route } from "./+types/sign-in";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request);
  return data({ session });
};

export async function action({ request }: Route.ActionArgs) {
  const res = await signIn(request);
  console.log(res);
  // return redirect("/home");
  return null;
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

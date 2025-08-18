import { useEffect } from "react";
import { redirect, useFetcher } from "react-router";
import { Button } from "~/components/react/elements/button";
import { FormItem } from "~/components/react/elements/form/common";
import { useFormItem } from "~/components/react/elements/form/hooks";
import { TextBox } from "~/components/react/elements/form/text-box";
import { useSchema } from "~/components/react/hooks/schema";
import { $schema } from "~/components/schema";
import { $str } from "~/components/schema/string";
import type { Route } from "./+types/sign-in";

const signInSchema = $schema({
  userId: $str({
    label: "userId",
    required: true,
  }),
  password: $str({
    label: "password",
    required: true,
  }),
});

export async function action({ request }: Route.ActionArgs) {
  return redirect("/home");
  // return null;
};

export default function Page() {
  const fetcher = useFetcher();

  const {
    SchemaProvider,
    dataItems,
    getFormProps,
  } = useSchema({
    schema: signInSchema,
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

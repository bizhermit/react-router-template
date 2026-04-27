import { Button$ } from "$/components/elements/button";
import { useFormItem } from "$/components/elements/form/hooks";
import { InputMessageSpan } from "$/components/elements/form/message";
import { PasswordBox } from "$/components/elements/form/password-box/password-box";
import { TextBox } from "$/components/elements/form/text-box/text-box";
import { FormItem } from "$/components/elements/form/wrapper/form-item";
import { useSchema } from "$/shared/hooks/$schema";
import { useText } from "$/shared/hooks/i18n";
import { SchemaProvider } from "$/shared/providers/schema";
import { useEffect } from "react";
import { data, redirect, useFetcher } from "react-router";
import { signInByEmail } from "~/auth/server/sign-in";
import { authSchema } from "~/auth/shared/schema";
import type { Route } from "./+types/sign-in";

export async function action({ request }: Route.ActionArgs) {
  const result = await signInByEmail(request);
  if (!result.ok) {
    return data({
      messageKey: result.messageKey,
    });
  }

  return redirect(
    result.redirectTo,
    { headers: result.headers }
  );
};

export default function Page({ actionData }: Route.ComponentProps) {
  const fetcher = useFetcher<typeof actionData>();
  const t = useText();

  const {
    formItems,
    getFormProps,
    providerProps,
  } = useSchema({
    id: "sign-in",
    schema: authSchema,
  });

  const userId = useFormItem();

  useEffect(() => {
    if (fetcher.state === "idle") {
      userId.current?.focus();
    }
  }, [fetcher.state]);

  const errorMessageKey = fetcher.data?.messageKey || actionData?.messageKey;

  return (
    <div className="flex flex-col justify-center items-center grow gap-8">
      <h1>{t("signIn_title")}</h1>
      <SchemaProvider {...providerProps}>
        <fetcher.Form
          {...getFormProps("post")}
          className="grid place-items-center gap-4"
        >
          <FormItem>
            <TextBox
              formItem={formItems.email}
              hideMessage
              ref={userId}
            />
          </FormItem>
          <FormItem>
            <PasswordBox
              formItem={formItems.password}
              hideMessage
            />
          </FormItem>
          <Button$
            type="submit"
            color="primary"
            disabled={fetcher.state === "submitting"}
          >
            {t("signIn_submit")}
          </Button$>
        </fetcher.Form>
        {
          errorMessageKey &&
          <InputMessageSpan
            code="signInError"
          >
            {t(errorMessageKey)}
          </InputMessageSpan>
        }
      </SchemaProvider>
    </div>
  );
};

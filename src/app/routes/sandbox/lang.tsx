import { Button } from "$/components/elements/button";
import { Text } from "$/components/elements/i18n-text";
import { useLocale, useText } from "$/shared/hooks/i18n";
import type { ReactNode } from "react";
import { data } from "react-router";
import type { Route } from "./+types/lang";

export async function loader() {
  return data({
    hoge: 1,
  });
}

export default function Page({ loaderData }: Route.ComponentProps) {
  console.log(loaderData);
  const t = useText();
  const locale = useLocale();

  return (
    <div className="flex flex-col gap-4 p-8">
      <div>{t("halloWorld")}</div>
      <div>{t("replaceText", { hoge: "人民", fuga: 1000 })}</div>
      <div>{t("htmlText")}</div>
      <div>
        <Text
          i18nKey="htmlText"
          replaceMap={{
            replace1: (props: { children?: ReactNode; }) => (
              <span className="text-red-500">
                完全に置き換えてもいいよ
                {props.children}
              </span>
            ),
          }}
        />
      </div>
      {/* <p>
          <span>dangerouslySetInnerHTML</span>
          <div dangerouslySetInnerHTML={{ __html: t("htmlText") }} />
        </p> */}
      <div className="flex">
        <Button
          appearance={locale.lang === "ja" ? "fill" : "outline"}
          className="rounded-tr-none rounded-br-none"
          onClick={() => {
            locale.switch("ja");
          }}
        >
          日本語
        </Button>
        <Button
          appearance={locale.lang === "en" ? "fill" : "outline"}
          className="rounded-tl-none rounded-bl-none"
          onClick={() => {
            locale.switch("en");
          }}
        >
          English
        </Button>
      </div>
    </div>
  );
};

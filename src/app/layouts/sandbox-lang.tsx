import { getI18nAddonResource } from "$/server/i18n/loader";
import { useAddonLangs } from "$/shared/hooks/i18n";
import { data, Outlet } from "react-router";
import type { Route } from "./+types/sandbox-lang";

export async function loader({ request }: Route.LoaderArgs) {
  const addonLangs = await getI18nAddonResource(request, ["sandbox"]);

  return data({
    langs: addonLangs,
  });
};

export default function Layout({ loaderData }: Route.ComponentProps) {
  useAddonLangs(loaderData.langs);
  return <Outlet />;
};

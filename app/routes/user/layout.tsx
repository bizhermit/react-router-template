import { Outlet } from "react-router";
import type { Route } from "./+types/layout";

export async function loader({ request }: Route.LoaderArgs) {
  console.log("user layout loader");

  // console.log("user:", user);
  // return { user };
  return null;
};

export default function Layout() {
  console.log("user layout render");
  return <Outlet />;
};

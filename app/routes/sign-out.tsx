import { redirect } from "react-router";

export async function loader() {
  // TODO: sign-out
  return redirect("/sign-in");
};

export default function Page() {
  return null;
};

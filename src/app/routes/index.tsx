import { SIGN_IN_PATHNAME } from "$/shared/auth/consts";
import { Link } from "~/elements/link";

export default function Page() {
  return (
    <main>
      <ul className="ml-10 list-disc">
        <li>
          <Link to="/sandbox">sandbox</Link>
        </li>
        <li>
          <Link to={SIGN_IN_PATHNAME}>sign-in</Link>
        </li>
        <li>
          <Link to="/home">home</Link>
        </li>
        <li>
          <Link to="/settings">settings</Link>
        </li>
      </ul>
    </main>
  );
}

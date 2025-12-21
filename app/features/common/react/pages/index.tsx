import { SIGN_IN_PATHNAME } from "~/auth/consts";
import { Link } from "~/components/react/elements/link";

export default function Page() {
  return (
    <div>
      <ul>
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
    </div>
  );
};

import { Link } from "~/components/react/elements/link";

export default function Page() {
  return (
    <div>
      <ul>
        <li>
          <Link to="/sandbox">sandbox</Link>
        </li>
        <li>
          <Link to="/sign-in">sign-in</Link>
        </li>
      </ul>
    </div>
  );
};

import { Link } from "~/components/react/elements/link";

export default function Page() {
  return (
    <div>
      <h1>User Home</h1>
      <ul>
        <li>
          <Link to="/settings">Settings</Link>
        </li>
      </ul>
    </div>
  );
};

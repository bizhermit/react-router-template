import { Link } from "~/components/react/elements/link";

export default function Page() {
  return (
    <div>
      <h1>User Settings</h1>
      <ul>
        <li>
          <Link to="/home">HOME</Link>
        </li>
      </ul>
    </div>
  );
};

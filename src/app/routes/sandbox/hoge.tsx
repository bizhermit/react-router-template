import { Button } from "$/components/elements/button/button";
import { Link } from "$/components/elements/link";

export default function Page() {
  return (
    <div>
      <Link to="/sandbox">
        sandbox
      </Link>
      <Button>
        button
      </Button>
      {/* <form> */}
      <button>button (unset type)</button>
      {/* </form> */}
    </div>
  );
}

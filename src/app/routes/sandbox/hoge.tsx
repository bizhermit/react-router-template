import { Button } from "~/elements/button/button";
import { Link } from "~/elements/link";

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

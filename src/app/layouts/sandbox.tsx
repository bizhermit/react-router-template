import { FormIcon, HomeIcon, OrderListIcon, SmileIcon } from "$/components/elements/icon";
import { Link } from "$/components/elements/link";
import { NavLayout, useNavLayout } from "$/components/elements/nav-layout";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <NavLayout
      header={
        <span className="text-lg font-bold px-4">
          Sandbox
        </span>
      }
      footer={
        <div className="w-full text-sm text-center p-1">
          &copy;&nbsp;2024&nbsp;bizhermit.com
        </div>
      }
      content={<Outlet />}
    >
      <NavMenu />
    </NavLayout>
  );
};

function NavMenu() {
  const nav = useNavLayout();

  return (
    <ul>
      {/* <li>
        <Button
          title="close menu"
          appearance="outline"
          onClick={() => {
            nav?.toggleMenu(false);
          }}
        >
          <CrossIcon />
        </Button>
      </li> */}
      <li>
        <Link
          className="flex flex-row p-2 gap-2"
          to="/"
          onClick={() => {
            nav?.toggleMenu(false);
          }}
        >
          <HomeIcon />
          <span>index</span>
        </Link>
      </li>
      <li>
        <Link
          to="/sandbox"
          className="flex flex-row p-2 gap-2"
        >
          <OrderListIcon />
          <span>Top</span>
        </Link>
      </li>
      <li>
        <Link
          to="/sandbox/form"
          className="flex flex-row p-2 gap-2"
        >
          <FormIcon />
          <span>Form</span>
        </Link>
      </li>
      <li>
        <Link
          to="/sandbox/icons"
          className="flex flex-row p-2 gap-2"
        >
          <SmileIcon />
          <span>Icons</span>
        </Link>
      </li>
      <li>
        <Link to="/sandbox/hoge">
          hgoe
        </Link>
      </li>
    </ul>
  );
};

import { createContext, use, useId, useRef, type HTMLAttributes, type ReactNode } from "react";
import { CrossIcon, MenuIcon, MenuLeftIcon, MenuRightIcon } from "./icon";
import { clsx } from "./utilities";

interface NavContextProps {
  id: string;
  toggleId: string;
  scalingId: string;
  toggleMenu: (open: boolean) => void;
  scalingNav: (narrow: boolean) => void;
};

const NavLayoutContext = createContext<NavContextProps | undefined>(undefined);

export function useNavLayout() {
  return use(NavLayoutContext);
};

interface NavLayoutProps {
  id?: string;
  className?: string;
  header?: ReactNode;
  headerProps?: Omit<HTMLAttributes<HTMLDivElement>, "children">;
  footer?: ReactNode;
  footerProps?: Omit<HTMLAttributes<HTMLElement>, "children">;
  content?: ReactNode;
  contentTag?: "main" | "div";
  contentProps?: Omit<HTMLAttributes<HTMLElement>, "children">;
  navigationProps?: Omit<HTMLAttributes<HTMLElement>, "children">;
  children?: ReactNode;
};

export function NavLayout(props: NavLayoutProps) {
  const Tag = props.contentTag || "main";
  const id = useId();
  const toggleId = `${props.id || id}_toggle`;
  const scalingId = `${props.id || id}_scaling`;

  const toggleRef = useRef<HTMLInputElement>(null!);
  const scalingRef = useRef<HTMLInputElement>(null!);

  function toggleMenu(open: boolean) {
    toggleRef.current.checked = open;
  };

  function scalingNav(narrow: boolean) {
    scalingRef.current.checked = narrow;
  };

  return (
    <NavLayoutContext
      value={{
        id,
        toggleId,
        scalingId,
        toggleMenu,
        scalingNav,
      }}
    >
      <div
        className={clsx(
          "nav-wrap",
          props.className
        )}
      >
        <input
          className="nav-toggle"
          type="checkbox"
          id={toggleId}
          ref={toggleRef}
        />
        <input
          className="nav-scaling"
          type="checkbox"
          id={scalingId}
          ref={scalingRef}
        />
        <label
          className="nav-mask"
          htmlFor={toggleId}
        />
        <nav className="nav-nav">
          <div className="nav-btns-scaling">
            <label
              className="nav-btn nav-btn-scaling"
              htmlFor={scalingId}
            >
              <MenuLeftIcon className="nav-narrow" />
              <MenuRightIcon className="nav-widen" />
            </label>
          </div>
          <div
            {...props.navigationProps}
            className={clsx(
              "nav-nav-main",
              props.navigationProps?.className
            )}
          >
            {props.children}
          </div>
        </nav>
        <header className="nav-header">
          <label
            className="nav-btn nav-btn-toggle"
            htmlFor={toggleId}
          >
            <MenuIcon className="nav-menu" />
            <CrossIcon className="nav-menu-cross" />
          </label>
          <div
            {...props.headerProps}
            className={clsx(
              "nav-header-main",
              props.headerProps?.className
            )}
          >
            {props.header}
          </div>
        </header>
        <Tag
          {...props.contentProps}
          className={clsx(
            "nav-content",
            props.contentProps?.className
          )}
        >
          {props.content}
        </Tag>
        {
          props.footer &&
          <footer
            {...props.footerProps}
            className={clsx(
              "nav-footer",
              props.footerProps?.className
            )}
          >
            {props.footer}
          </footer>
        }
      </div>
    </NavLayoutContext>
  );
};

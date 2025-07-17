import { useId, type HTMLAttributes, type ReactNode } from "react";
import { CrossIcon, MenuIcon, MenuLeftIcon, MenuRightIcon } from "./icon";
import { clsx } from "./utilities";

interface NavigationProps {
  className?: string;
  id?: string;
  header?: ReactNode;
  headerProps?: Omit<HTMLAttributes<HTMLElement>, "children">;
  footer?: ReactNode;
  footerProps?: Omit<HTMLAttributes<HTMLElement>, "children">;
  content: ReactNode;
  contentTag?: "main" | "div";
  children: ReactNode;
};

export function Navigation(props: NavigationProps) {
  const Tag = props.contentTag || "main";
  const id = useId();
  const toggleId = `${props.id || id}_toggle`;
  const scalingId = `${props.id || id}_scaling`;

  return (
    <div className={clsx("nav-wrap", props.className)}>
      <input
        className="nav-toggle"
        type="checkbox"
        id={toggleId}
      />
      <input
        className="nav-scaling"
        type="checkbox"
        id={scalingId}
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
        <div className="nav-nav-main">
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
        {props.header}
      </header>
      <Tag className="nav-content">
        {props.content}
      </Tag>
      {
        props.footer &&
        <footer className="nav-footer">
          {props.footer}
        </footer>
      }
    </div>
  );
};

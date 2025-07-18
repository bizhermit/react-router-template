import { createContext, use, useId, useRef, type FocusEvent, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { containElement } from "../dom/contain";
import { getNextFocusableElement, getPrevFocusableElement } from "../dom/focus";
import { FocusTrap } from "./focus-trap";
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
  const toggleId = `${props.id || "nav"}_toggle`;
  const scalingId = `${props.id || "nav"}_scaling`;

  const toggleRef = useRef<HTMLInputElement>(null!);
  const scalingRef = useRef<HTMLInputElement>(null!);
  const headerRef = useRef<HTMLElement>(null!);
  const navRef = useRef<HTMLElement>(null!);
  const bodyRef = useRef<HTMLDivElement>(null!);
  const footerRef = useRef<HTMLDivElement>(null!);

  function toggleMenu(open: boolean) {
    toggleRef.current.checked = open;
  };

  function scalingNav(narrow: boolean) {
    scalingRef.current.checked = narrow;
  };

  function handleKeydown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") toggleRef.current.checked = false;
  };

  function getCurrentMode() {
    const width = window.innerWidth;
    return width < 800 ? "s" : "m";
  };

  function handleNavStartFocus(e: FocusEvent<HTMLDivElement>) {
    const mode = getCurrentMode();
    if (mode !== "s") {
      if (containElement(navRef.current, e.relatedTarget)) {
        getPrevFocusableElement(e.target, [
          bodyRef.current,
          footerRef.current,
          headerRef.current,
        ])?.focus();
      } else {
        getNextFocusableElement(e.target, navRef.current)?.focus();
      }
      return;
    }
    if (toggleRef.current.checked) {
      if (containElement(navRef.current, e.relatedTarget)) {
        getPrevFocusableElement(e.target, headerRef.current)?.focus();
      } else {
        getNextFocusableElement(e.target, navRef.current)?.focus();
      }
    } else {
      getNextFocusableElement(null, bodyRef.current)?.focus();
    }
  };

  function handleNavEndFocus(e: FocusEvent<HTMLDivElement>) {
    const mode = getCurrentMode();
    if (mode !== "s") {
      if (containElement(navRef.current, e.relatedTarget)) {
        getNextFocusableElement(e.target, bodyRef.current)?.focus();
      } else {
        getPrevFocusableElement(e.target, navRef.current)?.focus();
      }
      return;
    }
    if (toggleRef.current.checked) {
      if (containElement(navRef.current, e.relatedTarget)) {
        getNextFocusableElement(e.target, headerRef.current)?.focus();
      } else {
        getPrevFocusableElement(e.target, navRef.current)?.focus();
      }
    } else {
      getNextFocusableElement(null, headerRef.current)?.focus();
    }
  };

  function handleEndFocus(e: FocusEvent<HTMLDivElement>) {
    const mode = getCurrentMode();
    if (mode !== "s") {
      if (e.relatedTarget == null) {
        getPrevFocusableElement(e.target, bodyRef.current)?.focus();
      } else {
        getNextFocusableElement(null, [headerRef.current, navRef.current])?.focus();
      }
      return;
    }
    if (toggleRef.current.checked) {
      getPrevFocusableElement(e.target, navRef.current)?.focus();
    } else {
      getNextFocusableElement(null, headerRef.current)?.focus();
    }
  };

  function handleKeydownLabelButton(e: KeyboardEvent<HTMLLabelElement>) {
    if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      const id = e.currentTarget.getAttribute("for");
      if (!id) return;
      const elem = document.getElementById(id);
      if (!elem) return;
      (elem as HTMLInputElement).checked = !(elem as HTMLInputElement).checked;
    }
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
      <FocusTrap
        onFocusHead={false}
        onFocusLast={handleEndFocus}
      >
        <div
          className={clsx(
            "nav-wrap",
            props.className
          )}
          onKeyDown={handleKeydown}
          tabIndex={-1}
        >
          <input
            className="nav-toggle"
            type="checkbox"
            id={toggleId}
            ref={toggleRef}
            tabIndex={-1}
            aria-hidden
          />
          <input
            className="nav-scaling"
            type="checkbox"
            id={scalingId}
            ref={scalingRef}
            tabIndex={-1}
            aria-hidden
          />
          <label
            className="nav-mask"
            htmlFor={toggleId}
            aria-hidden
          />
          <header
            className="nav-header"
            ref={headerRef}
          >
            <label
              className="nav-btn nav-btn-toggle"
              htmlFor={toggleId}
              tabIndex={0}
              onKeyDown={handleKeydownLabelButton}
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
          <nav
            className="nav-nav"
            ref={navRef}
          >
            <FocusTrap
              onFocusHead={handleNavStartFocus}
              onFocusLast={handleNavEndFocus}
            >
              <div className="nav-btns-scaling">
                <label
                  className="nav-btn nav-btn-scaling"
                  htmlFor={scalingId}
                  tabIndex={0}
                  onKeyDown={handleKeydownLabelButton}
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
            </FocusTrap>
          </nav>
          <Tag
            {...props.contentProps}
            ref={bodyRef}
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
              ref={footerRef}
              className={clsx(
                "nav-footer",
                props.footerProps?.className
              )}
            >
              {props.footer}
            </footer>
          }
        </div>
      </FocusTrap>
    </NavLayoutContext>
  );
};

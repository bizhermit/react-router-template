import { type HTMLAttributes } from "react";
import { clsx } from "./utilities";

interface IconOptions { };

type IconProps = Overwrite<Omit<HTMLAttributes<SVGSVGElement>, "children">, IconOptions>;

const attrs = (p: IconProps) => {
  return {
    viewBox: "0 0 20 20",
    xmlns: "http://www.w2.5.org/2000/svg",
    ...p,
    className: clsx("icon", p.className),
  };
};

export function PlusIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="M9.25,2.25a0.75 0.75 0 0 1 1.5,0v7h7a0.75 0.75 0 0 1 0,1.5h-7v7a0.75 0.75 0 0 1 -1.5,0v-7h-7a0.75 0.75 0 0 1 0,-1.5h7Z" />
    </svg>
  );
};

export function PlusCircleIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <circle cx="10" cy="10" r="9.125" strokeWidth="1.25" fill="none" />
      <path d="M9.25,4.25a0.75 0.75 0 0 1 1.5,0v5h5a0.75 0.75 0 0 1 0,1.5h-5v5a0.75 0.75 0 0 1 -1.5,0v-5h-5a0.75 0.75 0 0 1 0,-1.5h5Z" />
    </svg>
  );
};

export function PlusCircleFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)} data-fill="true">
      <path d="M0.25,10a9.75 9.75 0 0 0 19.5,0a9.75 9.75 0 0 0 -19.5,0Z M9.25,4.25a0.75 0.75 0 0 1 1.5,0v5h5a0.75 0.75 0 0 1 0,1.5h-5v5a0.75 0.75 0 0 1 -1.5,0v-5h-5a0.75 0.75 0 0 1 0,-1.5h5Z" />
    </svg>
  );
};

export function MinusIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="M2.25,9.25h15.5a0.75 0.75 0 0 1 0,1.5h-15.5a0.75 0.75 0 0 1 0,-1.5Z" />
    </svg>
  );
};

export function MinusCircleIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <circle cx="10" cy="10" r="9.125" strokeWidth="1.25" fill="none" />
      <path d="M4.25,9.25h11.5a0.75 0.75 0 0 1 0,1.5h-11.5a0.75 0.75 0 0 1 0,-1.5Z" />
    </svg>
  );
};

export function MinusCircleFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="M0.25,10a9.75 9.75 0 0 0 19.5,0a9.75 9.75 0 0 0 -19.5,0Z M4.25,9.25h11.5a0.75 0.75 0 0 1 0,1.5h-11.5a0.75 0.75 0 0 1 0,-1.5Z" />
    </svg>
  );
};

export function CrossIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M9.25,1.25a0.75 0.75 0 0 1 1.5,0v8h8a0.75 0.75 0 0 1 0,1.5h-8v8a0.75 0.75 0 0 1 -1.5,0v-8h-8a0.75 0.75 0 0 1 0,-1.5h8Z"
        transform="rotate(45,10,10)"
      />
    </svg>
  );
};

export function CrossCircleIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <circle cx="10" cy="10" r="9.125" strokeWidth="1.25" fill="none" />
      <path
        d="M9.25,4.25a0.75 0.75 0 0 1 1.5,0v5h5a0.75 0.75 0 0 1 0,1.5h-5v5a0.75 0.75 0 0 1 -1.5,0v-5h-5a0.75 0.75 0 0 1 0,-1.5h5Z"
        transform="rotate(45,10,10)"
      />
    </svg>
  );
};

export function CrossCircleFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M0.25,10a9.75 9.75 0 0 0 19.5,0a9.75 9.75 0 0 0 -19.5,0Z M9.25,4.25a0.75 0.75 0 0 1 1.5,0v5h5a0.75 0.75 0 0 1 0,1.5h-5v5a0.75 0.75 0 0 1 -1.5,0v-5h-5a0.75 0.75 0 0 1 0,-1.5h5Z"
        transform="rotate(45,10,10)"
      />
    </svg>
  );
};

export function MenuIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="M2,5h16 M2,10h16 M2,15h16" strokeWidth="1.5" fill="none" />
    </svg>
  );
};

export function MenuLeftIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="M2,5h16 M3,10h15 M2,15h16 M5.5,6.75l-3.25,3.25 3.25,3.25" strokeWidth="1.5" fill="none" />
    </svg>
  );
};

export function MenuRightIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="M2,5h16 M2,10h14 M2,15h16 M14.5,6.75l3.25,3.25 -3.25,3.25" strokeWidth="1.5" fill="none" />
    </svg>
  );
};

export function MenuLeftRightIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="M2,5h16 M3,10h13 M2,15h16 M5.5,6.75l-3.25,3.25 3.25,3.25 M14.5,6.75l3.25,3.25 -3.25,3.25" strokeWidth="1.5" fill="none" />
    </svg>
  );
};

export function KebabMenuIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <circle cx="10" cy="4" r="1.5" />
      <circle cx="10" cy="10" r="1.5" />
      <circle cx="10" cy="16" r="1.5" />
    </svg>
  );
};

export function MeatballsMenuIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <circle cx="4" cy="10" r="1.5" />
      <circle cx="10" cy="10" r="1.5" />
      <circle cx="16" cy="10" r="1.5" />
    </svg>
  );
};

export function ChocolateMenuIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M1.5,1.5h4v4h-4Z M8,1.5h4v4h-4Z M14.5,1.5h4v4h-4Z M1.5,8h4v4h-4Z M8,8h4v4h-4Z M14.5,8h4v4h-4Z M1.5,14.5h4v4h-4Z M8,14.5h4v4h-4Z M14.5,14.5h4v4h-4Z"
        strokeWidth="1.25"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export function ChocolateMenuFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M1.5,1.5h4v4h-4Z M8,1.5h4v4h-4Z M14.5,1.5h4v4h-4Z M1.5,8h4v4h-4Z M8,8h4v4h-4Z M14.5,8h4v4h-4Z M1.5,14.5h4v4h-4Z M8,14.5h4v4h-4Z M14.5,14.5h4v4h-4Z"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export function LeftIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M13.5,2l-8,8 8,8"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
};

export function LeftFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M6,2v12h12a0.5 0.5 0 0 0 0.5,-.75l-11.75,-11.75a0.5 0.5 0 0 0 -0.75,0.5Z"
        transform="rotate(45,10,10)"
      />
    </svg>
  );
};

export function DoubleLeftIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M10.5,2l-8,8 8,8 M16.25,2l-8,8 8,8"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
};

export function DoubleLeftFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M4,4a0.75 0.75 0 0 1 1.5,0v10.5h10.5a0.75 0.75 0 0 1 0,1.5h-12Z M8,0v12h12a0.5 0.5 0 0 0 0.5,-.75l-11.75,-11.75a0.5 0.5 0 0 0 -0.75,0.5Z"
        transform="rotate(45,10,10)"
      />
    </svg>
  );
};

export function RightIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M6.5,2l8,8 -8,8"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
};

export function RightFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M6,2v12h12a0.5 0.5 0 0 0 0.5,-.75l-11.75,-11.75a0.5 0.5 0 0 0 -0.75,0.5Z"
        transform="rotate(-135,10,10)"
      />
    </svg>
  );
};

export function DoubleRightIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M4,4a0.75 0.75 0 0 1 1.5,0v10.5h10.5a0.75 0.75 0 0 1 0,1.5h-12Z M8,0a0.75 0.75 0 0 1 1.5,0v10.5h10.5a0.75 0.75 0 0 1 0,1.5h-12Z"
        transform="rotate(-135,10,10)"
      />
    </svg>
  );
};

export function DoubleRightFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M4,4a0.75 0.75 0 0 1 1.5,0v10.5h10.5a0.75 0.75 0 0 1 0,1.5h-12Z M8,0v12h12a0.5 0.5 0 0 0 0.5,-.75l-11.75,-11.75a0.5 0.5 0 0 0 -0.75,0.5Z"
        transform="rotate(-135,10,10)"
      />
    </svg>
  );
};

export function UpIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M2,13.5l8,-8 8,8"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
};

export function UpFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M6,2v12h12a0.5 0.5 0 0 0 0.5,-.75l-11.75,-11.75a0.5 0.5 0 0 0 -0.75,0.5Z"
        transform="rotate(135,10,10)"
      />
    </svg>
  );
};

export function DoubleUpIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M4,4a0.75 0.75 0 0 1 1.5,0v10.5h10.5a0.75 0.75 0 0 1 0,1.5h-12Z M8,0a0.75 0.75 0 0 1 1.5,0v10.5h10.5a0.75 0.75 0 0 1 0,1.5h-12Z"
        transform="rotate(135,10,10)"
      />
    </svg>
  );
};

export function DoubleUpFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M4,4a0.75 0.75 0 0 1 1.5,0v10.5h10.5a0.75 0.75 0 0 1 0,1.5h-12Z M8,0v12h12a0.5 0.5 0 0 0 0.5,-.75l-11.75,-11.75a0.5 0.5 0 0 0 -0.75,0.5Z"
        transform="rotate(135,10,10)"
      />
    </svg>
  );
};

export function DownIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M2,6.5l8,8 8,-8"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
};

export function DownFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M6,2v12h12a0.5 0.5 0 0 0 0.5,-.75l-11.75,-11.75a0.5 0.5 0 0 0 -0.75,0.5Z"
        transform="rotate(-45,10,10)"
      />
    </svg>
  );
};

export function DoubleDownIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M4,4a0.75 0.75 0 0 1 1.5,0v10.5h10.5a0.75 0.75 0 0 1 0,1.5h-12Z M8,0a0.75 0.75 0 0 1 1.5,0v10.5h10.5a0.75 0.75 0 0 1 0,1.5h-12Z"
        transform="rotate(-45,10,10)"
      />
    </svg>
  );
};

export function DoubleDownFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M4,4a0.75 0.75 0 0 1 1.5,0v10.5h10.5a0.75 0.75 0 0 1 0,1.5h-12Z M8,0v12h12a0.5 0.5 0 0 0 0.5,-.75l-11.75,-11.75a0.5 0.5 0 0 0 -0.75,0.5Z"
        transform="rotate(-45,10,10)"
      />
    </svg>
  );
};

export function LeftRightIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M4,8a0.75 0.75 0 0 1 1.5,0v6.5h6.5a0.75 0.75 0 0 1 0,1.5h-8Z"
        transform="rotate(45,10,10)"
      />
      <path
        d="M4,8a0.75 0.75 0 0 1 1.5,0v6.5h6.5a0.75 0.75 0 0 1 0,1.5h-8Z"
        transform="rotate(-135,10,10)"
      />
    </svg>
  );
};

export function UpDownIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M4,8a0.75 0.75 0 0 1 1.5,0v6.5h6.5a0.75 0.75 0 0 1 0,1.5h-8Z"
        transform="rotate(135,10,10)"
      />
      <path
        d="M4,8a0.75 0.75 0 0 1 1.5,0v6.5h6.5a0.75 0.75 0 0 1 0,1.5h-8Z"
        transform="rotate(-45,10,10)"
      />
    </svg>
  );
};

export function ArrowLeftIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M7.5,5l-5,5 5,5 m-5,-5h15"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
};

export function ArrowRightIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M12.5,5l5,5 -5,5 m5,-5h-15"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
};

export function ArrowUpIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M5,7.5l5,-5 5,5 m-5,-5v15"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
};

export function ArrowDownIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M5,12.5l5,5 5,-5 m-5,5v-15"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
};

export function CalendarIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="
        M2,3.25h2.25v-1.25a0.75 0.75 0 0 1 1.5,0v1.25h8.5v-1.25a0.75 0.75 0 0 1 1.5,0v1.25h2.25a0.75 0.75 0 0 1 0.75,0.75v14a0.75 0.75 0 0 1 -0.75 0.75h-16a0.75 0.75 0 0 1 -0.75,-0.75v-14a0.75 0.75 0 0 1 0.75,-0.75Z
        M2.75,4.75v12.5h14.5v-12.5h-1.5v0.25a0.75 0.75 0 0 1 -1.5,0v-0.25h-8.5v0.25a0.75 0.75 0 0 1 -1.5,0v-0.25Z
        M2.75,6.25h14.5v1.5h-14.5Z
      "
      />
    </svg>
  );
};

export function CalendarFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="M2,4H18V18H2Z M5,2V5Z M15,2V5Z M2,7H18Z" fill="none" strokeWidth="0.15rem" strokeLinejoin="round" opacity={0.2} />
      <path
        d="
        M2,3.25h2.25v-1.25a0.75 0.75 0 0 1 1.5,0v1.25h8.5v-1.25a0.75 0.75 0 0 1 1.5,0v1.25h2.25a0.75 0.75 0 0 1 0.75,0.75v14a0.75 0.75 0 0 1 -0.75 0.75h-16a0.75 0.75 0 0 1 -0.75,-0.75v-14a0.75 0.75 0 0 1 0.75,-0.75Z
        M4.25,4.75v0.25a0.75 0.75 0 0 0 1.5,0v-0.25h8.5v0.25a0.75 0.75 0 0 0 1.5,0v-0.25
        M3.5,6.25v1.5h13a0.75 0.75 0 0 0 0,-1.5h-13a0.75 0.75 0 0 0 0,1.5v-1.5Z
      "
      />
    </svg>
  );
};

export function TodayIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="
        M2,3.25h2.25v-1.25a0.75 0.75 0 0 1 1.5,0v1.25h8.5v-1.25a0.75 0.75 0 0 1 1.5,0v1.25h2.25a0.75 0.75 0 0 1 0.75,0.75v14a0.75 0.75 0 0 1 -0.75 0.75h-16a0.75 0.75 0 0 1 -0.75,-0.75v-14a0.75 0.75 0 0 1 0.75,-0.75Z
        M2.75,4.75v12.5h14.5v-12.5h-1.5v0.25a0.75 0.75 0 0 1 -1.5,0v-0.25h-8.5v0.25a0.75 0.75 0 0 1 -1.5,0v-0.25Z
        M2.75,6.25h14.5v1.5h-14.5Z
        M10.25,11v2a0.75 0.75 0 0 0 0.75,0.75h2a0.75 0.75 0 0 0 0.75,-0.75v-2a0.75 0.75 0 0 0 -0.75,-0.75h-2a0.75 0.75 0 0 0 -0.75,0.75Z
      "
      />
    </svg>
  );
};

export function TodayFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="
        M2,3.25h2.25v-1.25a0.75 0.75 0 0 1 1.5,0v1.25h8.5v-1.25a0.75 0.75 0 0 1 1.5,0v1.25h2.25a0.75 0.75 0 0 1 0.75,0.75v14a0.75 0.75 0 0 1 -0.75 0.75h-16a0.75 0.75 0 0 1 -0.75,-0.75v-14a0.75 0.75 0 0 1 0.75,-0.75Z
        M4.25,4.75v0.25a0.75 0.75 0 0 0 1.5,0v-0.25h8.5v0.25a0.75 0.75 0 0 0 1.5,0v-0.25
        M3.5,6.25v1.5h13a0.75 0.75 0 0 0 0,-1.5h-13a0.75 0.75 0 0 0 0,1.5v-1.5Z
        M10.25,11v2a0.75 0.75 0 0 0 0.75,0.75h2a0.75 0.75 0 0 0 0.75,-0.75v-2a0.75 0.75 0 0 0 -0.75,-0.75h-2a0.75 0.75 0 0 0 -0.75,0.75Z
      "
      />
    </svg>
  );
};

export function ClockIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <circle cx="10" cy="10" r="9.125" strokeWidth="1.25" fill="none" />
      <path d="M10.75,3v6.25h4.25a0.75 0.75 0 0 1 0,1.5h-5a0.75 0.75 0 0 1 -0.75,-0.75v-7a0.75 0.75 0 0 1 1.5,0Z" />
    </svg>
  );
};

export function ClockFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="M0.25,10a9.75 9.75 0 0 0 19.5,0a9.75 9.75 0 0 0 -19.5,0m1.25,0Z M10.75,3v6.25h4.25a0.75 0.75 0 0 1 0,1.5h-5a0.75 0.75 0 0 1 -0.75,-0.75v-7a0.75 0.75 0 0 1 1.5,0Z" />
    </svg>
  );
};

export function ListIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M2,4h16 M2,8h16 M2,12h16 M2,16h16"
        strokeWidth="1.5"

      />
    </svg>
  );
};

export function OrderListIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="M1.25,4a1.25 1.25 0 0 1 2.5,0a1.25 1.25 0 0 1 -2.5,0Z M1.25,8a1.25 1.25 0 0 1 2.5,0a1.25 1.25 0 0 1 -2.5,0Z M1.25,12a1.25 1.25 0 0 1 2.5,0a1.25 1.25 0 0 1 -2.5,0Z M1.25,16a1.25 1.25 0 0 1 2.5,0a1.25 1.25 0 0 1 -2.5,0Z" />
      <path
        d="M6,4h12 M6,8h12 M6,12h12 M6,16h12"
        strokeWidth="1.5"

      />
    </svg>
  );
};

export function ListFilterIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M2,5h16 M5,10h10 M8,15h4"
        fill="none"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export function ClearAllIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M2,4h16 M2,8h16 M2,12h9 M2,16h9 M14,12l4,4 M14,16l4,-4"
        strokeWidth="1.5"

      />
    </svg>
  );
};

export function GridIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M1.5,1.5h7v7h-7Z M1.5,11.5h7v7h-7Z M11.5,1.5h7v7h-7Z M11.5,11.5h7v7h-7Z"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export function GridFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M1.5,1.5h7v7h-7Z M1.5,11.5h7v7h-7Z M11.5,1.5h7v7h-7Z M11.5,11.5h7v7h-7Z"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export function SaveIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="
        M2,1.25h13l3.75,3.75v13a0.75 0.75 0 0 1 -0.75,0.75h-16a0.75 0.75 0 0 1 -0.75,-0.75v-16a0.75 0.75 0 0 1 0.75,-0.75Z
        m0.75,1.5v14.5h1.5v-6.25a0.75 0.75 0 0 1 0.75,-0.75h10a0.75 0.75 0 0 1 0.75,0.75v6.25
        h-1.5v-5.5h-8.5v5.5h11.5
        v-12l-2.5,-2.5h-1v3.25a0.75 0.75 0 0 1 -0.75,0.75h-8a0.75 0.75 0 0 1 -0.75,-0.75v-3.25
        h1.5v2.5h6.5v-2.5Z
      "
      />
    </svg>
  );
};

export function SaveFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="
        M2,1.25h13l3.75,3.75v13a0.75 0.75 0 0 1 -0.75,0.75h-16a0.75 0.75 0 0 1 -0.75,-0.75v-16a0.75 0.75 0 0 1 0.75,-0.75Z
        M5.75,2.75v2.5h6.5v-2.5Z
        M5.75,11.75v5.5h8.5v-5.5Z
      "
      />
    </svg>
  );
};

export function UndoIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M4,3v5h5 m-5,0l3,-3a4 4 0 0 1 7,7l-6.5,6.5"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
};

export function RedoIcon(p: IconProps) {
  return (
    <svg {...attrs(p)} style={{ overflow: "visible" }}>
      <path
        d="M16,3v5h-5 m5,0l-3,-3a4 4 0 0 0 -7,7l6.5,6.5"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
};

export function CloudIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M6,16h-0.5a4.5 4 0 0 1 1,-8a3 3.5 0 0 1 8,1a3.5 3 0 0 1 0,7h-0.5Z"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
};

export function CloudFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="M6,16h-0.5a4.5 4 0 0 1 1,-8a3 3.5 0 0 1 8,1a3.5 3 0 0 1 0,7h-0.5Z" />
    </svg>
  );
};

export function CloudDownloadIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M6,16h-0.5a4.5 4 0 0 1 1,-8a3 3.5 0 0 1 8,1a3.5 3 0 0 1 0,7h-0.5 M10,8v7 M7,13l3,3 3,-3"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
};

export function CloudUploadIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M6,16h-0.5a4.5 4 0 0 1 1,-8a3 3.5 0 0 1 8,1a3.5 3 0 0 1 0,7h-0.5 M10,10v7 M7,12.5l3,-3 3,3"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
};

export function DownloadIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="
      M1,12v5a0.75 0.75 0 0 0 0.75,0.75h17a0.75 0.75 0 0 0 0.75,-0.75v-5a0.75 0.75 0 0 0 -1.5,0v4h-15.5v-4a0.75 0.75 0 0 0 -1.5,0Z
      M10,14l5,-5a0.75 0.75 0 0 0 -1.07,-1.07l-3.16,3.16v-9a0.75 0.75 0 0 0 -1.5,0v9l-3.16,-3.16a0.75 0.75 0 0 0 -1.07,1.07Z
      "
      />
    </svg>
  );
};

export function UploadIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="
      M2,12v5a0.75 0.75 0 0 0 0.75,0.75h14.5a0.75 0.75 0 0 0 0.75,-0.75v-5a0.75 0.75 0 0 0 -1.5,0v4h-13v-4a0.75 0.75 0 0 0 -1.5,0Z
      M10,1.5l-5,5a0.75 0.75 0 0 0 1.07,1.07l3.16,-3.16v9a0.75 0.75 0 0 0 1.5,0v-9l3.16,3.16a0.75 0.75 0 0 0 1.07,-1.07Z
      "
      />
    </svg>
  );
};

export function CircleIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <circle cx="10" cy="10" r="8" strokeWidth="1.5" fill="none" />
    </svg>
  );
};

export function CircleFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <circle cx="10" cy="10" r="8" strokeWidth="1.5" />
    </svg>
  );
};

export function ReloadIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M17.5,2v5h-5m5,0l-1,-1a7.5 7.5 0 1 0 0,8"
        strokeWidth="1.5"

        fill="none"
      />
    </svg>
  );
};

export function UnloadIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M2.5,2v5h5m-5,0l1,-1 a7.5 7.5 0 1 1 0,8"
        strokeWidth="1.5"

        fill="none"
      />
    </svg>
  );
};

export function SyncIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M17,1.5v5h-5m5,0l-1,-1a7.5 7.5 0 0 0 -13.5,3.5 M3,18.5v-5h5m-5,0l1,1a7.5 7.5 0 0 0 13.5,-3.5"
        strokeWidth="1.5"

        fill="none"
      />
    </svg>
  );
};

export function HomeIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M10,2 L19,10 16,10 16,18 12,18 12,13 8,13 8,18 4,18 4,10 1,10 10,2"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export function HomeFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M10,2 L19,10 16,10 16,18 12,18 12,13 8,13 8,18 4,18 4,10 1,10 10,2"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export function ElementIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M6,5.5l-4.5,4.5 4.5,4.5 M14,5.5l4.5,4.5 -4.5,4.5 M12,5l-4,10"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
};

export function SmileIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <circle cx="10" cy="10" r="9.125" strokeWidth="1.25" fill="none" />
      <path d="M5,8a1.5 1.5 0 0 1 3,0a1.5 1.5 0 0 1 -3,0Z M12,8a1.5 1.5 0 0 1 3,0a1.5 1.5 0 0 1 -3,0Z M6.75,12.5a4.25 4.25 0 0 0 6.75,0a0.75 0.75 0 0 1 1.07,1.1a5.75 5.75 0 0 1 -8.95,0a0.75 0.75 0 0 1 1.07,-1.17Z" />
    </svg>
  );
};

export function SmileFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="M0.25,10a9.75 9.75 0 0 0 19.5,0a9.75 9.75 0 0 0 -19.5,0Z M5,8a1.5 1.5 0 0 1 3,0a1.5 1.5 0 0 1 -3,0Z M12,8a1.5 1.5 0 0 1 3,0a1.5 1.5 0 0 1 -3,0Z M6.75,12.5a4.25 4.25 0 0 0 6.75,0a0.75 0.75 0 0 1 1.07,1.1a5.75 5.75 0 0 1 -8.95,0a0.75 0.75 0 0 1 1.07,-1.17Z" />
    </svg>
  );
};

export function ButtonIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="M9,13h-7v-8h16v8h-1" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path
        d="M8,12l-4,9 3.25,-1v3a0.75 0.25 0 0 0 1.5,0v-3l3,1Z"
        transform="rotate(-18)"
      />
    </svg>
  );
};

export function LinkIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M6,7.5v-2a4 4 0 0 1 8,0v2m0,5v2a4 4 0 0 1 -8,0v-2 M10,7v6"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
};

export function ExLinkIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="M8,3h-5v14h14v-5" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M12,2h6v6m0,-6l-10,10" strokeWidth="1.5" fill="none" />
    </svg>
  );
};

export function ContainerIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M2,3h16v14h-16Z M5,5h10v2h-10Z M5,9h7v2h-7Z M5,13h10v2h-10Z"
        fill="none"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export function NavContainerIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M2,3h16v14h-16Z M2,7h16 M8,7v10"
        fill="none"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export function PopupIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M1,2h18v16h-18Z"
        opacity=".6"
        fill="none"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="M3.5,4.5h13v11h-13Z"
        fill="none"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export function FormIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M10,3h-7v14h14v-7"
        strokeWidth="1.25"
        fill="none"
        strokeLinejoin="round"
      />
      <path
        d="M10,-1h-1.5a0.75 0.75 0 0 0 -0.75,0.75v12l2.25,2.25 2.25,-2.25v-12a0.75 0.75 0 0 0 -0.75,-0.75Z m0,1.5h1v11l-1,1 -1,-1v-11"
        transform="rotate(45,10,10)"
      />
    </svg>
  );
};

export function FormItemIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M6,8h-4v8h16v-6"
        strokeWidth="1.25"
        fill="none"
        strokeLinejoin="round"
      />
      <path
        d="M10,-1h-1.5a0.75 0.75 0 0 0 -0.75,0.75v12l2.25,2.25 2.25,-2.25v-12a0.75 0.75 0 0 0 -0.75,-0.75Z m0,1.5h1v11l-1,1 -1,-1v-11"
        transform="rotate(45,10,10)"
      />
    </svg>
  );
};

export function MagnifyingGlassIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="M0.25,8a7.75,7.75 0 0 0 15.5,0a7.75 7.75 0 0 0 -15.5,0Zm1.5,0a6 6 0 0 1 12.5,0a6 6 0 0 1 -12.5,0Z M12.5,13.57l5,5a0.75 0.75 0 0 0 1.07,-1.07l-5,-5Z" />
    </svg>
  );
};

export function MagnifyingGlassPlusIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="
      M0.25,8a7.75,7.75 0 0 0 15.5,0a7.75 7.75 0 0 0 -15.5,0Zm1.5,0a6 6 0 0 1 12.5,0a6 6 0 0 1 -12.5,0Z
      M7.25,4a0.75 0.75 0 0 1 1.5,0v3.25h3.25a0.75 0.75 0 0 1 0,1.5h-3.25v3.25a0.75 0.75 0 0 1 -1.5,0v-3.25h-3.25a0.75 0.75 0 0 1 0,-1.5h3.25Z
      M12.5,13.57l5,5a0.75 0.75 0 0 0 1.07,-1.07l-5,-5Z"
      />
    </svg>
  );
};

export function MagnifyingGlassPlusFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="
      M0.25,8a7.75,7.75 0 0 0 15.5,0a7.75 7.75 0 0 0 -15.5,0Z
      M7.25,4a0.75 0.75 0 0 1 1.5,0v3.25h3.25a0.75 0.75 0 0 1 0,1.5h-3.25v3.25a0.75 0.75 0 0 1 -1.5,0v-3.25h-3.25a0.75 0.75 0 0 1 0,-1.5h3.25Z
      M12.5,13.57l5,5a0.75 0.75 0 0 0 1.07,-1.07l-5,-5Z"
      />
    </svg>
  );
};

export function MagnifyingGlassMinusIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="
      M0.25,8a7.75,7.75 0 0 0 15.5,0a7.75 7.75 0 0 0 -15.5,0Zm1.5,0a6 6 0 0 1 12.5,0a6 6 0 0 1 -12.5,0Z
      M4,7.25h8a0.75 0.75 0 0 1 0,1.5h-8a0.75 0.75 0 0 1 0,-1.5Z
      M12.5,13.57l5,5a0.75 0.75 0 0 0 1.07,-1.07l-5,-5Z"
      />
    </svg>
  );
};

export function MagnifyingGlassMinusFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="
      M0.25,8a7.75,7.75 0 0 0 15.5,0a7.75 7.75 0 0 0 -15.5,0Z
      M4,7.25h8a0.75 0.75 0 0 1 0,1.5h-8a0.75 0.75 0 0 1 0,-1.5Z
      M12.5,13.57l5,5a0.75 0.75 0 0 0 1.07,-1.07l-5,-5Z"
      />
    </svg>
  );
};

export function TextBoxIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M7,7h-5v6h5 M13,7h5v6h-5 M10,5v10 M10,5l-1,-1h-3 M10,5l1,-1h3  M10,15l-1,1h-3 M10,15l1,1h3"
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export function TabContainerIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M2,3h16v14h-16Z M2,7h16 M10,3v4"
        fill="none"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export function SlideContainerIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M4,4h12v12h-12Z M1,4v12 M19,4v12"
        fill="none"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export function SplitContainerIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M2,3h16v14h-16Z M10,3v14"
        fill="none"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export function LoadingIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <line x1="10" x2="10" y1="1" y2="5" strokeWidth="1.5" />
      <line x1="3.3" x2="6.4" y1="3.3" y2="6.4" opacity="0.9" strokeWidth="1.5" />
      <line x1="1" x2="5" y1="10" y2="10" opacity="0.8" strokeWidth="1.5" />
      <line x1="3.3" x2="6.4" y1="16.7" y2="13.6" opacity="0.7" strokeWidth="1.5" />
      <line x1="10" x2="10" y1="19" y2="15" opacity="0.6" strokeWidth="1.5" />
      <line x1="16.7" x2="13.6" y1="16.7" y2="13.6" opacity="0.5" strokeWidth="1.5" />
      <line x1="19" x2="15" y1="10" y2="10" opacity="0.4" strokeWidth="1.5" />
      <line x1="16.7" x2="13.6" y1="3.3" y2="6.4" opacity="0.3" strokeWidth="1.5" />
    </svg>
  );
};

export function LabelIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="M1.75,4.25a0.5 0.5 0 0 0 -0.5,0.5v10.5a0.5 0.5 0 0 0 0.5,0.5h12.75l4.5,-5.75 -4.5,-5.75Z m1,1.5h11l3.4,4.25 -3.4,4.25h-11Z" />
    </svg>
  );
};

export function LabelFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="M1.75,4.25a0.5 0.5 0 0 0 -0.5,0.5v10.5a0.5 0.5 0 0 0 0.5,0.5h12.75l4.5,-5.75 -4.5,-5.75Z" />
    </svg>
  );
};

export function StepperIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="
        M0.5,6.5h7.5l2.5,3.5 -2.5,3.5h-7.5l2.25,-3.5Z
        M9.5,6.5h7.5l2.5,3.5 -2.5,3.5h-7.5l2.25,-3.5Z m2.5,1.25l1.75,2.25 -1.75,2.25h4l1.75,-2.25 -1.75,-2.25Z
      "
      />
    </svg>
  );
};

export function VerticalDividerIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <line x1="10" x2="10" y1="3" y2="17" strokeWidth="1.5" />
    </svg>
  );
};

export function HorizontalDividerIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <line x1="3" x2="17" y1="10" y2="10" strokeWidth="1.5" />
    </svg>
  );
};

export function TooltipIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="M2,3h16v14h-16Z" opacity=".6" fill="none" strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M4,7h12v5h-4l-2,2 -2,-2h-4Z" fill="none" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
};

export function BadgeIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="M10,2h-8v16h16v-8" opacity=".6" fill="none" strokeWidth="1.25" strokeLinejoin="round" />
      <circle cx="14" cy="6" r="5" fill="none" strokeWidth="1.5" />
    </svg>
  );
};

export function CardIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M2,4h16v12h-16Z M2,8h16"
        fill="none"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export function SignInIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M6,6.5v-4.5h11v16h-11v-4.5"
        fill="none"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M10,6l4,4 -4,4m4,-4h-12"
        fill="none"
        strokeWidth="1.5"
      />
    </svg>
  );
};

export function SignOutIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M11,6.5v-4.5h-9v16h9v-4.5"
        fill="none"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M15,6l4,4 -4,4m4,-4h-11"
        fill="none"
        strokeWidth="1.5"
      />
    </svg>
  );
};

export function FolderIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="M0.75,3.25v14.25a0.75 0.75 0 0 0 0.75,0.75h17a0.75 0.75 0 0 0 0.75,-0.75v-12a0.75 0.75 0 0 0 -0.75,-0.75h-9l-2,-2h-6a0.75 0.75 0 0 0 -0.75,0.75Z m1.5,1h4.5l2,2h9v10.5h-15.5Z" />
    </svg>
  );
};

export function FolderFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="M0.75,3.25v14.25a0.75 0.75 0 0 0 0.75,0.75h17a0.75 0.75 0 0 0 0.75,-0.75v-12a0.75 0.75 0 0 0 -0.75,-0.75h-9l-2,-2h-6a0.75 0.75 0 0 0 -0.75,0.75Z" />
    </svg>
  );
};

export function FolderAddIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="
      M0.75,3.25v14.25a0.75 0.75 0 0 0 0.75,0.75h17a0.75 0.75 0 0 0 0.75,-0.75v-12a0.75 0.75 0 0 0 -0.75,-0.75h-9l-2,-2h-6a0.75 0.75 0 0 0 -0.75,0.75Z m1.5,1h4.5l2,2h9v10.5h-15.5Z
      M9.25,8.5a0.75 0.75 0 0 1 1.5,0v2.25h2.25a0.75 0.75 0 0 1 0,1.5h-2.25v2.25a0.75 0.75 0 0 1 -1.5,0v-2.25h-2.25a0.75 0.75 0 0 1 0,-1.5h2.25Z
    "
      />
    </svg>
  );
};

export function FolderAddFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="
      M0.75,3.25v14.25a0.75 0.75 0 0 0 0.75,0.75h17a0.75 0.75 0 0 0 0.75,-0.75v-12a0.75 0.75 0 0 0 -0.75,-0.75h-9l-2,-2h-6a0.75 0.75 0 0 0 -0.75,0.75Z
      M9.25,8.5a0.75 0.75 0 0 1 1.5,0v2.25h2.25a0.75 0.75 0 0 1 0,1.5h-2.25v2.25a0.75 0.75 0 0 1 -1.5,0v-2.25h-2.25a0.75 0.75 0 0 1 0,-1.5h2.25Z
    "
      />
    </svg>
  );
};

export function FolderDeleteIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="
      M0.75,3.25v14.25a0.75 0.75 0 0 0 0.75,0.75h17a0.75 0.75 0 0 0 0.75,-0.75v-12a0.75 0.75 0 0 0 -0.75,-0.75h-9l-2,-2h-6a0.75 0.75 0 0 0 -0.75,0.75Z m1.5,1h4.5l2,2h9v10.5h-15.5Z
      M8,8.25l2,2 2,-2a0.75 0.75 0 0 1 1.07,1.07l-2,2 2,2a0.75 0.75 0 0 1 -1.07,1.07l-2,-2 -2,2a0.75 0.75 0 0 1 -1.07,-1.07l2,-2 -2,-2a0.75 0.75 0 0 1 1.07,-1.07Z
    "
      />
    </svg>
  );
};

export function FolderDeleteFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="
      M0.75,3.25v14.25a0.75 0.75 0 0 0 0.75,0.75h17a0.75 0.75 0 0 0 0.75,-0.75v-12a0.75 0.75 0 0 0 -0.75,-0.75h-9l-2,-2h-6a0.75 0.75 0 0 0 -0.75,0.75Z
      M8,8.25l2,2 2,-2a0.75 0.75 0 0 1 1.07,1.07l-2,2 2,2a0.75 0.75 0 0 1 -1.07,1.07l-2,-2 -2,2a0.75 0.75 0 0 1 -1.07,-1.07l2,-2 -2,-2a0.75 0.75 0 0 1 1.07,-1.07Z
    "
      />
    </svg>
  );
};

export function FileIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="M2.25,1.25v17.25a0.75 0.75 0 0 0 0.75,0.75h14a0.75 0.75 0 0 0 0.75,-0.75v-12l-5.75,-5.75h-9a0.75 0.75 0 0 0 -0.75,0.75Z m1.5,1h6.5v5a0.75 0.75 0 0 0 0.75,0.75h5.25v9.75h-12.5Z M15.5,6.5h-3.75v-3.75Z" />
    </svg>
  );
};

export function FileFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="M2.25,1.25v17.25a0.75 0.75 0 0 0 0.75,0.75h14a0.75 0.75 0 0 0 0.75,-0.75v-12l-5.75,-5.75h-9a0.75 0.75 0 0 0 -0.75,0.75Z M15.5,6.5h-3.75v-3.75Z" />
    </svg>
  );
};

export function FileAddIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="
      M2.25,1.25v17.25a0.75 0.75 0 0 0 0.75,0.75h14a0.75 0.75 0 0 0 0.75,-0.75v-12l-5.75,-5.75h-9a0.75 0.75 0 0 0 -0.75,0.75Z m1.5,1h6.5v5a0.75 0.75 0 0 0 0.75,0.75h5.25v9.75h-12.5Z M15.5,6.5h-3.75v-3.75Z
      M9.25,9.5a0.75 0.75 0 0 1 1.5,0v2.25h2.25a0.75 0.75 0 0 1 0,1.5h-2.25v2.25a0.75 0.75 0 0 1 -1.5,0v-2.25h-2.25a0.75 0.75 0 0 1 0,-1.5h2.25Z
      "
      />
    </svg>
  );
};

export function FileAddFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="
      M2.25,1.25v17.25a0.75 0.75 0 0 0 0.75,0.75h14a0.75 0.75 0 0 0 0.75,-0.75v-12l-5.75,-5.75h-9a0.75 0.75 0 0 0 -0.75,0.75Z M15.5,6.5h-3.75v-3.75Z
      M9.25,9.5a0.75 0.75 0 0 1 1.5,0v2.25h2.25a0.75 0.75 0 0 1 0,1.5h-2.25v2.25a0.75 0.75 0 0 1 -1.5,0v-2.25h-2.25a0.75 0.75 0 0 1 0,-1.5h2.25Z
      "
      />
    </svg>
  );
};

export function FileDeleteIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="
      M2.25,1.25v17.25a0.75 0.75 0 0 0 0.75,0.75h14a0.75 0.75 0 0 0 0.75,-0.75v-12l-5.75,-5.75h-9a0.75 0.75 0 0 0 -0.75,0.75Z m1.5,1h6.5v5a0.75 0.75 0 0 0 0.75,0.75h5.25v9.75h-12.5Z M15.5,6.5h-3.75v-3.75Z
      M8,8.25l2,2 2,-2a0.75 0.75 0 0 1 1.07,1.07l-2,2 2,2a0.75 0.75 0 0 1 -1.07,1.07l-2,-2 -2,2a0.75 0.75 0 0 1 -1.07,-1.07l2,-2 -2,-2a0.75 0.75 0 0 1 1.07,-1.07Z
      "
      />
    </svg>
  );
};

export function FileDeleteFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="
      M2.25,1.25v17.25a0.75 0.75 0 0 0 0.75,0.75h14a0.75 0.75 0 0 0 0.75,-0.75v-12l-5.75,-5.75h-9a0.75 0.75 0 0 0 -0.75,0.75Z M15.5,6.5h-3.75v-3.75Z
      M8,8.25l2,2 2,-2a0.75 0.75 0 0 1 1.07,1.07l-2,2 2,2a0.75 0.75 0 0 1 -1.07,1.07l-2,-2 -2,2a0.75 0.75 0 0 1 -1.07,-1.07l2,-2 -2,-2a0.75 0.75 0 0 1 1.07,-1.07Z
      "
      />
    </svg>
  );
};

export function ExclamationIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="
        M10,2.25h0.75a0.5 0.5 0 0 1 0.5,0.5l-0.25,10a0.5 0.5 0 0 1 -0.5,0.5h-1a0.5 0.5 0 0 1 -0.5,-0.5l-0.25,-10a0.5 0.5 0 0 1 0.5,-0.5Z
        M10,15.5a1.5 1.5 0 0 1 0,3a1.5 1.5 0 0 1 0,-3
      "
      />
    </svg>
  );
};

export function ExclamationCircleIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <circle cx="10" cy="10" r="9.125" strokeWidth="1.25" fill="none" />
      <path
        d="
        M10,4.75h0.75a0.5 0.5 0 0 1 0.5,0.5l-0.25,6.5a0.5 0.5 0 0 1 -0.5,0.5h-1a0.5 0.5 0 0 1 -0.5,-0.5l-0.25,-6.5a0.5 0.5 0 0 1 0.5,-0.5Z
        M10,13.5a1.25 1.25 0 0 1 0,2.5a1.25 1.25 0 0 1 0,-2.5Z
      "
      />
    </svg>
  );
};

export function ExclamationCircleFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="
        M0.25,10a9.75 9.75 0 0 0 19.5,0a9.75 9.75 0 0 0 -19.5,0Z
        M10,4.75h0.75a0.5 0.5 0 0 1 0.5,0.5l-0.25,6.5a0.5 0.5 0 0 1 -0.5,0.5h-1a0.5 0.5 0 0 1 -0.5,-0.5l-0.25,-6.5a0.5 0.5 0 0 1 0.5,-0.5Z
        M10,13.5a1.25 1.25 0 0 1 0,2.5a1.25 1.25 0 0 1 0,-2.5Z
      "
      />
    </svg>
  );
};

export function ExclamationTriangleIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="
        M10.5,1q-0.5,-0.5 -1,0l-9,15.93q-0.16,0.67 0.5,0.87h18q0.67,-0.16 0.5,-0.87Z
        m-0.5,2l7.5,13.5h-15Z
        M10,6.5h0.75a0.5 0.5 0 0 1 0.5,0.5l-0.25,5.5a0.5 0.5 0 0 1 -0.5,0.5h-1a0.5 0.5 0 0 1 -0.5,-0.5l-0.25,-5.5a0.5 0.5 0 0 1 0.5,-0.5Z
        M10,13.75a1.1 1.1 0 0 1 0,2.2a1.1 1.1 0 0 1 0,-2.2Z
      "
      />
    </svg>
  );
};

export function ExclamationTriangleFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="
        M10.5,1q-0.5,-0.5 -1,0l-9,15.93q-0.16,0.67 0.5,0.87h18q0.67,-0.16 0.5,-0.87Z
        M10,5.5h0.75a0.5 0.5 0 0 1 0.5,0.5l-0.25,6.5a0.5 0.5 0 0 1 -0.5,0.5h-1a0.5 0.5 0 0 1 -0.5,-0.5l-0.25,-6.5a0.5 0.5 0 0 1 0.5,-0.5Z
        M10,14a1.25 1.25 0 0 1 0,2.5a1.25 1.25 0 0 1 0,-2.5Z
      "
      />
    </svg>
  );
};

export function ExclamationDiamondIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="
        M10.5,0.5q-0.5,-0.5 -1,0l-9,9q-0.5,0.5 0,1l9,9q0.5,0.5 1,0l9,-9q0.5,-0.5 0,-1Z
        m-0.5,1.5l8,8 -8,8 -8,-8 8,-8Z
        M10,4.75h0.75a0.5 0.5 0 0 1 0.5,0.5l-0.25,6.5a0.5 0.5 0 0 1 -0.5,0.5h-1a0.5 0.5 0 0 1 -0.5,-0.5l-0.25,-6.5a0.5 0.5 0 0 1 0.5,-0.5Z
        M10,13.5a1.25 1.25 0 0 1 0,2.5a1.25 1.25 0 0 1 0,-2.5Z
      "
      />
    </svg>
  );
};

export function ExclamationDiamondFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="
        M10.5,1q-0.5,-0.5 -1,0l-8.5,8.5q-0.5,0.5 0,1l8.5,8.5q0.5,0.5 1,0l8.5,-8.5q0.5,-0.5 0,-1Z
        M10,4.75h0.75a0.5 0.5 0 0 1 0.5,0.5l-0.25,6.5a0.5 0.5 0 0 1 -0.5,0.5h-1a0.5 0.5 0 0 1 -0.5,-0.5l-0.25,-6.5a0.5 0.5 0 0 1 0.5,-0.5Z
        M10,13.5a1.25 1.25 0 0 1 0,2.5a1.25 1.25 0 0 1 0,-2.5Z
      "
      />
    </svg>
  );
};

export function QuestionIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="
        M6.75,7a0.75 0.75 0 0 1 -1.5,0a4.75 4.75 0 1 1 5.5,4.75v1.5a0.75 0.75 0 0 1 -1.5,0v-2.25a0.75 0.75 0 0 1 0.75,-0.75a3.25 3.25 0 1 0 -3.25,-3.2Z
        M10,15.5a1.5 1.5 0 0 1 0,3a1.5 1.5 0 0 1 0,-3Z
      "
      />
    </svg>
  );
};

export function QuestionCircleIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <circle cx="10" cy="10" r="9.125" strokeWidth="1.25" fill="none" />
      <path
        d="
        M7.75,7.75a0.75 0.75 0 0 1 -1.5,0a4 4 0 1 1 4.5,3.75v0.5a0.75 0.75 0 0 1 -1.5,0v-1.25a0.75 0.75 0 0 1 0.75,-0.75a2.5 2.5 0 1 0 -2.25,-2.2Z
        M10,14a1.25 1.25 0 0 1 0,2.5a1.25 1.25 0 0 1 0,-2.5Z
      "
      />
    </svg>
  );
};

export function QuestionCircleFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="
        M0.25,10a9.75 9.75 0 0 0 19.5,0a9.75 9.75 0 0 0 -19.5,0Z
        M7.75,7.75a0.75 0.75 0 0 1 -1.5,0a4 4 0 1 1 4.5,3.75v0.5a0.75 0.75 0 0 1 -1.5,0v-1.25a0.75 0.75 0 0 1 0.75,-0.75a2.5 2.5 0 1 0 -2.25,-2.2Z
        M10,14a1.25 1.25 0 0 1 0,2.5a1.25 1.25 0 0 1 0,-2.5Z
      "
      />
    </svg>
  );
};

export function UserIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M10,1.5a4.5 4.5 0 0 0 0,9a4.5 4.5 0 0 0 0,-9Z M2,19a8 8 0 0 1 16,0"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
};

export function UserFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M10,1.5a4.5 4.5 0 0 0 0,9a4.5 4.5 0 0 0 0,-9Z M2,19a8 8 0 0 1 16,0Z"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export function UserAddIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M10,1.5a4.5 4.5 0 0 0 0,9a4.5 4.5 0 0 0 0,-9Z M2,19a8 8 0 0 1 11,-7 M12,16h6 M15,13v6"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export function UserMinusIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M10,1.5a4.5 4.5 0 0 0 0,9a4.5 4.5 0 0 0 0,-9Z M2,19a8 8 0 0 1 11,-7 M12,16h6"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export function UsersIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M7.5,4a4 4 0 0 0 0,8a4 4 0 0 0 0,-8Z M1,19a6.5 6.5 0 0 1 13,0 M10,2.5a4 4 0 1 1 3.5,7a2 0.75 0 0 0 0,0.5a6.5 6.5 0 0 1 5.5,7"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
};

export function UsersFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M7.5,4a4 4 0 0 0 0,8a4 4 0 0 0 0,-8Z M1,19a6.5 6.5 0 0 1 13,0Z"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M10,2.5a4 4 0 1 1 3.5,7a2 0.75 0 0 0 0,0.5a6.5 6.5 0 0 1 5.5,7"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
};

export function PowerIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="M13,4a7.5 7.5 0 1 1 -6,0 M10,1.5v7.5" fill="none" strokeWidth="1.5" />
    </svg>
  );
};

export function TrashCanIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="
      M10,0.5h-2a0.75 0.75 0 0 0 -0.75,0.75v1.25h-5.25a0.75 0.75 0 0 0 -0.75,0.75v1a0.75 0.75 0 0 0 0.75,0.75h0.75l0.5,13.25a0.75 0.75 0 0 0 0.75 0.75h12a0.75 0.75 0 0 0 0.75,-0.75l0.5,-13.25h0.75a0.75 0.75 0 0 0 0.75,-0.75v-1a0.75 0.75 0 0 0 -0.75,-0.75h-5.25v-1.25a0.75 0.75 0 0 0 -0.75,-0.75Z
      M10,2h1.25v0.5h-2.5v-0.5ZZ
      M10,5h5.75l-0.5,12.5h-10.5l-0.5,-12.5Z
      M7.25,7.75a0.75 0.75 0 0 1 1.5,0v7a0.75 0.75 0 0 1 -1.5,0Z
      m4,0a0.75 0.75 0 0 1 1.5,0v7a0.75 0.75 0 0 1 -1.5,0Z
    "
      />
    </svg>
  );
};

export function TrashCanFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="
      M10,0.5h-2a0.75 0.75 0 0 0 -0.75,0.75v1.25h-5.25a0.75 0.75 0 0 0 -0.75,0.75v1a0.75 0.75 0 0 0 0.75,0.75h0.75l0.5,13.25a0.75 0.75 0 0 0 0.75 0.75h12a0.75 0.75 0 0 0 0.75,-0.75l0.5,-13.25h0.75a0.75 0.75 0 0 0 0.75,-0.75v-1a0.75 0.75 0 0 0 -0.75,-0.75h-5.25v-1.25a0.75 0.75 0 0 0 -0.75,-0.75Z
      M10,2h1.25v0.5h-2.5v-0.5ZZ
      M7.25,7.75a0.75 0.75 0 0 1 1.5,0v7a0.75 0.75 0 0 1 -1.5,0Z
      m4,0a0.75 0.75 0 0 1 1.5,0v7a0.75 0.75 0 0 1 -1.5,0Z
    "
      />
    </svg>
  );
};

export function DeleteIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="
      M10,0.5h-2a0.75 0.75 0 0 0 -0.75,0.75v1.25h-5.25a0.75 0.75 0 0 0 -0.75,0.75v1a0.75 0.75 0 0 0 0.75,0.75h0.75l0.5,13.25a0.75 0.75 0 0 0 0.75 0.75h12a0.75 0.75 0 0 0 0.75,-0.75l0.5,-13.25h0.75a0.75 0.75 0 0 0 0.75,-0.75v-1a0.75 0.75 0 0 0 -0.75,-0.75h-5.25v-1.25a0.75 0.75 0 0 0 -0.75,-0.75Z
      M10,2h1.25v0.5h-2.5v-0.5ZZ
      M10,5h5.75l-0.5,12.5h-10.5l-0.5,-12.5Z
      M7.5,7.5l2.5,2.5 2.5,-2.5a0.75 0.75 0 0 1 1.07,1.07l-2.5,2.5 2.5,2.5a0.75 0.75 0 0 1 -1.07,1.07l-2.5,-2.5 -2.5,2.5a0.75 0.75 0 0 1 -1.07,-1.07l2.5,-2.5 -2.5,-2.5a0.75 0.75 0 0 1 1.07,-1.07Z
    "
      />
    </svg>
  );
};

export function DeleteFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="
      M10,0.5h-2a0.75 0.75 0 0 0 -0.75,0.75v1.25h-5.25a0.75 0.75 0 0 0 -0.75,0.75v1a0.75 0.75 0 0 0 0.75,0.75h0.75l0.5,13.25a0.75 0.75 0 0 0 0.75 0.75h12a0.75 0.75 0 0 0 0.75,-0.75l0.5,-13.25h0.75a0.75 0.75 0 0 0 0.75,-0.75v-1a0.75 0.75 0 0 0 -0.75,-0.75h-5.25v-1.25a0.75 0.75 0 0 0 -0.75,-0.75Z
      M10,2h1.25v0.5h-2.5v-0.5ZZ
      M7.5,7.5l2.5,2.5 2.5,-2.5a0.75 0.75 0 0 1 1.07,1.07l-2.5,2.5 2.5,2.5a0.75 0.75 0 0 1 -1.07,1.07l-2.5,-2.5 -2.5,2.5a0.75 0.75 0 0 1 -1.07,-1.07l2.5,-2.5 -2.5,-2.5a0.75 0.75 0 0 1 1.07,-1.07Z
    "
      />
    </svg>
  );
};

export function DeleteBackIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="
        M0.25,10l4.5,8h14.25a0.75 0.75 0 0 0 0.75,-0.75v-14.25a0.75 0.75 0 0 0 -0.75,-0.75h-14.25Z
        m1.75,0l3.75,-6.25h12.5v12.75h-12.5Z
        M8,5.5l3.5,3.5 3.5,-3.5a0.75 0.75 0 0 1 1.07,1.07l-3.5,3.5 3.5,3.5a0.75 0.75 0 0 1 -1.07,1.07l-3.5,-3.5 -3.5,3.5a0.75 0.75 0 0 1 -1.07,-1.07l3.5,-3.5 -3.5,-3.5a0.75 0.75 0 0 1 1.07,-1.07Z
      "
      />
    </svg>
  );
};

export function DeleteBackFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="
        M0.25,10l4.5,8h14.25a0.75 0.75 0 0 0 0.75,-0.75v-14.25a0.75 0.75 0 0 0 -0.75,-0.75h-14.25Z
        M8,5.5l3.5,3.5 3.5,-3.5a0.75 0.75 0 0 1 1.07,1.07l-3.5,3.5 3.5,3.5a0.75 0.75 0 0 1 -1.07,1.07l-3.5,-3.5 -3.5,3.5a0.75 0.75 0 0 1 -1.07,-1.07l3.5,-3.5 -3.5,-3.5a0.75 0.75 0 0 1 1.07,-1.07Z
      "
      />
    </svg>
  );
};

export function CheckIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M4,6.25a0.75 0.75 0 0 1 1.5,0v6h12.5a0.75 0.75 0 0 1 0,1.5h-13.25a0.75 0.75 0 0 1 -0.75,-0.75Z"
        transform="rotate(-45,10,10)"
      />
    </svg>
  );
};

export function CheckCircleIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <circle cx="10" cy="10" r="9.125" strokeWidth="1.25" fill="none" />
      <path
        d="M4.75,6.75a0.75 0.75 0 0 1 1.5,0v4.5h10a0.75 0.75 0 0 1 0,1.5h-10.75a0.75 0.75 0 0 1 -0.75,-0.75Z"
        transform="rotate(-45,10,10)"
      />
    </svg>
  );
};

export function CheckCircleFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="
        M0.25,10a9.75 9.75 0 0 0 19.5,0a9.75 9.75 0 0 0 -19.5,0Z
        M4.75,6.75a0.75 0.75 0 0 1 1.5,0v4.5h10a0.75 0.75 0 0 1 0,1.5h-10.75a0.75 0.75 0 0 1 -0.75,-0.75Z
      "
        transform="rotate(-45,10,10)"
      />
    </svg>
  );
};

export function ShareIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M6.5,8.5 13,5 M6.5,11.5 13,15 M1.5,10a2.5 2.5 0 0 0 5,0a2.5 2.5 0 0 0 -5,0Z M13.5,4a2.5 2.5 0 0 0 5,0a2.5 2.5 0 0 0 -5,0Z M13.5,16a2.5 2.5 0 0 0 5,0a2.5 2.5 0 0 0 -5,0Z"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
};

export function ShareFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M6.5,8.5 13,5 M6.5,11.5 13,15 M1.5,10a2.5 2.5 0 0 0 5,0a2.5 2.5 0 0 0 -5,0Z M13.5,4a2.5 2.5 0 0 0 5,0a2.5 2.5 0 0 0 -5,0Z M13.5,16a2.5 2.5 0 0 0 5,0a2.5 2.5 0 0 0 -5,0Z"
        strokeWidth="1.5"
      />
    </svg>
  );
};

export function BookmarkIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M5,1h10v18l-5,-5 -5,5Z"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export function BookmarkFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M5,1h10v18l-5,-5 -5,5Z"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export function GearIcon(p: IconProps) {
  return (
    <svg {...attrs(p)} data-hoge="">
      <path
        d="M9.4279 0.866984C8.89841 0.866984 8.43969 1.23346 8.32263 1.74975L7.9962 3.14996C7.49987 3.29692 7.0178 3.49817 6.56581 3.74683L5.35114 3.0478C4.90331 2.69884 4.3197 2.76416 3.94524 3.13863L3.13725 3.94661C2.76279 4.32107 2.69748 4.90469 3.04643 5.35252L3.7456 6.56639C3.49742 7.01868 3.29636 7.5002 3.14874 7.99308L1.74945 8.32383C1.23318 8.44089 0.866699 8.8996 0.866699 9.42909V10.572C0.866699 11.1015 1.23318 11.5602 1.74945 11.6773L3.14971 12.0038C3.29661 12.4976 3.49757 12.9795 3.74638 13.4315L3.0472 14.6455C2.69825 15.0934 2.76357 15.677 3.13803 16.0515L3.94599 16.8595C4.32046 17.2339 4.90407 17.2992 5.3519 16.9503L6.56667 16.2511C7.01839 16.499 7.50021 16.7 7.9962 16.8479L8.32263 18.2482C8.43969 18.7644 8.89841 19.1309 9.4279 19.1309H10.572C11.1015 19.1309 11.5602 18.7644 11.6773 18.2482L12.0038 16.8477C12.4988 16.6998 12.9809 16.4986 13.4328 16.2492L14.6475 16.9483C15.0953 17.2973 15.6789 17.232 16.0534 16.8575L16.8613 16.0495C17.2358 15.675 17.3011 15.0914 16.9521 14.6435L16.2529 13.4295C16.5011 12.9772 16.7021 12.4957 16.8497 12.0029L18.2492 11.6721C18.7654 11.555 19.1319 11.0963 19.1319 10.5668V9.42395C19.1319 8.89446 18.7654 8.43575 18.2492 8.31869L16.8489 7.99219C16.7019 7.49834 16.501 7.01643 16.2523 6.56458L16.9515 5.35059C17.3005 4.90275 17.2352 4.31914 16.8607 3.94467L16.0527 3.13668C15.6783 2.76222 15.0947 2.69691 14.6468 3.04586L13.4321 3.74503C12.9801 3.49613 12.4981 3.29508 12.0029 3.14747L11.6764 1.74798C11.5594 1.2317 11.1007 0.866984 10.5712 0.866984H9.4279Z M7.5,10a2.5 2.5 0 0 1 5,0a2.5 2.5 0 0 1 -5,0Z"
        fill="none"
        strokeWidth="0.15rem"
      />
    </svg>
  );
};

export function GearFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M9.4279 0.866984C8.89841 0.866984 8.43969 1.23346 8.32263 1.74975L7.9962 3.14996C7.49987 3.29692 7.0178 3.49817 6.56581 3.74683L5.35114 3.0478C4.90331 2.69884 4.3197 2.76416 3.94524 3.13863L3.13725 3.94661C2.76279 4.32107 2.69748 4.90469 3.04643 5.35252L3.7456 6.56639C3.49742 7.01868 3.29636 7.5002 3.14874 7.99308L1.74945 8.32383C1.23318 8.44089 0.866699 8.8996 0.866699 9.42909V10.572C0.866699 11.1015 1.23318 11.5602 1.74945 11.6773L3.14971 12.0038C3.29661 12.4976 3.49757 12.9795 3.74638 13.4315L3.0472 14.6455C2.69825 15.0934 2.76357 15.677 3.13803 16.0515L3.94599 16.8595C4.32046 17.2339 4.90407 17.2992 5.3519 16.9503L6.56667 16.2511C7.01839 16.499 7.50021 16.7 7.9962 16.8479L8.32263 18.2482C8.43969 18.7644 8.89841 19.1309 9.4279 19.1309H10.572C11.1015 19.1309 11.5602 18.7644 11.6773 18.2482L12.0038 16.8477C12.4988 16.6998 12.9809 16.4986 13.4328 16.2492L14.6475 16.9483C15.0953 17.2973 15.6789 17.232 16.0534 16.8575L16.8613 16.0495C17.2358 15.675 17.3011 15.0914 16.9521 14.6435L16.2529 13.4295C16.5011 12.9772 16.7021 12.4957 16.8497 12.0029L18.2492 11.6721C18.7654 11.555 19.1319 11.0963 19.1319 10.5668V9.42395C19.1319 8.89446 18.7654 8.43575 18.2492 8.31869L16.8489 7.99219C16.7019 7.49834 16.501 7.01643 16.2523 6.56458L16.9515 5.35059C17.3005 4.90275 17.2352 4.31914 16.8607 3.94467L16.0527 3.13668C15.6783 2.76222 15.0947 2.69691 14.6468 3.04586L13.4321 3.74503C12.9801 3.49613 12.4981 3.29508 12.0029 3.14747L11.6764 1.74798C11.5594 1.2317 11.1007 0.866984 10.5712 0.866984H9.4279Z M7.5,10a2.5 2.5 0 0 1 5,0a2.5 2.5 0 0 1 -5,0Z"
      />
    </svg>
  );
};

export function PinIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M5,1 h10l-2,1v4l5,6v1h-16v-1l5,-6v-4Z M10,13v7Z"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export function PinFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M5,1 h10l-2,1v4l5,6v1h-16v-1l5,-6v-4Z M10,13v7Z"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export function MailIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="M1,2.75a0.75 0.75 0 0 0 -0.75,0.75v13a0.75 0.75 0 0 0 0.75,0.75h18a0.75 0.75 0 0 0 0.75,-0.75v-13a0.75 0.75 0 0 0 -0.75,-0.75Z m0.75,1.5h16.5v11.5h-16.5Z m1.75,0l6.5,4.75 6.5,-4.75h1.75v1l-8.25,6 -8.25,-6v-1" />
    </svg>
  );
};

export function MailFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path d="M1,2.75a0.75 0.75 0 0 0 -0.75,0.75v13a0.75 0.75 0 0 0 0.75,0.75h18a0.75 0.75 0 0 0 0.75,-0.75v-13a0.75 0.75 0 0 0 -0.75,-0.75Z m2.5,1.5l6.5,4.75 6.5,-4.75h1.75v1l-8.25,6 -8.25,-6v-1" />
    </svg>
  );
};

export function StarIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M10,1 12.36,7.23 19,7.64 14,12.03 15.56,18.64 10,15 4.44,18.64 6,12.03 1,7.64 7.64,7.23Z"
        fill="none"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export function StarFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M10,1 12.36,7.23 19,7.64 14,12.03 15.56,18.64 10,15 4.44,18.64 6,12.03 1,7.64 7.64,7.23Z"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export function StarHalfFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M10,15 4.44,18.64 6,12.03 1,7.64 7.64,7.23 10,1"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M10,1 12.36,7.23 19,7.64 14,12.03 15.56,18.64 10,15"
        fill="none"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export function HeartIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M10 4.6 L9 3.6 C7.314 1.947 4.412 1.947 2.622 3.736 0.832 5.526 0.832 8.428 2.622 10.217 L10 17.6 17.6 10 C19.191 8.428 19.191 5.526 17.401 3.736 15.611 1.947 12.709 1.947 10.919 3.736Z"
        fill="none"
        strokeWidth="1.5"
      />
    </svg>
  );
};

export function HeartFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M10 4.6 L9 3.6 C7.314 1.947 4.412 1.947 2.622 3.736 0.832 5.526 0.832 8.428 2.622 10.217 L10 17.6 17.6 10 C19.191 8.428 19.191 5.526 17.401 3.736 15.611 1.947 12.709 1.947 10.919 3.736Z"
        strokeWidth="1.5"
      />
    </svg>
  );
};

export function HeartHalfFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M10 4.6 L9 3.6 C7.314 1.947 4.412 1.947 2.622 3.736 0.832 5.526 0.832 8.428 2.622 10.217 L10 17.6 17.6 10 C19.191 8.428 19.191 5.526 17.401 3.736 15.611 1.947 12.709 1.947 10.919 3.736Z"
        fill="none"
        strokeWidth="1.5"
      />
      <path
        d="M10 4.6 L9 3.6 C7.314 1.947 4.412 1.947 2.622 3.736 0.832 5.526 0.832 8.428 2.622 10.217 L10 17.6"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export function FilterIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M2,1 18,1 12,10 12,19 8,17 8,10Z"
        fill="none"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export function FilterFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="M2,1 18,1 12,10 12,19 8,17 8,10Z"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export function LocationIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="
        M16,9a6.25 6.25 0 1 0 -12,0c1,3 6,10, 6,10c0,0 5,-7 6,-10Z
        m-1.5,0c-1,2.25 -4.5,7.5 -4.5,7.5c0,0 -3.5,-4.75 -4.5,-7.5a4.8 4.8 0 1 1 9,0Z
        M10,4.75a2.5 2.5 0 0 1 0,5a2.5 2.5 0 0 1 0,-5
        "
      />
    </svg>
  );
};

export function LocationFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="
        M16,9a6.25 6.25 0 1 0 -12,0c1,3 6,10, 6,10c0,0 5,-7 6,-10Z
        M10,4.75a2.5 2.5 0 0 1 0,5a2.5 2.5 0 0 1 0,-5
        "
      />
    </svg>
  );
};

export function CameraIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="
      M2,5.5a0.75 0.75 0 0 0 -0.75,0.75v10a0.75 0.75 0 0 0 0.75,0.75h16a0.75 0.75 0 0 0 0.75,-0.75v-10a0.75 0.75 0 0 0 -0.75,-0.75h-3.75l-1.5,-2h-5.5l-1.5,2Z
      m0.75,1.5h3.75l1.5,-2h4l1.5,2h3.75v8.5h-14.5Z
      M10,8a3 3 0 0 1 0,6a3 3 0 0 1 0,-6Z
      m0,1.5a1.5 1.5 0 0 0 0,3a1.5 1.5 0 0 0 0,-3Z
      M3,4.5h2v0.75h-2Z
      "
      />
    </svg>
  );
};

export function CameraFillIcon(p: IconProps) {
  return (
    <svg {...attrs(p)}>
      <path
        d="
      M2,5.5a0.75 0.75 0 0 0 -0.75,0.75v10a0.75 0.75 0 0 0 0.75,0.75h16a0.75 0.75 0 0 0 0.75,-0.75v-10a0.75 0.75 0 0 0 -0.75,-0.75h-3.75l-1.5,-2h-5.5l-1.5,2Z
      M10,8a3 3 0 0 1 0,6a3 3 0 0 1 0,-6Z
      m0,1.5a1.5 1.5 0 0 0 0,3a1.5 1.5 0 0 0 0,-3Z
      M3,4.5h2v0.75h-2Z
      "
      />
    </svg>
  );
};

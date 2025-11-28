import { useEffect, useRef, useState, type Key, type ReactNode } from "react";
import throttle from "~/components/utilities/throttle";
import { clsx } from "./utilities";

export interface CarouselHookProps {
  select: (index: number) => void;
  getCurrentIndex: () => number;
  getMaxLength: () => number;
  _setHasScroll: (scroll: boolean) => void;
  _setCurrentIndex: (index: number) => void;
};

export interface CarouselItemProps {
  key?: Key;
  element: ReactNode;
};

export interface CarouselOptions {
  align?: "start" | "center" | "end";
  removePadding?: boolean;
  children: CarouselItemProps[];
  hook?: CarouselHookProps;
  onChange?: (index: number) => void;
  onChangeScroll?: (scroll: boolean) => void;
};

type CarouselProps = Overwrite<React.HTMLAttributes<HTMLDivElement>, CarouselOptions>;

export function useCarousel(syncState: boolean = true) {
  const [hasScroll, setHasScroll] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const ref = useRef<CarouselHookProps>({
    select: () => { },
    getCurrentIndex: () => -1,
    getMaxLength: () => 0,
    _setHasScroll: syncState ? setHasScroll : () => { },
    _setCurrentIndex: syncState ? setCurrentIndex : () => { },
  });
  return [ref.current, { hasScroll, currentIndex } as const] as const;
}

export function Carousel({
  className,
  onWheel,
  align = "center",
  removePadding,
  children,
  hook,
  onChange,
  onChangeScroll,
  ...props
}: CarouselProps) {
  const ref = useRef<HTMLOListElement>(null);
  const slidesRef = useRef<HTMLElement[]>([]);
  const currentIndex = useRef(0);
  const hasScroll = useRef(false);

  function select(index: number) {
    const target = slidesRef.current[index];
    if (!target) return;
    target.scrollIntoView({
      inline: align,
      behavior: "smooth",
    });
  };

  function collectChildren() {
    if (!ref.current) {
      slidesRef.current = [];
      return;
    }
    slidesRef.current = Array.from(ref.current.children).filter(e => e instanceof HTMLElement);
  };

  function calcCurrentIndex() {
    const el = ref.current;
    if (!el) return;
    if (slidesRef.current.length === 0) collectChildren();
    if (slidesRef.current.length === 0) return;
    const scrollLeft = el.scrollLeft;
    const viewportWidth = el.clientWidth;

    // alignに応じて基準となる位置(scroll内の参照点)を決定
    const targetPos = scrollLeft + (align === "center" ? viewportWidth / 2 : align === "end" ? viewportWidth : 0);

    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    slidesRef.current.forEach((elem, index) => {
      const anchor = align === "center"
        ? (elem.offsetLeft + elem.offsetWidth / 2)
        : (align === "end" ? (elem.offsetLeft + elem.offsetWidth) : elem.offsetLeft);
      const dist = Math.abs(anchor - targetPos);
      if (dist < bestDistance) {
        bestDistance = dist;
        bestIndex = index;
      }
    });

    currentIndex.current = bestIndex;
    onChange?.(currentIndex.current);
    hook?._setCurrentIndex?.(currentIndex.current);
  }

  if (hook) {
    hook.select = select;
    hook.getCurrentIndex = () => currentIndex.current;
    hook.getMaxLength = () => children.length;
  }

  useEffect(() => {
    const resizeEvent = throttle(() => {
      if (ref.current) {
        const before = hasScroll.current;
        hasScroll.current = ref.current.scrollWidth - ref.current.clientWidth > 0;
        if (before !== hasScroll.current) {
          onChangeScroll?.(hasScroll.current);
          hook?._setHasScroll?.(hasScroll.current);
        }
      }
      calcCurrentIndex();
    }, 100);
    const resizeObserver = new ResizeObserver(() => resizeEvent());
    const scrollEvent = throttle(() => {
      calcCurrentIndex();
    }, 100);
    resizeObserver.observe(ref.current!);
    ref.current?.addEventListener("scroll", scrollEvent, { passive: true });
    select(currentIndex.current);
    resizeEvent();
    return () => {
      resizeObserver.disconnect();
      ref.current?.removeEventListener("scroll", scrollEvent);
    };
  }, [align]);

  useEffect(() => {
    collectChildren();
  }, []);

  return (
    <div
      {...props}
      data-align={align}
      data-nopad={removePadding}
      className={clsx("carousel", className)}
    >
      <div className="carousel-dummy-slides">
        {
          children.map((_, index) => (
            <div key={index} className="carousel-dummy-slide" />
          ))
        }
      </div>
      <ol ref={ref} className="carousel-slides">
        {
          children.map((item, index) => (
            <li
              key={index}
              className="carousel-slide"
            >
              {item.element}
            </li>
          ))
        }
      </ol>
    </div>
  );
};

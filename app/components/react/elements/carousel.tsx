import { useEffect, useImperativeHandle, useRef, type Key, type ReactNode, type RefObject } from "react";
import throttle from "~/components/utilities/throttle";
import { clsx } from "./utilities";

export interface CarouselRef {
  element: HTMLDivElement;
  select: (index: number) => void;
  getCurrentIndex: () => number;
  getMaxLength: () => number;
};

export interface CarouselItemProps {
  key?: Key;
  element: ReactNode;
};

export interface CarouselOptions {
  ref?: RefObject<CarouselRef | null>;
  align?: "start" | "center" | "end";
  removePadding?: boolean;
  children: CarouselItemProps[];
  onChange?: (index: number) => void;
  onChangeScroll?: (scroll: boolean) => void;
};

type CarouselProps = Overwrite<React.HTMLAttributes<HTMLDivElement>, CarouselOptions>;

export function Carousel({
  ref,
  className,
  align = "center",
  removePadding,
  children,
  onChange,
  onChangeScroll,
  ...props
}: CarouselProps) {
  const wref = useRef<HTMLDivElement>(null!);
  const lref = useRef<HTMLOListElement>(null!);
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
    slidesRef.current = Array.from(lref.current.children).filter(e => e instanceof HTMLElement);
  };

  function calcCurrentIndex() {
    const el = lref.current;
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
  }

  useEffect(() => {
    const resizeEvent = throttle(() => {
      const before = hasScroll.current;
      hasScroll.current = lref.current.scrollWidth - lref.current.clientWidth > 0;
      if (before !== hasScroll.current) {
        onChangeScroll?.(hasScroll.current);
      }
      calcCurrentIndex();
    }, 100);
    const resizeObserver = new ResizeObserver(() => resizeEvent());
    const scrollEvent = throttle(() => {
      calcCurrentIndex();
    }, 100);
    resizeObserver.observe(lref.current);
    lref.current.addEventListener("scroll", scrollEvent, { passive: true });
    select(currentIndex.current);
    resizeEvent();
    return () => {
      resizeObserver.disconnect();
      lref.current?.removeEventListener("scroll", scrollEvent);
    };
  }, [align]);

  useEffect(() => {
    collectChildren();
    select(Math.min(currentIndex.current, children.length - 1));
  }, [children.length]);

  useImperativeHandle(ref, () => {
    return {
      element: wref.current,
      select,
      getCurrentIndex: () => currentIndex.current,
      getMaxLength: () => children.length,
    };
  });

  return (
    <div
      {...props}
      ref={wref}
      data-align={align}
      data-nopad={removePadding}
      className={clsx(
        "_carousel",
        className,
      )}
    >
      <div
        className="_carousel-dummy-slides"
      >
        {
          children.map((_, index) => (
            <div
              key={index}
              className="_carousel-dummy-slide"
            />
          ))
        }
      </div>
      <ol
        ref={lref}
        className="_carousel-slides"
      >
        {
          children.map((item, index) => (
            <li
              key={index}
              className="_carousel-slide"
            >
              {item.element}
            </li>
          ))
        }
      </ol>
    </div>
  );
};

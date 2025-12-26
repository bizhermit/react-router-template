import { useEffect, useImperativeHandle, useRef, type Key, type ReactNode, type RefObject } from "react";
import throttle from "../../lib/shared/timing/throttle";
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

const MOMENTUM_DIAMETER = 50; // 慣性速度倍率
const ATTENUATION_COEFFICIENT = 0.90; // 慣性減速係数

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
    const el = lref.current;
    const target = slidesRef.current[index];
    if (!el || !target) return;

    const viewportWidth = el.clientWidth;
    const slideWidth = target.offsetWidth;

    let left = target.offsetLeft;
    if (align === "center") {
      left -= (viewportWidth - slideWidth) / 2;
    } else if (align === "end") {
      left -= (viewportWidth - slideWidth);
    }

    el.scrollTo({
      left,
      behavior: "smooth",
    });
  };

  function collectChildren() {
    slidesRef.current = Array.from(lref.current.children).filter(e => e instanceof HTMLElement);
  };

  function getIndex(scrollLeft: number) {
    const viewportWidth = lref.current.clientWidth;

    let targetPos = scrollLeft;
    if (align === "center") {
      targetPos += viewportWidth / 2;
    } else if (align === "end") {
      targetPos += viewportWidth;
    }

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
    return bestIndex;
  };

  function calcCurrentIndex() {
    if (!lref.current) return;
    const scrollLeft = lref.current.scrollLeft;
    currentIndex.current = getIndex(scrollLeft);
    onChange?.(currentIndex.current);
  };

  useEffect(() => {
    // ウィンドウリサイズ追従
    const resizeEvent = throttle(() => {
      if (!lref.current) return;
      const before = hasScroll.current;
      hasScroll.current = lref.current.scrollWidth - lref.current.clientWidth > 0;
      if (before !== hasScroll.current) {
        onChangeScroll?.(hasScroll.current);
      }
      calcCurrentIndex();
    }, 100);
    const resizeObserver = new ResizeObserver(() => resizeEvent());
    resizeObserver.observe(lref.current);

    // スクロール座標監視
    const scrollEvent = throttle(() => {
      calcCurrentIndex();
    }, 100);
    lref.current.addEventListener("scroll", scrollEvent, { passive: true });
    select(currentIndex.current);
    resizeEvent();

    // PCドラッグスクロール制御
    let dragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;
    let momentumId: number | null = null;

    function pointerup(e: PointerEvent) {
      if (!dragging) return;
      lref.current.releasePointerCapture(e.pointerId);
      dragging = false;
      lref.current.removeEventListener("pointermove", pointermove);
      lref.current.removeEventListener("pointerup", pointerup);
      lref.current.removeEventListener("pointercancel", pointerup);
      function end() {
        lref.current.removeAttribute("data-dragging");
        momentumId = null;
      };
      const firstChild = slidesRef.current[0];
      const lastChild = slidesRef.current[slidesRef.current.length - 1] as HTMLElement | undefined;
      const viewportWidth = lref.current.clientWidth;
      const slideWidth = firstChild?.offsetWidth ?? 0;
      let leftMargin = 0;
      if (align === "center") {
        leftMargin += (viewportWidth - slideWidth) / 2;
      } else if (align === "end") {
        leftMargin += (viewportWidth - slideWidth);
      }
      const leftMin = (firstChild?.offsetLeft ?? 0) - leftMargin;
      const rightMax = (lastChild?.offsetLeft ?? 0) - leftMargin;

      // 慣性スクロール
      let momentum = velocity * MOMENTUM_DIAMETER; // 速度倍率
      const decay = ATTENUATION_COEFFICIENT; // 減速係数

      function step() {
        const m = Math.abs(momentum);
        if (m < 0.1) {
          end();
          return;
        }
        if (m < 0.2) {
          const remaining = momentum / (1 - decay);
          const predictedScrollLeft = Math.min(Math.max(lref.current.scrollLeft - remaining, leftMin), rightMax);
          select(getIndex(predictedScrollLeft));
        } else {
          lref.current.scrollLeft -= momentum;
        }
        momentum *= decay;

        if (lref.current.scrollLeft < leftMin) {
          lref.current.scrollLeft = leftMin;
          end();
          select(0);
          return;
        }
        if (lref.current.scrollLeft > rightMax) {
          lref.current.scrollLeft = rightMax;
          end();
          select(slidesRef.current.length - 1);
          return;
        }

        momentumId = requestAnimationFrame(step);
      };
      momentumId = requestAnimationFrame(step);
    }

    const pointermove = throttle((e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - startX;
      lref.current.scrollLeft = startScrollLeft - dx;

      const dt = now - lastTime;
      if (dt > 0) {
        velocity = (e.clientX - lastX) / dt;
        lastX = e.clientX;
        lastTime = now;
      }
    }, 20);

    function pointerdown(e: PointerEvent) {
      if (dragging) return;
      if (e.pointerType !== "mouse") return;
      if (e.button !== 0) return;
      e.preventDefault();
      lref.current.setPointerCapture(e.pointerId);
      dragging = true;
      startX = e.clientX;
      startScrollLeft = lref.current.scrollLeft;
      lastX = e.clientX;
      lastTime = performance.now();
      velocity = 0;
      lref.current.addEventListener("pointermove", pointermove);
      lref.current.addEventListener("pointerup", pointerup);
      lref.current.addEventListener("pointercancel", pointerup);
      if (momentumId) {
        cancelAnimationFrame(momentumId);
        momentumId = null;
      }
      lref.current.setAttribute("data-dragging", "");
    };

    lref.current.addEventListener("pointerdown", pointerdown);

    return () => {
      resizeObserver.disconnect();
      lref.current?.removeEventListener("scroll", scrollEvent);
      dragging = false;
      lref.current?.removeEventListener("pointerdown", pointerdown);
      lref.current?.removeEventListener("pointermove", pointermove);
      lref.current?.removeEventListener("pointerup", pointerup);
      lref.current?.removeEventListener("pointercancel", pointerup);
      if (momentumId) {
        cancelAnimationFrame(momentumId);
        momentumId = null;
      }
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

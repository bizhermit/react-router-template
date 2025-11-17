import { useId, useRef, type ChangeEvent, type Key, type ReactNode } from "react";
import { clsx } from "./utilities";

export interface CarouselItemProps {
  key?: Key;
  element: ReactNode;
};

export interface CarouselOptions {
  align?: "start" | "center" | "end";
  removePadding?: boolean;
  children: CarouselItemProps[];
};

type CarouselProps = Overwrite<React.HTMLAttributes<HTMLDivElement>, CarouselOptions>;

export function Carousel({
  className,
  onWheel,
  align = "center",
  removePadding,
  children,
  ...props
}: CarouselProps) {
  const prefixId = useId();
  const ref = useRef<HTMLDivElement>(null);

  function scrollTo(element: HTMLElement) {
    element.scrollIntoView({
      inline: align,
      behavior: "smooth",
    });
  };

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    scrollTo(e.currentTarget.parentElement as HTMLElement);
  };

  return (
    <>
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
        <div ref={ref} className="carousel-slides">
          {
            children.map((item, index) => (
              <div
                key={index}
                className="carousel-slide"
              >
                <input
                  id={`${prefixId}_${item.key ?? index}`}
                  name={`carousel_${prefixId}`}
                  className="carousel-check"
                  type="checkbox"
                  onChange={handleChange}
                  tabIndex={-1}
                />
                {item.element}
              </div>
            ))
          }
        </div>
      </div>
      <ul className="carousel-selector">
        {
          children.map((item, index) => {
            return (
              <li key={index}>
                <label htmlFor={`${prefixId}_${item.key ?? index}`}>
                  {index}
                </label>
              </li>
            );
          })
        }
      </ul>
    </>
  );
};

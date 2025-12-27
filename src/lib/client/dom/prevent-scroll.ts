export function preventScroll(element?: HTMLElement) {
  const elems = (() => {
    if (!element) return [document.documentElement];
    let elem: HTMLElement = element;
    const arr: Array<HTMLElement> = [];
    while (elem != null) {
      arr.push(elem);
      elem = elem.parentElement!;
    }
    return arr;
  })().map(selem => {
    const st = selem.scrollTop;
    const sl = selem.scrollLeft;
    const ev = (e: Event) => {
      selem.scrollTop = st;
      selem.scrollLeft = sl;
      e.preventDefault();
    };
    const elem = selem.tagName === "HTML" ? window : selem;
    elem.addEventListener("scroll", ev);
    return { elem, ev };
  });

  return () => {
    elems.forEach(({ elem, ev }) => {
      elem.removeEventListener("scroll", ev);
    });
  };
};

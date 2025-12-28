const FOCUSABLE_SELECTOR = [
  `a[href]`,
  `button:not([disabled],[tabindex="-1"])`,
  `input:not([disabled],[type="hidden"])`,
  `textarea:not([disabled])`,
  `select:not([disabled])`,
  `summary`,
  `[tabindex]:not([tabindex="-1"])`,
  `[contenteditable="true"]`,
].join(",");

export function getFocusableElements(scope?: HTMLElement | HTMLElement[]) {
  const elems = Array.isArray(scope) ?
    scope.filter(s => !!s).map(scopeElem => Array.from(
      scopeElem.querySelectorAll(FOCUSABLE_SELECTOR)) as HTMLElement[]
    ).flat(1) :
    Array.from((scope ?? document).querySelectorAll(FOCUSABLE_SELECTOR)) as HTMLElement[];

  return elems.filter(elem => {
    if (elem == null) return false;
    const style = getComputedStyle(elem);
    if (style.display === "none") return false;
    if (style.visibility === "hidden") return false;
    let parent = elem.parentElement;
    while (parent) {
      switch (parent.tagName) {
        case "DETAILS":
        case "DIALOG":
          if (!parent.hasAttribute("open")) return false;
          break;
        default:
          break;
      }
      parent = parent.parentElement;
    }
    return true;
  });
}

export function getFocusableElement(scope?: HTMLElement | HTMLElement[]): HTMLElement | undefined {
  return getFocusableElements(scope)[0];
};

export function getPrevFocusableElement(
  target: Element | null | undefined = document.activeElement,
  scope?: HTMLElement | HTMLElement[]
): HTMLElement | undefined {
  const focusables = getFocusableElements(scope);
  if (!target) return focusables[0];
  const index = focusables.findIndex((elem) => elem === target);
  if (index < 0) return focusables[focusables.length - 1];
  return focusables[(focusables.length + index - 1) % focusables.length];
};

export function getNextFocusableElement(
  target: Element | null | undefined = document.activeElement,
  scope?: HTMLElement | HTMLElement[]
): HTMLElement | undefined {
  const focusables = getFocusableElements(scope);
  if (!target) return focusables[0];
  const index = focusables.findIndex((elem) => elem === target);
  if (index < 0) return focusables[0];
  return focusables[(focusables.length + index + 1) % focusables.length];
};

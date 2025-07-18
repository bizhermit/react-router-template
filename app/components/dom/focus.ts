const FOCUSABLE_SELECTOR = [
  `a[href]`,
  `button:not([disabled])`,
  `input:not([disabled])`,
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
    return elem != null && elem.offsetParent !== null && getComputedStyle(elem).visibility !== "hidden";
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

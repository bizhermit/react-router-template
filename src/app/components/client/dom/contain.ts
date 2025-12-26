export function containElement(parent: Element, target: Element | null | undefined) {
  if (target == null) return false;
  let elem: Element | null = target;
  while (elem) {
    elem = elem.parentElement;
    if (elem === parent) return true;
  }
  return false;
};

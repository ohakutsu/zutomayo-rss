export const isAnchorElement = (
  element: Element
): element is HTMLAnchorElement => {
  return typeof (element as any).href !== "undefined";
};

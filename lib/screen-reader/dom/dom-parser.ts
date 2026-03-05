import { AccessibleNode } from "../types";

export function parseDOM(): AccessibleNode[] {
  const nodes: AccessibleNode[] = [];

  const links = document.querySelectorAll("a");
  const buttons = document.querySelectorAll("button");
  const headings = document.querySelectorAll("h1,h2,h3");

  links.forEach((el, i) => {
    nodes.push({
      id: `link-${i}`,
      type: "link",
      label: el.textContent || "enlace",
      element: el as HTMLElement,
    });
  });

  buttons.forEach((el, i) => {
    nodes.push({
      id: `button-${i}`,
      type: "button",
      label: el.textContent || "botón",
      element: el as HTMLElement,
    });
  });

  headings.forEach((el, i) => {
    nodes.push({
      id: `heading-${i}`,
      type: "heading",
      label: el.textContent || "encabezado",
      element: el as HTMLElement,
    });
  });

  return nodes;
}

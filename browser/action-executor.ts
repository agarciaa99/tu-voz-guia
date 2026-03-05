import type { AccessibleNode } from "@/lib/screen-reader/types";

export function focusNode(node: AccessibleNode) {
  node.element.focus();

  node.element.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

export function clickNode(node: AccessibleNode) {
  node.element.click();
}

export function scrollPage(direction: string) {
  if (direction === "down") window.scrollBy({ top: 500, behavior: "smooth" });

  if (direction === "up") window.scrollBy({ top: -500, behavior: "smooth" });

  if (direction === "top") window.scrollTo({ top: 0, behavior: "smooth" });

  if (direction === "bottom")
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
}

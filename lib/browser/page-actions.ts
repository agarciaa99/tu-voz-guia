export function clickElement(selector: string) {
  const el = document.querySelector(selector);
  if (el instanceof HTMLElement) {
    el.click();
  }
}

export function focusElement(selector: string) {
  const el = document.querySelector(selector);
  if (el instanceof HTMLElement) {
    el.focus();
  }
}

export function scrollPage(direction: string) {
  if (direction === "down") window.scrollBy(0, 500);
  if (direction === "up") window.scrollBy(0, -500);
  if (direction === "top") window.scrollTo(0, 0);
  if (direction === "bottom") window.scrollTo(0, document.body.scrollHeight);
}

export interface PageElement {
  id: string;
  type: "link" | "button" | "input" | "heading" | "text";
  label: string;
  selector: string;
}

export function extractPageElements(): PageElement[] {
  const elements: PageElement[] = [];

  const links = Array.from(document.querySelectorAll("a"));
  const buttons = Array.from(document.querySelectorAll("button"));
  const inputs = Array.from(document.querySelectorAll("input"));
  const headings = Array.from(document.querySelectorAll("h1,h2,h3"));

  links.forEach((el, i) => {
    elements.push({
      id: `link-${i}`,
      type: "link",
      label: el.textContent?.trim() || "link",
      selector: `a:nth-of-type(${i + 1})`,
    });
  });

  buttons.forEach((el, i) => {
    elements.push({
      id: `button-${i}`,
      type: "button",
      label: el.textContent?.trim() || "button",
      selector: `button:nth-of-type(${i + 1})`,
    });
  });

  inputs.forEach((el, i) => {
    elements.push({
      id: `input-${i}`,
      type: "input",
      label: el.getAttribute("placeholder") || "input",
      selector: `input:nth-of-type(${i + 1})`,
    });
  });

  headings.forEach((el, i) => {
    elements.push({
      id: `heading-${i}`,
      type: "heading",
      label: el.textContent?.trim() || "heading",
      selector: `h${el.tagName[1]}:nth-of-type(${i + 1})`,
    });
  });

  return elements;
}

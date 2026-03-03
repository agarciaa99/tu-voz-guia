"use client";

/**
 * DOM Parser for Screen Reader
 * Analyzes the DOM and extracts accessible elements
 */

import type { AccessibleNode, NodeType } from "./accessibilityModel";

// Elements to analyze
const INTERACTIVE_SELECTORS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "button",
  "a[href]",
  "input:not([type='hidden'])",
  "textarea",
  "select",
  "[role='button']",
  "[role='link']",
  "[role='menuitem']",
  "[role='tab']",
  "[role='checkbox']",
  "[role='radio']",
  "[role='textbox']",
  "[role='searchbox']",
  "[role='combobox']",
  "[role='listbox']",
  "[role='slider']",
  "[role='switch']",
  "[tabindex]:not([tabindex='-1'])",
];

// Landmark selectors
const LANDMARK_SELECTORS = [
  "nav",
  "main",
  "aside",
  "header",
  "footer",
  "section[aria-label]",
  "section[aria-labelledby]",
  "[role='navigation']",
  "[role='main']",
  "[role='complementary']",
  "[role='banner']",
  "[role='contentinfo']",
  "[role='search']",
  "[role='form']",
  "[role='region'][aria-label]",
];

// Elements to ignore
const IGNORE_SELECTORS = [
  "script",
  "style",
  "noscript",
  "template",
  "[hidden]",
  "[aria-hidden='true']",
  ".sr-only",
  "[style*='display: none']",
  "[style*='visibility: hidden']",
];

/**
 * Check if element should be ignored
 */
function shouldIgnore(element: HTMLElement): boolean {
  // Check if matches ignore selectors
  for (const selector of IGNORE_SELECTORS) {
    try {
      if (element.matches(selector)) return true;
    } catch {
      // Invalid selector, skip
    }
  }

  // Check computed styles
  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") {
    return true;
  }

  // Check if inside ignored container
  const parent = element.closest("[aria-hidden='true'], [hidden]");
  if (parent && parent !== element) {
    return true;
  }

  return false;
}

/**
 * Get accessible label for an element
 */
export function getAccessibleLabel(element: HTMLElement): string {
  // Priority 1: aria-labelledby
  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) {
    const labels = labelledBy
      .split(" ")
      .map((id) => {
        const labelEl = document.getElementById(id);
        return labelEl?.textContent?.trim() || "";
      })
      .filter(Boolean);
    if (labels.length > 0) return labels.join(" ");
  }

  // Priority 2: aria-label
  const ariaLabel = element.getAttribute("aria-label");
  if (ariaLabel) return ariaLabel.trim();

  // Priority 3: aria-describedby (as supplement)
  const describedBy = element.getAttribute("aria-describedby");
  let description = "";
  if (describedBy) {
    description = describedBy
      .split(" ")
      .map((id) => {
        const descEl = document.getElementById(id);
        return descEl?.textContent?.trim() || "";
      })
      .filter(Boolean)
      .join(" ");
  }

  // Priority 4: Element-specific labels
  const tagName = element.tagName.toLowerCase();

  // Images
  if (tagName === "img") {
    const alt = element.getAttribute("alt");
    if (alt) return alt.trim();
    return "Imagen sin descripcion";
  }

  // Inputs
  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    // Check for associated label
    const id = element.id;
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) {
        const labelText = label.textContent?.trim();
        if (labelText)
          return labelText + (description ? `. ${description}` : "");
      }
    }

    // Check for wrapping label
    const parentLabel = element.closest("label");
    if (parentLabel) {
      const labelText = parentLabel.textContent?.trim();
      if (labelText) return labelText + (description ? `. ${description}` : "");
    }

    // Placeholder as fallback
    const placeholder = element.getAttribute("placeholder");
    if (placeholder) return placeholder.trim();

    // Input type as last resort
    const inputType = element.getAttribute("type") || "texto";
    return `Campo de ${inputType}` + (description ? `. ${description}` : "");
  }

  // Priority 5: textContent
  const textContent = element.textContent?.trim();
  if (textContent && textContent.length < 200) {
    return textContent + (description ? `. ${description}` : "");
  }

  // Priority 6: title attribute
  const title = element.getAttribute("title");
  if (title) return title.trim();

  // Fallback based on element type
  const role = element.getAttribute("role");
  if (role) return `Elemento ${role}`;

  return `Elemento ${tagName}`;
}

/**
 * Determine the type of accessible node
 */
function getNodeType(element: HTMLElement): NodeType {
  const tagName = element.tagName.toLowerCase();
  const role = element.getAttribute("role");

  // Headings
  if (/^h[1-6]$/.test(tagName) || role === "heading") {
    return "heading";
  }

  // Buttons
  if (
    tagName === "button" ||
    role === "button" ||
    element.getAttribute("type") === "submit"
  ) {
    return "button";
  }

  // Links
  if (tagName === "a" || role === "link") {
    return "link";
  }

  // Inputs
  if (
    ["input", "textarea", "select"].includes(tagName) ||
    [
      "textbox",
      "searchbox",
      "combobox",
      "listbox",
      "slider",
      "checkbox",
      "radio",
      "switch",
    ].includes(role || "")
  ) {
    return "input";
  }

  // Landmarks
  if (
    ["nav", "main", "aside", "header", "footer", "section"].includes(tagName) ||
    [
      "navigation",
      "main",
      "complementary",
      "banner",
      "contentinfo",
      "search",
      "form",
      "region",
    ].includes(role || "")
  ) {
    return "landmark";
  }

  // Interactive
  if (element.hasAttribute("tabindex") || element.hasAttribute("onclick")) {
    return "interactive";
  }

  return "text";
}

/**
 * Get heading level
 */
function getHeadingLevel(element: HTMLElement): number | undefined {
  const tagName = element.tagName.toLowerCase();
  const match = tagName.match(/^h([1-6])$/);
  if (match) return parseInt(match[1], 10);

  const ariaLevel = element.getAttribute("aria-level");
  if (ariaLevel) return parseInt(ariaLevel, 10);

  return undefined;
}

/**
 * Generate unique ID for element
 */
function generateNodeId(element: HTMLElement, index: number): string {
  const existingId = element.id;
  if (existingId) return `sr-${existingId}`;

  const tagName = element.tagName.toLowerCase();
  return `sr-${tagName}-${index}`;
}

/**
 * Parse the DOM and extract all accessible nodes
 */
export function parseDOM(root: HTMLElement = document.body): AccessibleNode[] {
  const nodes: AccessibleNode[] = [];
  const processedElements = new Set<HTMLElement>();
  let nodeIndex = 0;

  // Combine all selectors
  const allSelectors = [...INTERACTIVE_SELECTORS, ...LANDMARK_SELECTORS].join(
    ", ",
  );

  // Find all matching elements
  const elements = root.querySelectorAll<HTMLElement>(allSelectors);

  elements.forEach((element) => {
    // Skip if already processed or should be ignored
    if (processedElements.has(element) || shouldIgnore(element)) {
      return;
    }

    processedElements.add(element);

    const type = getNodeType(element);
    const label = getAccessibleLabel(element);
    const level = type === "heading" ? getHeadingLevel(element) : undefined;

    // Skip elements with empty labels (except landmarks)
    if (!label && type !== "landmark") {
      return;
    }

    const node: AccessibleNode = {
      id: generateNodeId(element, nodeIndex++),
      type,
      label: label || `${type} sin etiqueta`,
      level,
      element,
      rect: element.getBoundingClientRect(),
    };

    nodes.push(node);
  });

  // Sort by DOM order (visual reading order)
  nodes.sort((a, b) => {
    const rectA = a.rect!;
    const rectB = b.rect!;

    // Sort by vertical position first, then horizontal
    if (Math.abs(rectA.top - rectB.top) > 10) {
      return rectA.top - rectB.top;
    }
    return rectA.left - rectB.left;
  });

  return nodes;
}

/**
 * Get main content area
 */
export function getMainContent(): HTMLElement {
  // Try to find main element
  const main = document.querySelector<HTMLElement>("main, [role='main']");
  if (main) return main;

  // Try content-specific selectors
  const content = document.querySelector<HTMLElement>(
    "#content, #main, .content, .main",
  );
  if (content) return content;

  // Fallback to body
  return document.body;
}

/**
 * Get readable text content from element
 */
export function getReadableContent(element: HTMLElement): string {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (shouldIgnore(parent)) return NodeFilter.FILTER_REJECT;
      if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const textParts: string[] = [];
  let node: Node | null;

  while ((node = walker.nextNode())) {
    const text = node.textContent?.trim();
    if (text && text.length > 0) {
      textParts.push(text);
    }
  }

  return textParts.join(". ").replace(/\s+/g, " ").trim();
}

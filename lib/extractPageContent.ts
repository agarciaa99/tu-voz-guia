import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

export function extractPageContent(html: string) {
  const dom = new JSDOM(html);
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  return {
    title: article?.title,
    content: article?.content,
  };
}


import { Paragraph, TextRun } from 'docx';
import { processHeading } from './docx/headingHelper';
import { processTextFormat } from './docx/textFormatHelper';
import { processTable } from './docx/tableHelper';
import { processList } from './docx/listHelper';

export function processNodeToDocx(node: Node, sections: any[]) {
  if (!node) return null;

  switch (node.nodeType) {
    case Node.TEXT_NODE:
      if (node.textContent?.trim()) {
        return new TextRun({
          text: node.textContent,
        });
      }
      return null;

    case Node.ELEMENT_NODE:
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      // Handle headings
      if (tagName.match(/^h[1-6]$/)) {
        processHeading(element, sections);
        return null;
      }

      // Handle paragraphs and divs
      if (tagName === 'p' || tagName === 'div') {
        const children = Array.from(element.childNodes)
          .map(childNode => processNodeToDocx(childNode, []))
          .filter(Boolean) as TextRun[];

        if (children.length > 0) {
          sections.push(new Paragraph({ children }));
        } else if (element.textContent?.trim()) {
          sections.push(new Paragraph({
            text: element.textContent,
          }));
        }
        return null;
      }

      // Handle inline formatting
      if (tagName === 'span' || tagName === 'strong' || tagName === 'em' || 
          tagName === 'b' || tagName === 'i' || tagName === 'u') {
        return processTextFormat(element);
      }

      // Handle lists
      if (tagName === 'ul' || tagName === 'ol') {
        processList(element, sections);
        return null;
      }

      // Handle tables
      if (tagName === 'table') {
        processTable(element, sections);
        return null;
      }

      // Handle images (placeholder)
      if (tagName === 'img') {
        const altText = element.getAttribute('alt') || 'Image';
        sections.push(new Paragraph({
          text: `[${altText}]`,
        }));
        return null;
      }

      // Process children for other elements
      if (element.hasChildNodes()) {
        Array.from(element.childNodes).forEach(childNode => {
          processNodeToDocx(childNode, sections);
        });
      }
      return null;

    default:
      return null;
  }
}

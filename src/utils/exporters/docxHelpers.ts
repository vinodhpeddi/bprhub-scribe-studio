
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
        // Get inline styles
        const textAlign = element.style?.textAlign;
        
        const children = Array.from(element.childNodes)
          .map(childNode => processNodeToDocx(childNode, []))
          .filter(Boolean) as TextRun[];

        if (children.length > 0) {
          sections.push(new Paragraph({ 
            children,
            alignment: textAlign === 'center' ? 'center' : 
                       textAlign === 'right' ? 'right' : 
                       textAlign === 'justify' ? 'justified' : 'left'
          }));
        } else if (element.textContent?.trim()) {
          sections.push(new Paragraph({
            text: element.textContent,
            alignment: textAlign === 'center' ? 'center' : 
                       textAlign === 'right' ? 'right' : 
                       textAlign === 'justify' ? 'justified' : 'left'
          }));
        } else {
          // Empty paragraph
          sections.push(new Paragraph({ text: "" }));
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

      // Handle images with better support
      if (tagName === 'img') {
        try {
          const altText = element.getAttribute('alt') || 'Image';
          const src = element.getAttribute('src');
          
          // For now we'll add a placeholder, as image handling requires more complex logic
          // Full image support would need to fetch the image from src and embed it
          sections.push(new Paragraph({
            text: `[${altText}]`,
            style: "Image"
          }));
        } catch (error) {
          console.error('Failed to process image:', error);
          sections.push(new Paragraph({ text: "[Image]" }));
        }
        return null;
      }

      // Handle line breaks
      if (tagName === 'br') {
        return new TextRun({
          text: "",
          break: 1
        });
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

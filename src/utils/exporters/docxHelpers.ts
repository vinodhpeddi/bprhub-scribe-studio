import { Paragraph, TextRun, HeadingLevel, TableRow, TableCell, Table, BorderStyle, AlignmentType, UnderlineType } from 'docx';

/**
 * Helper: Process a single HTML Node into docx.js Paragraphs, TextRuns, or Tables
 * @param node Node to process.
 * @param sections Array to push generated docx elements to.
 */
export function processNodeToDocx(node: Node, sections: any[]) {
  if (!node) return null;

  switch (node.nodeType) {
    case Node.TEXT_NODE:
      if (node.textContent && node.textContent.trim()) {
        return new TextRun({
          text: node.textContent,
        });
      }
      return null;

    case Node.ELEMENT_NODE:
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      // Headings
      if (tagName.match(/^h[1-6]$/)) {
        const level = parseInt(tagName.substring(1));
        let headingLevel;
        switch(level) {
          case 1: headingLevel = HeadingLevel.HEADING_1; break;
          case 2: headingLevel = HeadingLevel.HEADING_2; break;
          case 3: headingLevel = HeadingLevel.HEADING_3; break;
          default: headingLevel = HeadingLevel.HEADING_4;
        }
        sections.push(new Paragraph({
          text: element.textContent || '',
          heading: headingLevel,
        }));
        return null;
      }

      // Paragraphs and divs
      if (tagName === 'p' || tagName === 'div') {
        const children = Array.from(element.childNodes)
          .map(childNode => processNodeToDocx(childNode, []))
          .filter(Boolean) as TextRun[];

        if (children.length > 0) {
          sections.push(new Paragraph({
            children: children,
          }));
        } else if (element.textContent && element.textContent.trim()) {
          sections.push(new Paragraph({
            text: element.textContent,
          }));
        }
        return null;
      }

      // Inline formatting
      if (tagName === 'span' || tagName === 'strong' || tagName === 'em' || tagName === 'b' || tagName === 'i' || tagName === 'u') {
        const isBold = tagName === 'strong' || tagName === 'b' || element.style.fontWeight === 'bold';
        const isItalic = tagName === 'em' || tagName === 'i' || element.style.fontStyle === 'italic';
        const isUnderline = tagName === 'u' || element.style.textDecoration === 'underline';

        return new TextRun({
          text: element.textContent || '',
          bold: isBold,
          italics: isItalic,
          underline: isUnderline ? { type: UnderlineType.SINGLE } : undefined,
        });
      }

      // Lists
      if (tagName === 'ul' || tagName === 'ol') {
        const items = element.querySelectorAll('li');
        items.forEach((item, i) => {
          const prefix = tagName === 'ol' ? `${i+1}. ` : '• ';
          const itemText = prefix + (item.textContent || '');
          sections.push(new Paragraph({
            text: itemText,
            indent: { left: 240 },
          }));
        });
        return null;
      }

      // Tables
      if (tagName === 'table') {
        try {
          const rows = element.querySelectorAll('tr');
          const tableRows = [];

          rows.forEach(row => {
            const cells = row.querySelectorAll('th, td');
            if (cells.length === 0) return;

            const tableCells = [];

            cells.forEach(cell => {
              const cellChildren = [];

              // Process cell content
              if (cell.hasChildNodes()) {
                Array.from(cell.childNodes).forEach(childNode => {
                  if (childNode.nodeType === Node.TEXT_NODE) {
                    if (childNode.textContent && childNode.textContent.trim()) {
                      cellChildren.push(new Paragraph({
                        text: childNode.textContent
                      }));
                    }
                  } else if (childNode.nodeType === Node.ELEMENT_NODE) {
                    const childElement = childNode as HTMLElement;
                    if (childElement.tagName.toLowerCase() === 'p' || childElement.tagName.toLowerCase() === 'div') {
                      cellChildren.push(new Paragraph({
                        text: childElement.textContent || ''
                      }));
                    }
                  }
                });
              }

              // If no children, add plain text
              if (cellChildren.length === 0 && cell.textContent) {
                cellChildren.push(new Paragraph(cell.textContent));
              }

              tableCells.push(new TableCell({
                children: cellChildren.length > 0 ? cellChildren : [new Paragraph("")],
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "#CFCFCF" },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: "#CFCFCF" },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "#CFCFCF" },
                  right: { style: BorderStyle.SINGLE, size: 1, color: "#CFCFCF" },
                }
              }));
            });

            if (tableCells.length > 0) {
              tableRows.push(new TableRow({
                children: tableCells,
              }));
            }
          });

          if (tableRows.length > 0) {
            sections.push(new Table({
              rows: tableRows,
            }));
          }
        } catch (error) {
          console.error("Error processing table in Word export:", error);
          sections.push(new Paragraph({
            text: "[Table content could not be processed]",
            style: "Warning",
          }));
        }
        return null;
      }

      // Images (Placeholder, does not embed image)
      if (tagName === 'img') {
        try {
          const altText = element.getAttribute('alt') || 'Image';
          sections.push(new Paragraph({
            text: `[${altText}]`,
            style: "Image",
          }));
        } catch (error) {
          console.error("Error processing image in Word export:", error);
        }
        return null;
      }

      // Other elements: process children
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

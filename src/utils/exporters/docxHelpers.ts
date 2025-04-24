
import { Paragraph, TextRun, HeadingLevel, TableRow, TableCell, Table, BorderStyle, AlignmentType, UnderlineType, WidthType } from 'docx';

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
        const isBold = tagName === 'strong' || tagName === 'b' || (element.style && element.style.fontWeight === 'bold');
        const isItalic = tagName === 'em' || tagName === 'i' || (element.style && element.style.fontStyle === 'italic');
        const isUnderline = tagName === 'u' || (element.style && element.style.textDecoration === 'underline');

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

      // Tables - Improved table handling
      if (tagName === 'table') {
        try {
          const rows = element.querySelectorAll('tr');
          const tableRows = [];
          const isLayoutTable = element.classList.contains('layout-table');
          
          // Calculate column widths based on table width (default to 100%)
          const tableWidth = element.getAttribute('width') ? parseInt(element.getAttribute('width') || '100') : 100;
          const columnCount = Math.max(...Array.from(rows).map(row => row.querySelectorAll('td, th').length));
          const columnWidth = columnCount > 0 ? 100 / columnCount : 100;

          rows.forEach(row => {
            const cells = row.querySelectorAll('th, td');
            if (cells.length === 0) return;

            const tableCells = [];

            cells.forEach(cell => {
              const cellChildren = [];
              const isHeader = cell.tagName.toLowerCase() === 'th';

              // Process rich content in cells
              processTableCell(cell, cellChildren);
              
              // If no children after processing, ensure at least an empty paragraph
              if (cellChildren.length === 0) {
                cellChildren.push(new Paragraph(""));
              }

              const cellWidth = (cell as HTMLElement).getAttribute('width') ? 
                parseInt((cell as HTMLElement).getAttribute('width') || '0') : 
                (cell.hasAttribute('colspan') ? 
                  columnWidth * parseInt(cell.getAttribute('colspan') || '1') : 
                  columnWidth);

              tableCells.push(new TableCell({
                children: cellChildren,
                width: {
                  size: cellWidth,
                  type: WidthType.PERCENTAGE
                },
                shading: isHeader ? { 
                  fill: "F2F2F2" 
                } : undefined,
                borders: isLayoutTable ? {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE }
                } : {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "#CFCFCF" },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: "#CFCFCF" },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "#CFCFCF" },
                  right: { style: BorderStyle.SINGLE, size: 1, color: "#CFCFCF" }
                },
                verticalAlign: (cell as HTMLElement).getAttribute('valign') === 'top' ? 'top' : 
                               (cell as HTMLElement).getAttribute('valign') === 'bottom' ? 'bottom' : 'center'
              }));
            });

            if (tableCells.length > 0) {
              tableRows.push(new TableRow({
                children: tableCells,
                cantSplit: true
              }));
            }
          });

          if (tableRows.length > 0) {
            sections.push(new Table({
              rows: tableRows,
              width: {
                size: tableWidth,
                type: WidthType.PERCENTAGE
              },
              layout: isLayoutTable ? "autofit" : "fixed"
            }));
            
            // Add a paragraph after table to ensure spacing
            sections.push(new Paragraph(""));
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

/**
 * Process the content of a table cell, handling nested elements properly
 */
function processTableCell(cell: Element, cellChildren: any[]) {
  // First check for block level elements
  const blockElements = cell.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, ul, ol');
  
  if (blockElements.length > 0) {
    // Process each block element separately
    blockElements.forEach(blockElement => {
      const blockSections: any[] = [];
      processNodeToDocx(blockElement, blockSections);
      if (blockSections.length > 0) {
        cellChildren.push(...blockSections);
      }
    });
  } else if (cell.childNodes.length > 0) {
    // Process inline content
    const runs: TextRun[] = [];
    
    Array.from(cell.childNodes).forEach(childNode => {
      const run = processNodeToDocx(childNode, []);
      if (run) {
        runs.push(run as TextRun);
      }
    });
    
    if (runs.length > 0) {
      cellChildren.push(new Paragraph({ children: runs }));
    } else if (cell.textContent) {
      cellChildren.push(new Paragraph({ text: cell.textContent }));
    }
  } else if (cell.textContent && cell.textContent.trim()) {
    // Just plain text
    cellChildren.push(new Paragraph({ text: cell.textContent }));
  }
}

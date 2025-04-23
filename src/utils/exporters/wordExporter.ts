
import { Document, Packer, Paragraph, TextRun, HeadingLevel, TableRow, TableCell, Table, BorderStyle, SectionType, AlignmentType, UnderlineType } from 'docx';
import { ExportOptions } from '../documentTypes';
import { generateTableOfContents } from '../documentAnalysis';

export async function htmlToDocx(content: string, options: ExportOptions, title: string): Promise<Blob> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  
  // Create an array to store document elements
  const sections = [];
  
  // Add watermark if requested
  if (options.addWatermark) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "DRAFT - DO NOT USE",
            color: "989898",
            size: 72,
            bold: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
      })
    );
  }
  
  // Add TOC if requested
  if (options.includeToc) {
    const tocContent = generateTableOfContents(content);
    const tocDoc = parser.parseFromString(tocContent, 'text/html');
    const tocHeading = new Paragraph({
      text: "Table of Contents",
      heading: HeadingLevel.HEADING_1,
    });
    sections.push(tocHeading);
    
    const tocEntries = tocDoc.querySelectorAll('p');
    tocEntries.forEach(entry => {
      const text = entry.textContent || '';
      const indent = entry.style.marginLeft ? parseInt(entry.style.marginLeft) / 20 : 0;
      
      sections.push(new Paragraph({
        text: text,
        indent: { left: indent * 240 }, // 240 twips = 0.2 inches
      }));
    });
  }
  
  // Add title as heading if it doesn't already exist in the content
  if (title && !doc.querySelector('h1')) {
    sections.push(new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
    }));
  }
  
  // Improved recursive function to process HTML nodes
  function processNode(node: Node): TextRun | null {
    if (!node) return null;
    
    // Handle different node types
    switch (node.nodeType) {
      case Node.TEXT_NODE:
        // Only process text that has content (not just whitespace)
        if (node.textContent && node.textContent.trim()) {
          return new TextRun({
            text: node.textContent,
          });
        }
        return null;
      
      case Node.ELEMENT_NODE:
        // Process different element types
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        
        // Handle headings
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
        
        // Handle paragraphs and divs
        if (tagName === 'p' || tagName === 'div') {
          const children = Array.from(element.childNodes)
            .map(childNode => processNode(childNode))
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
        
        // Handle spans and inline formatting
        if (tagName === 'span' || tagName === 'strong' || tagName === 'em' || tagName === 'b' || tagName === 'i' || tagName === 'u') {
          const isBold = tagName === 'strong' || tagName === 'b' || element.style.fontWeight === 'bold';
          const isItalic = tagName === 'em' || tagName === 'i' || element.style.fontStyle === 'italic';
          const isUnderline = tagName === 'u' || element.style.textDecoration === 'underline';
          
          return new TextRun({
            text: element.textContent || '',
            bold: isBold,
            italics: isItalic, // Fixed: 'italic' -> 'italics'
            underline: isUnderline ? { type: UnderlineType.SINGLE } : undefined, // Fixed: Using UnderlineType instead of IUnderline
          });
        }
        
        // Handle lists
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
        
        // Handle tables
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
                  // If cell has formatted content, process it
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
                
                // If no children were processed but cell has text, add it
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
            // Add a fallback paragraph to show something instead of crashing
            sections.push(new Paragraph({
              text: "[Table content could not be processed]",
              style: "Warning",
            }));
          }
          return null;
        }
        
        // Handle images
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
        
        // Process child nodes for other elements
        if (element.hasChildNodes()) {
          Array.from(element.childNodes).forEach(childNode => {
            processNode(childNode);
          });
        }
        return null;
      
      default:
        return null;
    }
  }
  
  // Process all elements in the body
  Array.from(doc.body.childNodes).forEach(node => {
    processNode(node);
  });
  
  // If no content was processed, add a default paragraph
  if (sections.length === 0) {
    sections.push(new Paragraph({
      text: title || "Document",
      heading: HeadingLevel.HEADING_1,
    }));
    sections.push(new Paragraph({
      text: "No content available.",
    }));
  }

  const docWithContent = new Document({
    title: title,
    description: "Document created with BPRHub Scribe Studio",
    sections: [
      {
        properties: {
          type: SectionType.CONTINUOUS,
        },
        children: sections
      }
    ]
  });

  return await Packer.toBlob(docWithContent);
}

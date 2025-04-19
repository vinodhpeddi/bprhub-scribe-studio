
import { Document, Packer, Paragraph, TextRun, HeadingLevel, TableRow, TableCell, Table, BorderStyle, SectionType } from 'docx';
import { ExportOptions } from '../documentTypes';
import { generateTableOfContents } from '../documentAnalysis';

export async function htmlToDocx(content: string, options: ExportOptions, title: string): Promise<Blob> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  
  let sections = [];
  
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
        alignment: "center",
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
  
  // Process HTML content
  const elements = Array.from(doc.body.children);
  elements.forEach(element => {
    if (element.tagName.toLowerCase().startsWith('h')) {
      const level = parseInt(element.tagName.substring(1));
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
    } else if (element.tagName.toLowerCase() === 'p') {
      sections.push(new Paragraph({
        text: element.textContent || '',
      }));
    } else if (element.tagName.toLowerCase() === 'ul' || element.tagName.toLowerCase() === 'ol') {
      const items = element.querySelectorAll('li');
      items.forEach((item, i) => {
        const prefix = element.tagName.toLowerCase() === 'ol' ? `${i+1}. ` : '• ';
        sections.push(new Paragraph({
          text: prefix + (item.textContent || ''),
          indent: { left: 240 },
        }));
      });
    } else if (element.tagName.toLowerCase() === 'table') {
      const rows = element.querySelectorAll('tr');
      const tableRows = [];
      
      rows.forEach(row => {
        const cells = row.querySelectorAll('th, td');
        const tableCells = [];
        
        cells.forEach(cell => {
          tableCells.push(new TableCell({
            children: [new Paragraph(cell.textContent || '')],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "#CFCFCF" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "#CFCFCF" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "#CFCFCF" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "#CFCFCF" },
            }
          }));
        });
        
        tableRows.push(new TableRow({
          children: tableCells,
        }));
      });
      
      sections.push(new Table({
        rows: tableRows,
      }));
    }
  });

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

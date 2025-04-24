
import { Document, Packer, Paragraph, HeadingLevel, SectionType, AlignmentType, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { ExportOptions } from '../documentTypes';
import { generateTableOfContents } from '../documentAnalysis';
import { processNodeToDocx } from './docxHelpers';

export async function htmlToDocxConverter(content: string, options: ExportOptions, title: string): Promise<Blob> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');

  const sections: any[] = [];

  // Add watermark if needed
  if (options.addWatermark) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "DRAFT - DO NOT USE",
            color: "D3D3D3",
            size: 72,
            bold: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
      })
    );
    sections.push(new Paragraph({ text: "" }));
  }

  // Add TOC if needed
  if (options.includeToc) {
    const tocContent = generateTableOfContents(content);
    const tocDoc = parser.parseFromString(tocContent, 'text/html');
    sections.push(new Paragraph({
      text: "Table of Contents",
      heading: HeadingLevel.HEADING_1,
    }));

    const tocEntries = tocDoc.querySelectorAll('p');
    tocEntries.forEach(entry => {
      const text = entry.textContent || '';
      const indent = entry.style.marginLeft ? parseInt(entry.style.marginLeft) / 20 : 0;
      sections.push(new Paragraph({
        text: text,
        indent: { left: indent * 240 },
      }));
    });
    
    sections.push(new Paragraph({ text: "" }));
    sections.push(new Paragraph({ text: "" }));
  }

  // Add title
  if (title && !doc.querySelector('h1')) {
    sections.push(new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
    }));
  }

  // Process all content preserving structure
  Array.from(doc.body.childNodes).forEach(node => {
    processNodeToDocx(node, sections);
  });

  // Create document with proper styling
  const docWithContent = new Document({
    title: title,
    description: "Document created with Scribe Studio",
    sections: [
      {
        properties: {
          type: SectionType.CONTINUOUS,
        },
        children: sections
      }
    ],
    styles: {
      paragraphStyles: [
        {
          id: "Normal",
          name: "Normal",
          run: {
            size: 24,
          },
        },
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          run: {
            size: 36,
            bold: true,
          },
        },
        {
          id: "TableCell",
          name: "Table Cell",
          basedOn: "Normal",
          run: {
            size: 24,
          },
          paragraph: {
            spacing: {
              before: 100,
              after: 100,
            },
          },
        },
      ],
    },
  });

  return await Packer.toBlob(docWithContent);
}

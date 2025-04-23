
import { Document, Packer, Paragraph, HeadingLevel, SectionType, AlignmentType, TextRun } from 'docx';
import { ExportOptions } from '../documentTypes';
import { generateTableOfContents } from '../documentAnalysis';
import { processNodeToDocx } from './docxHelpers';

/**
 * Convert HTML content to docx Blob.
 */
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
            color: "989898",
            size: 72,
            bold: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
      })
    );
  }

  // Add TOC if needed
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
        indent: { left: indent * 240 },
      }));
    });
  }

  // Add title as heading if missing
  if (title && !doc.querySelector('h1')) {
    sections.push(new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
    }));
  }

  // Iterate through HTML body child nodes and process them recursively
  Array.from(doc.body.childNodes).forEach(node => {
    processNodeToDocx(node, sections);
  });

  // Add default content if nothing was processed
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

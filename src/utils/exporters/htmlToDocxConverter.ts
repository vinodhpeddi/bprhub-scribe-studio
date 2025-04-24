
import { Document, Packer, Paragraph, HeadingLevel, SectionType, AlignmentType, TextRun, Table, ImageRun } from 'docx';
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

  // Add watermark if needed - improved transparency and positioning
  if (options.addWatermark) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "DRAFT - DO NOT USE",
            color: "D3D3D3", // Light gray for transparency effect
            size: 72,
            bold: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
      })
    );
    
    // Add spacing after watermark
    sections.push(new Paragraph({ text: "" }));
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
    
    // Add a separator after TOC
    sections.push(new Paragraph({ text: "" }));
    sections.push(new Paragraph({ text: "" }));
  }

  // Add title as heading if missing
  if (title && !doc.querySelector('h1')) {
    sections.push(new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
    }));
  }

  console.log('Processing HTML document for Word export');
  
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
  
  console.log(`Generated ${sections.length} sections for Word document`);
  console.log(`Tables: ${sections.filter(section => section instanceof Table).length}`);

  // Create a new document with all the processed content
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
          id: "Image",
          name: "Image",
          basedOn: "Normal",
          run: {
            italics: true,
            color: "808080",
          },
          paragraph: {
            alignment: AlignmentType.CENTER,
          },
        },
      ],
    },
  });

  return await Packer.toBlob(docWithContent);
}

import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, TableRow, TableCell, Table, BorderStyle, SectionType, IPropertiesOptions } from 'docx';
import * as pdfLib from 'pdf-lib';
import { ExportOptions } from './documentTypes';
import { generateTableOfContents } from './documentAnalysis';
import { validateDocument } from './documentAnalysis';
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set worker path for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export async function exportDocument(content: string, options: ExportOptions, title: string = "Document"): Promise<void> {
  try {
    // Validate document before export
    const validation = validateDocument(title, content);
    if (!validation.isValid) {
      throw new Error(`Cannot export document: ${validation.errors.join(', ')}`);
    }

    let blob: Blob;
    let filename: string;
    
    // Format the title for the filename (replace spaces with underscores and remove special characters)
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    switch (options.format) {
      case 'pdf':
        blob = await htmlToPdf(content, options, title);
        filename = `${safeTitle}.pdf`;
        break;
        
      case 'word':
        blob = await htmlToDocx(content, options, title);
        filename = `${safeTitle}.docx`;
        break;
        
      case 'html':
        // For HTML export, package the content with basic styling
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>${title}</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
              h1 { font-size: 24px; }
              h2 { font-size: 20px; }
              table { border-collapse: collapse; width: 100%; }
              table, th, td { border: 1px solid #ddd; }
              th, td { padding: 8px; text-align: left; }
              ${options.addWatermark ? `
              body::before {
                content: 'DRAFT - DO NOT USE';
                position: fixed;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                z-index: -1;
                color: rgba(200, 0, 0, 0.1);
                font-size: 80px;
                font-weight: bold;
                display: flex;
                justify-content: center;
                align-items: center;
                transform: rotate(-45deg);
              }` : ''}
            </style>
          </head>
          <body>
            ${options.includeToc ? generateTableOfContents(content) : ''}
            ${content}
          </body>
          </html>
        `;
        
        blob = new Blob([htmlContent], { type: 'text/html' });
        filename = `${safeTitle}.html`;
        break;
        
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
    
    // Save the file
    saveAs(blob, filename);
    
    console.log(`Exporting document as ${options.format}`, { content, options, title });
  } catch (error) {
    console.error('Error exporting document:', error);
    throw error;
  }
}

async function htmlToDocx(content: string, options: ExportOptions, title: string): Promise<Blob> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  
  // Define paragraph styles
  const paragraphStyles = [
    {
      id: "Heading1",
      name: "Heading 1",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: {
        size: 36,
        bold: true,
        color: "000000",
      },
      paragraph: {
        spacing: {
          after: 200,
        },
      },
    },
    {
      id: "Heading2",
      name: "Heading 2",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: {
        size: 30,
        bold: true,
        color: "000000",
      },
      paragraph: {
        spacing: {
          after: 120,
        },
      },
    },
  ];
  
  // Generate children recursively from HTML
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
        alignment: "center",
        style: {
          paragraph: {
            spacing: {
              after: 0,
            },
          },
        },
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
    
    // Add TOC entries with proper indentation
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
  
  // Process the HTML content
  const elements = Array.from(doc.body.children);
  elements.forEach(element => {
    if (element.tagName.toLowerCase().startsWith('h')) {
      // Handle headings
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
      // Handle paragraphs
      sections.push(new Paragraph({
        text: element.textContent || '',
      }));
    } else if (element.tagName.toLowerCase() === 'ul' || element.tagName.toLowerCase() === 'ol') {
      // Handle lists
      const items = element.querySelectorAll('li');
      items.forEach((item, i) => {
        const prefix = element.tagName.toLowerCase() === 'ol' ? `${i+1}. ` : '• ';
        sections.push(new Paragraph({
          text: prefix + (item.textContent || ''),
          indent: { left: 240 }, // 240 twips = 0.2 inches
        }));
      });
    } else if (element.tagName.toLowerCase() === 'table') {
      // Handle tables
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

  // Create a document with all the content and styles defined inline
  const docWithContent = new Document({
    title: title,
    description: "Document created with BPRHub Scribe Studio",
    sections: [
      {
        properties: {
          page: {
            size: {
              width: options.paperSize === 'a4' ? 11906 : options.paperSize === 'letter' ? 12240 : 14040,
              height: options.paperSize === 'a4' ? 16838 : options.paperSize === 'letter' ? 15840 : 22860,
            },
          },
        },
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.TITLE,
          }),
          ...sections
        ],
      }
    ],
    styles: {
      paragraphStyles: paragraphStyles
    }
  });

  // Generate the document blob
  return await Packer.toBlob(docWithContent);
}

async function htmlToPdf(content: string, options: ExportOptions, title: string): Promise<Blob> {
  const pdfDoc = await pdfLib.PDFDocument.create();
  const page = pdfDoc.addPage(options.paperSize === 'a4' 
    ? [595.28, 841.89] // A4 dimensions in points
    : options.paperSize === 'letter' 
      ? [612, 792] // Letter dimensions in points
      : [612, 1008] // Legal dimensions in points
  );
  
  const { width, height } = page.getSize();
  const fontSize = 12;
  const lineHeight = fontSize * 1.2;
  const margin = 50;
  
  // Add title
  page.drawText(title, {
    x: margin,
    y: height - margin,
    size: fontSize * 2,
  });
  
  // Add watermark if requested
  if (options.addWatermark) {
    // Draw diagonal watermark
    const watermarkText = 'DRAFT - DO NOT USE';
    const watermarkFont = fontSize * 3;
    
    page.drawText(watermarkText, {
      x: width / 2 - 150,
      y: height / 2,
      size: watermarkFont,
      color: pdfLib.rgb(0.9, 0.9, 0.9),
      rotate: pdfLib.degrees(-45),
    });
  }
  
  // Parse HTML content to extract text
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  
  // Add TOC if requested
  let yPosition = height - margin - lineHeight * 3;
  
  if (options.includeToc) {
    const tocContent = generateTableOfContents(content);
    const tocDoc = parser.parseFromString(tocContent, 'text/html');
    
    page.drawText("Table of Contents", {
      x: margin,
      y: yPosition,
      size: fontSize * 1.5,
    });
    
    yPosition -= lineHeight * 2;
    
    const tocEntries = tocDoc.querySelectorAll('p');
    tocEntries.forEach(entry => {
      const text = entry.textContent || '';
      const indent = entry.style.marginLeft ? parseInt(entry.style.marginLeft) / 20 : 0;
      
      page.drawText(text, {
        x: margin + (indent * 20),
        y: yPosition,
        size: fontSize,
      });
      
      yPosition -= lineHeight;
      
      // Add new page if needed
      if (yPosition < margin) {
        const newPage = pdfDoc.addPage([width, height]);
        yPosition = height - margin;
      }
    });
    
    yPosition -= lineHeight;
  }
  
  // Process HTML content
  const elements = Array.from(doc.body.children);
  
  for (const element of elements) {
    if (element.tagName.toLowerCase().startsWith('h')) {
      // Handle headings
      const level = parseInt(element.tagName.substring(1));
      const headingSize = fontSize * (2.5 - (level * 0.3));
      
      // Add new page if needed
      if (yPosition < margin) {
        const newPage = pdfDoc.addPage([width, height]);
        yPosition = height - margin;
      }
      
      page.drawText(element.textContent || '', {
        x: margin,
        y: yPosition,
        size: headingSize,
      });
      
      yPosition -= lineHeight * 2;
    } else if (element.tagName.toLowerCase() === 'p') {
      // Handle paragraphs with text wrapping (simplified)
      const text = element.textContent || '';
      
      // Simple text wrapping calculation
      const maxCharsPerLine = Math.floor((width - margin * 2) / (fontSize * 0.6));
      
      for (let i = 0; i < text.length; i += maxCharsPerLine) {
        // Add new page if needed
        if (yPosition < margin) {
          const newPage = pdfDoc.addPage([width, height]);
          yPosition = height - margin;
        }
        
        const lineText = text.substring(i, i + maxCharsPerLine);
        
        page.drawText(lineText, {
          x: margin,
          y: yPosition,
          size: fontSize,
        });
        
        yPosition -= lineHeight;
      }
      
      yPosition -= lineHeight;
    }
    // Note: This is simplified and would require additional handlers for lists, tables, images, etc.
  }
  
  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export async function importDocument(file: File): Promise<string> {
  try {
    const fileType = file.type;
    let content = '';
    
    if (fileType === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      
      let textContent = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        textContent += text.items.map((item: any) => item.str).join(' ') + '\n\n';
      }
      
      content = `<h1>${file.name.replace('.pdf', '')}</h1>` + 
        textContent.split('\n\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('');
        
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               fileType === 'application/msword') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      content = result.value;
      
    } else if (fileType === 'text/html' || fileType === 'application/xhtml+xml') {
      const text = await file.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      
      content = doc.body.innerHTML;
      
    } else if (fileType === 'text/plain') {
      const text = await file.text();
      const paragraphs = text.split('\n\n').filter(p => p.trim());
      content = `<h1>${file.name.replace('.txt', '')}</h1>` + 
        paragraphs.map(p => `<p>${p}</p>`).join('');
        
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
    
    return content;
  } catch (error) {
    console.error('Error importing document:', error);
    throw error;
  }
}

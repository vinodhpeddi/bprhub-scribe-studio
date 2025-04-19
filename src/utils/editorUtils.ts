
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, TableRow, TableCell, Table, BorderStyle } from 'docx';
import * as pdfLib from 'pdf-lib';
import mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';

// Set worker path for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  initialContent: string;
}

export interface UserDocument {
  id: string;
  title: string;
  content: string;
  template: string;
  lastModified: string;
  createdAt: string;
  isDraft: boolean;
}

export type ExportFormat = 'pdf' | 'word' | 'html';

export interface ExportOptions {
  format: ExportFormat;
  paperSize: 'a4' | 'letter' | 'legal';
  includeToc: boolean;
  compressImages: boolean;
}

export const templates: DocumentTemplate[] = [
  {
    id: 'sop',
    name: 'Standard Operating Procedure',
    description: 'A structured document that details step-by-step instructions for routine operations.',
    icon: 'file-text',
    initialContent: '<h1>Standard Operating Procedure</h1><p>Document Number: SOP-</p><p>Revision: 0</p><p>Effective Date: [Date]</p><h2>1. Purpose</h2><p>The purpose of this SOP is to...</p><h2>2. Scope</h2><p>This procedure applies to...</p><h2>3. Responsibilities</h2><p>The following personnel are responsible for...</p><h2>4. Procedure</h2><p>This section outlines the steps required to...</p><h2>5. References</h2><p>List any related documents or references here.</p>'
  },
  {
    id: 'work-instruction',
    name: 'Work Instruction',
    description: 'Detailed instructions for completing a specific task within a process.',
    icon: 'file-text',
    initialContent: '<h1>Work Instruction</h1><p>Document Number: WI-</p><p>Revision: 0</p><p>Effective Date: [Date]</p><h2>1. Purpose</h2><p>This work instruction describes how to...</p><h2>2. Materials Needed</h2><ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul><h2>3. Steps</h2><ol><li>First, do this...</li><li>Then, do this...</li><li>Finally, do this...</li></ol><h2>4. Expected Results</h2><p>After completing these steps, you should observe...</p>'
  },
  {
    id: 'checklist',
    name: 'Checklist',
    description: 'A structured list of items to verify, check, or inspect.',
    icon: 'check-square',
    initialContent: '<h1>Checklist</h1><p>Document Number: CL-</p><p>Revision: 0</p><p>Effective Date: [Date]</p><h2>Pre-Operation Checks</h2><ul><li>[ ] Item 1 checked</li><li>[ ] Item 2 checked</li><li>[ ] Item 3 checked</li></ul><h2>Operation Checks</h2><ul><li>[ ] Item 1 verified</li><li>[ ] Item 2 verified</li><li>[ ] Item 3 verified</li></ul><h2>Post-Operation Checks</h2><ul><li>[ ] Item 1 completed</li><li>[ ] Item 2 completed</li><li>[ ] Item 3 completed</li></ul><p>Completed by: ________________ Date: _______</p>'
  },
  {
    id: 'blank',
    name: 'Blank Document',
    description: 'Start with a completely blank document.',
    icon: 'file',
    initialContent: '<h1>Document Title</h1><p>Start writing here...</p>'
  }
];

export const defaultExportOptions: ExportOptions = {
  format: 'pdf',
  paperSize: 'a4',
  includeToc: true,
  compressImages: true
};

export function parseDocumentOutline(content: string): { id: string; level: number; text: string }[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  return Array.from(headings).map((heading, index) => {
    const level = parseInt(heading.tagName.substring(1));
    return {
      id: `heading-${index}`,
      level,
      text: heading.textContent || ''
    };
  });
}

export function countElements(content: string): { 
  paragraphs: number; 
  tables: number; 
  lists: number;
  images: number;
  words: number;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  
  const paragraphs = doc.querySelectorAll('p').length;
  const tables = doc.querySelectorAll('table').length;
  const lists = doc.querySelectorAll('ul, ol').length;
  const images = doc.querySelectorAll('img').length;
  
  // Count words in all text nodes
  const text = doc.body.textContent || '';
  const words = text.split(/\s+/).filter(word => word.length > 0).length;
  
  return {
    paragraphs,
    tables,
    lists,
    images,
    words
  };
}

// Generate TOC for PDF and Word exports
export function generateTableOfContents(content: string): string {
  const outline = parseDocumentOutline(content);
  let tocHtml = '<h2>Table of Contents</h2>';
  
  outline.forEach(heading => {
    const indent = (heading.level - 1) * 20;
    tocHtml += `<p style="margin-left: ${indent}px;"><a href="#${heading.id}">${heading.text}</a></p>`;
  });
  
  return tocHtml;
}

// Convert HTML to docx format
async function htmlToDocx(content: string, options: ExportOptions, title: string): Promise<Blob> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  
  const docx = new Document({
    title: title,
    description: "Document created with BPRHub Scribe Studio",
    styles: {
      paragraphStyles: [
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
      ]
    }
  });

  // Add title
  const titleParagraph = new Paragraph({
    text: title,
    heading: HeadingLevel.TITLE,
  });

  // Generate children recursively from HTML
  const sections = [];
  
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

  // Add all sections to the document
  docx.addSection({
    children: [titleParagraph, ...sections],
    properties: {
      page: {
        size: {
          width: options.paperSize === 'a4' ? 11906 : options.paperSize === 'letter' ? 12240 : 14040,
          height: options.paperSize === 'a4' ? 16838 : options.paperSize === 'letter' ? 15840 : 22860,
        },
      },
    },
  });

  // Generate the document blob
  return await Packer.toBlob(docx);
}

// Convert HTML to PDF using pdf-lib
async function htmlToPdf(content: string, options: ExportOptions, title: string): Promise<Blob> {
  // For a production app, you would typically use a server-side solution or a more robust client-side library
  // This is a simplified version that creates a basic PDF
  
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
  
  // Process HTML content (simplified - would need a more complex implementation for a full solution)
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

// Export document to requested format
export async function exportDocument(content: string, options: ExportOptions, title: string = "Document"): Promise<void> {
  try {
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

// Import document from file
export async function importDocument(file: File): Promise<string> {
  try {
    const fileType = file.type;
    let content = '';
    
    if (fileType === 'application/pdf') {
      // For PDF import (simplified - would need a more robust solution in production)
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      
      let textContent = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        textContent += text.items.map((item: any) => item.str).join(' ') + '\n\n';
      }
      
      // Convert plain text to HTML (very basic)
      const paragraphs = textContent.split('\n\n').filter(p => p.trim());
      content = `<h1>${file.name.replace('.pdf', '')}</h1>` + 
        paragraphs.map(p => `<p>${p}</p>`).join('');
        
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               fileType === 'application/msword') {
      // For Word import using mammoth.js
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      content = result.value;
      
    } else if (fileType === 'text/html' || fileType === 'application/xhtml+xml') {
      // For HTML import
      const text = await file.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      
      // Extract just the body content
      content = doc.body.innerHTML;
      
    } else if (fileType === 'text/plain') {
      // For plain text import
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

// Save document to localStorage
export function saveDocument(document: UserDocument): void {
  try {
    // Get existing documents
    const storedDocs = localStorage.getItem('userDocuments');
    const docs: UserDocument[] = storedDocs ? JSON.parse(storedDocs) : [];
    
    // Check if document already exists
    const existingIndex = docs.findIndex(doc => doc.id === document.id);
    
    if (existingIndex >= 0) {
      // Update existing document
      docs[existingIndex] = document;
    } else {
      // Add new document
      docs.push(document);
    }
    
    // Save to localStorage
    localStorage.setItem('userDocuments', JSON.stringify(docs));
  } catch (error) {
    console.error('Error saving document:', error);
    throw error;
  }
}

// Get all documents from localStorage
export function getAllDocuments(): UserDocument[] {
  try {
    const storedDocs = localStorage.getItem('userDocuments');
    return storedDocs ? JSON.parse(storedDocs) : [];
  } catch (error) {
    console.error('Error getting documents:', error);
    return [];
  }
}

// Get a single document by ID
export function getDocumentById(id: string): UserDocument | null {
  try {
    const docs = getAllDocuments();
    return docs.find(doc => doc.id === id) || null;
  } catch (error) {
    console.error('Error getting document:', error);
    return null;
  }
}

// Delete a document by ID
export function deleteDocument(id: string): void {
  try {
    const docs = getAllDocuments();
    const filteredDocs = docs.filter(doc => doc.id !== id);
    localStorage.setItem('userDocuments', JSON.stringify(filteredDocs));
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

// Create a new document draft
export function createNewDraft(template: DocumentTemplate, title: string = 'Untitled Document'): UserDocument {
  const now = new Date().toISOString();
  return {
    id: Date.now().toString(),
    title,
    content: template.initialContent,
    template: template.id,
    lastModified: now,
    createdAt: now,
    isDraft: true
  };
}

// Convert draft to final document
export function finalizeDraft(document: UserDocument): UserDocument {
  return {
    ...document,
    isDraft: false,
    lastModified: new Date().toISOString()
  };
}

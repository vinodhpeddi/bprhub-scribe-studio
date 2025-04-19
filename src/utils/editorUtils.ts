
export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  initialContent: string;
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
    icon: 'clipboard-list',
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

export function exportDocument(content: string, options: ExportOptions): void {
  // This is a placeholder function that would be implemented with actual export logic
  console.log(`Exporting document as ${options.format}`, { content, options });
  alert(`Document would be exported as ${options.format} (${options.paperSize})`);
  
  // In a real implementation, this would integrate with libraries like html2pdf.js,
  // docx.js, or make a server request to generate the document
}

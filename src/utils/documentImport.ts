
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';
import { initPdfWorker } from './pdfWorker';
import { toast } from 'sonner';

// Initialize PDF.js worker
initPdfWorker();

export async function importDocument(file: File): Promise<string> {
  try {
    const fileType = file.type;
    let content = '';
    
    if (fileType === 'application/pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        
        let textContent = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const text = await page.getTextContent();
          textContent += text.items.map((item: any) => item.str).join(' ') + '\n\n';
        }
        
        content = `<h1>${file.name.replace('.pdf', '')}</h1>` + 
          textContent.split('\n\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('');
      } catch (pdfError) {
        console.error('PDF processing error:', pdfError);
        throw new Error(`Failed to process PDF: ${pdfError.message}`);
      }
        
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
    toast.error(`Import failed: ${error.message || 'Unknown error'}`);
    throw error;
  }
}

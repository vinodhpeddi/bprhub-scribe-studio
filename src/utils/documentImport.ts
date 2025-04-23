
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';
import { initPdfWorker, validatePdfWorker } from './pdfWorker';
import { toast } from 'sonner';

// Initialize PDF.js worker
initPdfWorker();

export async function importDocument(file: File): Promise<string> {
  try {
    const fileType = file.type;
    let content = '';
    
    if (fileType === 'application/pdf') {
      try {
        // Validate PDF worker is available
        const isWorkerValid = await validatePdfWorker();
        if (!isWorkerValid) {
          console.warn('PDF.js worker not validated, attempting import anyway');
        }
        
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
          
        console.log('PDF import successful:', { pages: pdf.numPages, contentLength: content.length });
      } catch (pdfError) {
        console.error('PDF processing error:', pdfError);
        throw new Error(`Failed to process PDF: ${pdfError.message}`);
      }
        
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               fileType === 'application/msword') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        content = result.value;
        
        // Ensure the content is wrapped in appropriate HTML tags if not already
        if (!content.includes('<h1>') && !content.includes('<h2>')) {
          content = `<h1>${file.name.replace(/\.(docx|doc)$/, '')}</h1>` + content;
        }
        
        console.log('Word import successful:', { contentLength: content.length });
      } catch (wordError) {
        console.error('Word processing error:', wordError);
        throw new Error(`Failed to process Word document: ${wordError.message}`);
      }
      
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
    
    if (!content.trim()) {
      throw new Error('Imported document contains no content');
    }
    
    return content;
  } catch (error) {
    console.error('Error importing document:', error);
    toast.error(`Import failed: ${error.message || 'Unknown error'}`);
    throw error;
  }
}

// Test function to verify import functionality
export async function testDocumentImport(fileType: string): Promise<boolean> {
  try {
    // Create a test file based on the specified type
    let testContent: string = '';
    let testFile: File;
    
    switch (fileType) {
      case 'text/plain':
        testContent = 'Test content\n\nSecond paragraph';
        testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
        break;
        
      case 'text/html':
        testContent = '<html><body><h1>Test Title</h1><p>Test paragraph</p></body></html>';
        testFile = new File([testContent], 'test.html', { type: 'text/html' });
        break;
        
      // Note: PDF and Word imports are more complex to test as they require valid binary formats
      // In a real test suite, you would use actual test files for these formats
      
      default:
        console.warn(`Test for ${fileType} not implemented`);
        return false;
    }
    
    // Attempt to import the test file
    const result = await importDocument(testFile);
    
    // Simple validation that the import returned content
    return result.length > 0;
  } catch (error) {
    console.error('Import test failed:', error);
    return false;
  }
}

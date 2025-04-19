
import { saveAs } from 'file-saver';
import { ExportOptions } from './documentTypes';
import { validateDocument } from './documentAnalysis';
import { initPdfWorker, validatePdfWorker } from './pdfWorker';
import { htmlToPdf } from './exporters/pdfExporter';
import { htmlToDocx } from './exporters/wordExporter';
import { htmlToStandaloneHtml } from './exporters/htmlExporter';

// Initialize PDF.js worker
initPdfWorker();

export async function exportDocument(content: string, options: ExportOptions, title: string = "Document"): Promise<void> {
  try {
    // Validate document before export
    const validation = validateDocument(title, content);
    if (!validation.isValid) {
      throw new Error(`Cannot export document: ${validation.errors.join(', ')}`);
    }

    let blob: Blob;
    let filename: string;
    
    // Format the title for the filename
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    switch (options.format) {
      case 'pdf':
        // Verify PDF worker is properly initialized before PDF export
        const isWorkerValid = await validatePdfWorker();
        if (!isWorkerValid) {
          throw new Error('PDF.js worker failed to initialize properly. PDF export is unavailable.');
        }
        
        blob = await htmlToPdf(content, options, title);
        filename = `${safeTitle}.pdf`;
        break;
        
      case 'word':
        blob = await htmlToDocx(content, options, title);
        filename = `${safeTitle}.docx`;
        break;
        
      case 'html':
        blob = htmlToStandaloneHtml(content, options, title);
        filename = `${safeTitle}.html`;
        break;
        
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
    
    saveAs(blob, filename);
    console.log(`Exporting document as ${options.format}`, { content, options, title });
  } catch (error) {
    console.error('Error exporting document:', error);
    throw error;
  }
}

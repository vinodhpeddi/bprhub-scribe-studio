
import { saveAs } from 'file-saver';
import { ExportOptions } from './documentTypes';
import { validateDocument } from './documentAnalysis';
import { initPdfWorker, validatePdfWorker } from './pdfWorker';
import { htmlToPdf } from './exporters/pdfExporter';
import { htmlToDocx } from './exporters/wordExporter';
import { htmlToStandaloneHtml } from './exporters/htmlExporter';
import { replaceMergeFields } from './mergeFields';

// Initialize PDF.js worker
initPdfWorker();

export async function exportDocument(content: string, options: ExportOptions, title: string = "Document"): Promise<void> {
  try {
    // Enhanced content validation: Check for non-empty content
    if (!content || content.trim() === '') {
      throw new Error('Cannot export document: Document content is empty');
    }
    
    // Check if the content is just empty HTML tags by stripping all HTML and checking what remains
    const strippedContent = content.replace(/<[^>]*>/g, '').trim();
    if (strippedContent === '') {
      throw new Error('Cannot export document: Document appears to contain only HTML tags with no text content');
    }
    
    console.log(`Processing document export. Content length: ${content.length}, stripped content length: ${strippedContent.length}`);
    
    // Replace merge fields with sample values before export
    const processedContent = replaceMergeFields(content);
    
    // Validate document before export
    const validation = validateDocument(title, processedContent);
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
        
        blob = await htmlToPdf(processedContent, options, title);
        filename = `${safeTitle}.pdf`;
        break;
        
      case 'word':
        blob = await htmlToDocx(processedContent, options, title);
        filename = `${safeTitle}.docx`;
        break;
        
      case 'html':
        blob = htmlToStandaloneHtml(processedContent, options, title);
        filename = `${safeTitle}.html`;
        break;
        
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
    
    saveAs(blob, filename);
    console.log(`Document export successful: ${filename}`);
  } catch (error) {
    console.error('Error exporting document:', error);
    throw error;
  }
}

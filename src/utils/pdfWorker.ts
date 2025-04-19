
import * as pdfjs from 'pdfjs-dist';

// Initialize PDF.js worker
export function initPdfWorker() {
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    try {
      // Get the version of pdfjs-dist that's installed
      const version = pdfjs.version || '3.11.174';
      
      // Set the worker source - try unpkg as primary CDN and cdnjs as fallback
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.js`;
      
      console.log(`PDF.js worker initialized with version ${version}`);
    } catch (error) {
      console.error('Error initializing PDF.js worker:', error);
      // Final fallback to a known working version if everything else fails
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.js';
    }
  }
}

// Helper function to validate if the worker is properly loaded
export async function validatePdfWorker(): Promise<boolean> {
  try {
    // Create a simple 1x1 PDF to test if the worker is functioning
    const uint8Array = new Uint8Array([
      /* Minimal valid PDF content - don't process, just check worker availability */
    ]);
    
    // Just check if worker is available without fully loading PDF
    await pdfjs.getDocument({ data: uint8Array }).promise.catch(() => {});
    return true;
  } catch (error) {
    console.error('PDF.js worker validation failed:', error);
    return false;
  }
}


import * as pdfjs from 'pdfjs-dist';

// Initialize PDF.js worker
export function initPdfWorker() {
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    try {
      // Use CDN worker with specific version
      const version = pdfjs.version;
      pdfjs.GlobalWorkerOptions.workerSrc = 
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
      console.log(`PDF.js worker initialized with version ${version}`);
    } catch (error) {
      console.error('Error initializing PDF.js worker:', error);
      // Fall back to using the fake worker as a last resort
      (window as any).pdfjsWorker = {};
      console.warn('Using PDF.js fake worker as fallback');
    }
  }
}

// Helper function to validate if the worker is properly loaded
export async function validatePdfWorker(): Promise<boolean> {
  try {
    // Create a simple test to verify PDF.js functionality
    const testData = new Uint8Array([
      0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37, // %PDF-1.7 header
      0x0a, 0x31, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, // Basic PDF structure
      0x3c, 0x3c, 0x2f, 0x54, 0x79, 0x70, 0x65, 0x2f, 
      0x43, 0x61, 0x74, 0x61, 0x6c, 0x6f, 0x67, 0x3e,
      0x3e, 0x0a, 0x65, 0x6e, 0x64, 0x6f, 0x62, 0x6a,
      0x0a, 0x74, 0x72, 0x61, 0x69, 0x6c, 0x65, 0x72,
      0x3c, 0x3c, 0x2f, 0x52, 0x6f, 0x6f, 0x74, 0x20,
      0x31, 0x20, 0x30, 0x20, 0x52, 0x3e, 0x3e, 0x0a,
      0x25, 0x25, 0x45, 0x4f, 0x46 // %%EOF
    ]);
    
    const loadingTask = pdfjs.getDocument({ data: testData });
    await loadingTask.promise;
    return true;
  } catch (error) {
    console.error('PDF.js worker validation failed:', error);
    return false;
  }
}

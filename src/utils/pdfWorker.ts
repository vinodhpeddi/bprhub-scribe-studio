
import * as pdfjs from 'pdfjs-dist';

// Initialize PDF.js worker
export function initPdfWorker() {
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    // Use local worker from node_modules
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.js',
      import.meta.url
    ).toString();
  }
}

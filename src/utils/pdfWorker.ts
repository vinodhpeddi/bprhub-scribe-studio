
import * as pdfjs from 'pdfjs-dist';

// Initialize PDF.js worker
export function initPdfWorker() {
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    // Use CDN worker instead of local module
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
}

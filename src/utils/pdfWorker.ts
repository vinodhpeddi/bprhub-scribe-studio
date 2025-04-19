
import * as pdfjs from 'pdfjs-dist';

// Initialize PDF.js worker
export function initPdfWorker() {
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    // Get the version of pdfjs-dist that's installed
    const version = pdfjs.version || '3.11.174';
    // Use CDN worker with matching version
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
  }
}

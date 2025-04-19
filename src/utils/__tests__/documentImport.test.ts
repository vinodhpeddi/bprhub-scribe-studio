
import { testDocumentImport } from '../documentImport';
import { initPdfWorker, validatePdfWorker } from '../pdfWorker';

// This is a basic test suite that can be expanded with more comprehensive tests
// In a real application, you would use a testing framework like Jest

export async function runDocumentImportTests() {
  console.log('Running document import tests...');
  
  // Test PDF worker initialization
  console.log('1. Testing PDF.js worker initialization...');
  try {
    initPdfWorker();
    const workerValid = await validatePdfWorker();
    console.log(`PDF worker initialization: ${workerValid ? 'PASSED ✓' : 'FAILED ✗'}`);
  } catch (error) {
    console.error('PDF worker test failed:', error);
    console.log('PDF worker initialization: FAILED ✗');
  }
  
  // Test text file import
  console.log('2. Testing text file import...');
  try {
    const textImportResult = await testDocumentImport('text/plain');
    console.log(`Text import: ${textImportResult ? 'PASSED ✓' : 'FAILED ✗'}`);
  } catch (error) {
    console.error('Text import test failed:', error);
    console.log('Text import: FAILED ✗');
  }
  
  // Test HTML file import
  console.log('3. Testing HTML file import...');
  try {
    const htmlImportResult = await testDocumentImport('text/html');
    console.log(`HTML import: ${htmlImportResult ? 'PASSED ✓' : 'FAILED ✗'}`);
  } catch (error) {
    console.error('HTML import test failed:', error);
    console.log('HTML import: FAILED ✗');
  }
  
  console.log('Document import tests completed.');
}

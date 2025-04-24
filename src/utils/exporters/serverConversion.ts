
import { ExportOptions } from '../documentTypes';

export async function convertHtmlToDocx(htmlContent: string): Promise<Blob> {
  // Here you would implement the actual server call to convert HTML to DOCX
  // You could use services like CloudConvert, Pandoc, or other conversion tools
  
  // For now, we'll throw an error to trigger the fallback
  throw new Error('Server conversion not implemented yet');
}

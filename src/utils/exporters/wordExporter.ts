
import { ExportOptions } from '../documentTypes';
import { htmlToDocxConverter } from './htmlToDocxConverter';

/**
 * Proxy function to maintain existing API surface.
 */
export async function htmlToDocx(content: string, options: ExportOptions, title: string): Promise<Blob> {
  // Simply delegate to the new converter for maintainability.
  return await htmlToDocxConverter(content, options, title);
}

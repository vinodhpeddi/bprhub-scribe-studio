
import { ExportOptions } from '../documentTypes';
import { generateTableOfContents } from '../documentAnalysis';

export function htmlToStandaloneHtml(content: string, options: ExportOptions, title: string): Blob {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { font-size: 24px; }
        h2 { font-size: 20px; }
        table { border-collapse: collapse; width: 100%; }
        table, th, td { border: 1px solid #ddd; }
        th, td { padding: 8px; text-align: left; }
        ${options.addWatermark ? `
        body::before {
          content: 'DRAFT - DO NOT USE';
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: -1;
          color: rgba(200, 0, 0, 0.1);
          font-size: 80px;
          font-weight: bold;
          display: flex;
          justify-content: center;
          align-items: center;
          transform: rotate(-45deg);
        }` : ''}
      </style>
    </head>
    <body>
      ${options.includeToc ? generateTableOfContents(content) : ''}
      ${content}
    </body>
    </html>
  `;
  
  return new Blob([htmlContent], { type: 'text/html' });
}

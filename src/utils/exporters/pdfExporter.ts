
import * as pdfLib from 'pdf-lib';
import { initPdfWorker } from '../pdfWorker';
import { generateTableOfContents } from '../documentAnalysis';
import { ExportOptions } from '../documentTypes';

// Initialize PDF.js worker
initPdfWorker();

export async function htmlToPdf(content: string, options: ExportOptions, title: string): Promise<Blob> {
  const pdfDoc = await pdfLib.PDFDocument.create();
  const page = pdfDoc.addPage(options.paperSize === 'a4' 
    ? [595.28, 841.89] // A4 dimensions in points
    : options.paperSize === 'letter' 
      ? [612, 792] // Letter dimensions in points
      : [612, 1008] // Legal dimensions in points
  );
  
  const { width, height } = page.getSize();
  const fontSize = 12;
  const lineHeight = fontSize * 1.2;
  const margin = 50;
  
  // Add title
  page.drawText(title, {
    x: margin,
    y: height - margin,
    size: fontSize * 2,
  });
  
  // Add watermark if requested
  if (options.addWatermark) {
    const watermarkText = 'DRAFT - DO NOT USE';
    const watermarkFont = fontSize * 3;
    
    page.drawText(watermarkText, {
      x: width / 2 - 150,
      y: height / 2,
      size: watermarkFont,
      color: pdfLib.rgb(0.9, 0.9, 0.9),
      rotate: pdfLib.degrees(-45),
    });
  }
  
  // Parse HTML content
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  
  // Add TOC if requested
  let yPosition = height - margin - lineHeight * 3;
  
  if (options.includeToc) {
    const tocContent = generateTableOfContents(content);
    const tocDoc = parser.parseFromString(tocContent, 'text/html');
    
    page.drawText("Table of Contents", {
      x: margin,
      y: yPosition,
      size: fontSize * 1.5,
    });
    
    yPosition -= lineHeight * 2;
    
    const tocEntries = tocDoc.querySelectorAll('p');
    tocEntries.forEach(entry => {
      const text = entry.textContent || '';
      const indent = entry.style.marginLeft ? parseInt(entry.style.marginLeft) / 20 : 0;
      
      page.drawText(text, {
        x: margin + (indent * 20),
        y: yPosition,
        size: fontSize,
      });
      
      yPosition -= lineHeight;
      
      if (yPosition < margin) {
        const newPage = pdfDoc.addPage([width, height]);
        yPosition = height - margin;
      }
    });
    
    yPosition -= lineHeight;
  }
  
  // Process HTML content
  const elements = Array.from(doc.body.children);
  
  for (const element of elements) {
    if (element.tagName.toLowerCase().startsWith('h')) {
      const level = parseInt(element.tagName.substring(1));
      const headingSize = fontSize * (2.5 - (level * 0.3));
      
      if (yPosition < margin) {
        const newPage = pdfDoc.addPage([width, height]);
        yPosition = height - margin;
      }
      
      page.drawText(element.textContent || '', {
        x: margin,
        y: yPosition,
        size: headingSize,
      });
      
      yPosition -= lineHeight * 2;
    } else if (element.tagName.toLowerCase() === 'p') {
      const text = element.textContent || '';
      const maxCharsPerLine = Math.floor((width - margin * 2) / (fontSize * 0.6));
      
      for (let i = 0; i < text.length; i += maxCharsPerLine) {
        if (yPosition < margin) {
          const newPage = pdfDoc.addPage([width, height]);
          yPosition = height - margin;
        }
        
        const lineText = text.substring(i, i + maxCharsPerLine);
        
        page.drawText(lineText, {
          x: margin,
          y: yPosition,
          size: fontSize,
        });
        
        yPosition -= lineHeight;
      }
      
      yPosition -= lineHeight;
    }
  }
  
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

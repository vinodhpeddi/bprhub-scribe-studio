
import { TextRun, UnderlineType } from 'docx';

export const processTextFormat = (element: HTMLElement): TextRun | null => {
  if (!element.textContent?.trim()) return null;

  // Extract styling properties
  const isBold = element.tagName === 'STRONG' || element.tagName === 'B' || 
                 element.style.fontWeight === 'bold' || element.style.fontWeight === '700';
  const isItalic = element.tagName === 'EM' || element.tagName === 'I' || 
                   element.style.fontStyle === 'italic';
  const isUnderline = element.tagName === 'U' || 
                      element.style.textDecoration?.includes('underline');
  
  // Handle text color with improved RGB conversion
  let color;
  if (element.style.color) {
    if (element.style.color.startsWith('rgb')) {
      const rgb = element.style.color.match(/\d+/g);
      if (rgb && rgb.length >= 3) {
        color = '#' + [0, 1, 2].map(i => {
          const hex = parseInt(rgb[i], 10).toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        }).join('');
      }
    } else {
      color = element.style.color;
    }
  }

  // Handle highlight/background color
  let highlight;
  if (element.style.backgroundColor) {
    // Note: docx has limited highlight colors, so this is approximate
    highlight = element.style.backgroundColor;
  }

  // Handle font size
  let size;
  if (element.style.fontSize) {
    // Convert from px to half-points (Word uses half-points)
    const match = element.style.fontSize.match(/(\d+)px/);
    if (match && match[1]) {
      size = parseInt(match[1], 10) * 2; // Multiply by 2 to convert to half-points
    }
  }

  // Create TextRun with extracted styles
  return new TextRun({
    text: element.textContent || '',
    bold: isBold,
    italics: isItalic,
    underline: isUnderline ? { type: UnderlineType.SINGLE } : undefined,
    color: color,
    highlight: highlight,
    size: size,
  });
};

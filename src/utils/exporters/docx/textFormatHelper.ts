
import { TextRun, UnderlineType } from 'docx';

export const processTextFormat = (element: HTMLElement): TextRun | null => {
  if (!element.textContent?.trim()) return null;

  const isBold = element.tagName === 'STRONG' || element.tagName === 'B' || 
                 (element instanceof HTMLElement && element.style.fontWeight === 'bold');
  const isItalic = element.tagName === 'EM' || element.tagName === 'I' || 
                   (element instanceof HTMLElement && element.style.fontStyle === 'italic');
  const isUnderline = element.tagName === 'U' || 
                      (element instanceof HTMLElement && element.style.textDecoration === 'underline');
  
  let color;
  if (element instanceof HTMLElement && element.style.color) {
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

  return new TextRun({
    text: element.textContent || '',
    bold: isBold,
    italics: isItalic,
    underline: isUnderline ? { type: UnderlineType.SINGLE } : undefined,
    color: color,
  });
};

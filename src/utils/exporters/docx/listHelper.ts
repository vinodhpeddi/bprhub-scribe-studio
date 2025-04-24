
import { Paragraph } from 'docx';

export const processList = (element: HTMLElement, sections: any[]) => {
  const items = element.querySelectorAll('li');
  const isOrdered = element.tagName.toLowerCase() === 'ol';
  
  items.forEach((item, i) => {
    const prefix = isOrdered ? `${i+1}. ` : '• ';
    sections.push(new Paragraph({
      text: prefix + (item.textContent || ''),
      indent: { left: 240 },
    }));
  });
};

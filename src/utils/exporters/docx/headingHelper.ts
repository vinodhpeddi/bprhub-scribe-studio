
import { Paragraph, HeadingLevel } from 'docx';

export const processHeading = (element: HTMLElement, sections: any[]) => {
  const level = parseInt(element.tagName.substring(1));
  let headingLevel;
  
  switch(level) {
    case 1: headingLevel = HeadingLevel.HEADING_1; break;
    case 2: headingLevel = HeadingLevel.HEADING_2; break;
    case 3: headingLevel = HeadingLevel.HEADING_3; break;
    default: headingLevel = HeadingLevel.HEADING_4;
  }
  
  sections.push(new Paragraph({
    text: element.textContent || '',
    heading: headingLevel,
  }));
};

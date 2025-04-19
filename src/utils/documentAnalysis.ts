
export function parseDocumentOutline(content: string): { id: string; level: number; text: string }[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  return Array.from(headings).map((heading, index) => {
    const level = parseInt(heading.tagName.substring(1));
    return {
      id: `heading-${index}`,
      level,
      text: heading.textContent || ''
    };
  });
}

export function countElements(content: string): { 
  paragraphs: number; 
  tables: number; 
  lists: number;
  images: number;
  words: number;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  
  const paragraphs = doc.querySelectorAll('p').length;
  const tables = doc.querySelectorAll('table').length;
  const lists = doc.querySelectorAll('ul, ol').length;
  const images = doc.querySelectorAll('img').length;
  
  // Count words in all text nodes
  const text = doc.body.textContent || '';
  const words = text.split(/\s+/).filter(word => word.length > 0).length;
  
  return {
    paragraphs,
    tables,
    lists,
    images,
    words
  };
}

export function generateTableOfContents(content: string): string {
  const outline = parseDocumentOutline(content);
  let tocHtml = '<h2>Table of Contents</h2>';
  
  outline.forEach(heading => {
    const indent = (heading.level - 1) * 20;
    tocHtml += `<p style="margin-left: ${indent}px;"><a href="#${heading.id}">${heading.text}</a></p>`;
  });
  
  return tocHtml;
}

export function validateDocument(title: string, content: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate title
  if (!title || title.trim() === '') {
    errors.push('Document title cannot be empty');
  }
  
  // Validate content
  if (!content || content.trim() === '') {
    errors.push('Document content cannot be empty');
  }
  
  // Check if content has at least one heading
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  if (headings.length === 0) {
    errors.push('Document should have at least one heading');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

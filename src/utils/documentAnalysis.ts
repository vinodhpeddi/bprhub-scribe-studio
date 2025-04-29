
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
  
  // Enhanced content validation
  if (!content || content.trim() === '') {
    errors.push('Document content cannot be empty');
  } else {
    // Check if there's actual text content, not just HTML tags
    const strippedContent = content.replace(/<[^>]*>/g, '').trim();
    if (strippedContent === '') {
      errors.push('Document contains no visible text content');
    }
    
    if (strippedContent.length < 10) {
      console.warn('Document content is very short, might be insufficient for export', {
        contentLength: content.length,
        strippedContent: strippedContent
      });
    }
    
    // Parse with DOM parser to check if content is valid HTML
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      
      // Check if parsing resulted in errors
      const parseErrors = doc.getElementsByTagName('parsererror');
      if (parseErrors.length > 0) {
        errors.push('Document contains invalid HTML');
      }
    } catch (e) {
      errors.push('Failed to parse document content');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

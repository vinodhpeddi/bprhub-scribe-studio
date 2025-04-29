import { RefObject } from 'react';

interface UsePasteHandlerProps {
  editorRef: RefObject<HTMLDivElement>;
  onChange: (content: string) => void;
  setContent: (content: string) => void;
}

// List of allowed tags for pasting
const ALLOWED_TAGS = [
  'p', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 
  'table', 'tr', 'td', 'th', 'thead', 'tbody', 'img',
  'a', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code',
  'pre', 'blockquote', 'hr'
];

// List of allowed attributes for specific tags
const ALLOWED_ATTRS: Record<string, string[]> = {
  'a': ['href', 'title', 'target', 'class'],
  'img': ['src', 'alt', 'title', 'width', 'height', 'class'],
  'table': ['class'],
  'td': ['rowspan', 'colspan', 'class'],
  'th': ['rowspan', 'colspan', 'class']
};

// Tags that should always have a class added
const SEMANTIC_CLASSES: Record<string, string> = {
  'strong': 'text-bold',
  'em': 'text-italic',
  'u': 'text-underline',
  's': 'text-strike',
  'a': 'text-link',
  'ul': 'bullet-list',
  'ol': 'ordered-list',
  'li': 'list-item',
  'table': 'data-table table',
  'tr': 'table-row',
  'td': 'table-cell',
  'th': 'table-cell',
  'code': 'text-code',
  'pre': 'code-block',
  'blockquote': 'editor-blockquote'
};

export const usePasteHandler = ({ editorRef, onChange, setContent }: UsePasteHandlerProps) => {
  const cleanHtml = (html: string): string => {
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = html;
    
    // Function to process a node recursively
    const processNode = (node: Node): void => {
      // Handle element nodes
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        
        // Check if this tag is allowed
        if (!ALLOWED_TAGS.includes(tagName)) {
          // Replace disallowed tag with its contents
          const fragment = document.createDocumentFragment();
          while (element.firstChild) {
            // Process children before moving them
            processNode(element.firstChild);
            fragment.appendChild(element.firstChild);
          }
          element.parentNode?.replaceChild(fragment, element);
          return;
        }
        
        // Clean attributes - remove all except those explicitly allowed
        Array.from(element.attributes).forEach(attr => {
          const attrName = attr.name.toLowerCase();
          
          // Special handling for class attribute - keep only semantic classes
          if (attrName === 'class') {
            // Add semantic class if one is defined for this tag
            if (SEMANTIC_CLASSES[tagName]) {
              element.classList.add(SEMANTIC_CLASSES[tagName]);
            }
            
            // Keep only specific class patterns, remove all others
            Array.from(element.classList).forEach(className => {
              // Only keep classes with our semantic prefixes
              if (!className.startsWith('text-') && 
                  !className.startsWith('editor-') && 
                  !className.startsWith('table') && 
                  !className.startsWith('list-') && 
                  !className.startsWith('code-') &&
                  !className.startsWith('box-')) {
                element.classList.remove(className);
              }
            });
            return;
          }
          
          // For style attribute, only keep specific styles for tables
          if (attrName === 'style') {
            if (tagName === 'table') {
              element.setAttribute('style', 'border-collapse: collapse; width: 100%;');
            } else if (tagName === 'td' || tagName === 'th') {
              element.setAttribute('style', 'border: 1px solid #ddd; padding: 8px;');
            } else {
              element.removeAttribute('style');
            }
            return;
          }
          
          // Check if this attribute is allowed for this tag
          const allowedAttrsForTag = ALLOWED_ATTRS[tagName] || [];
          if (!allowedAttrsForTag.includes(attrName)) {
            element.removeAttribute(attrName);
          }
        });
        
        // Add semantic class if not already present
        if (SEMANTIC_CLASSES[tagName] && !element.classList.contains(SEMANTIC_CLASSES[tagName])) {
          element.classList.add(SEMANTIC_CLASSES[tagName]);
        }
        
        // Process all child nodes
        Array.from(node.childNodes).forEach(processNode);
      }
    };
    
    // Start processing from root
    processNode(tempContainer);
    
    return tempContainer.innerHTML;
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    // Handle image paste
    if (e.clipboardData.items) {
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        if (e.clipboardData.items[i].type.indexOf("image") !== -1) {
          const file = e.clipboardData.items[i].getAsFile();
          if (file) {
            try {
              const reader = new FileReader();
              reader.onload = (e) => {
                if (e.target?.result && editorRef.current) {
                  const imgHtml = `<img src="${e.target.result}" alt="Pasted image" class="editor-image" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
                  document.execCommand('insertHTML', false, imgHtml);
                  onChange(editorRef.current.innerHTML);
                }
              };
              reader.readAsDataURL(file);
              return;
            } catch (error) {
              console.error('Failed to handle image paste:', error);
            }
          }
        }
      }
    }
    
    // Handle HTML content with cleaned formatting
    if (e.clipboardData.types.includes('text/html')) {
      const html = e.clipboardData.getData('text/html');
      const cleanedHtml = cleanHtml(html);
      document.execCommand('insertHTML', false, cleanedHtml);
    } else if (e.clipboardData.types.includes('text/rtf')) {
      const plainText = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, plainText);
    } else if (e.clipboardData.types.includes('text/plain')) {
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    }
    
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      onChange(newContent);
    }
  };
  
  return { handlePaste };
};

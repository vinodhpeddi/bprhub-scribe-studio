import { RefObject } from 'react';

interface UsePasteHandlerProps {
  editorRef: RefObject<HTMLDivElement>;
  onChange: (content: string) => void;
  setContent: (content: string) => void;
}

export const usePasteHandler = ({ editorRef, onChange, setContent }: UsePasteHandlerProps) => {
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
                  const imgHtml = `<img src="${e.target.result}" alt="Pasted image" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
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
    
    // Handle HTML content with preserved formatting
    if (e.clipboardData.types.includes('text/html')) {
      const html = e.clipboardData.getData('text/html');
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Clean up unwanted elements but preserve formatting
      const elementsToRemove = tempDiv.querySelectorAll('script, style, meta, link');
      elementsToRemove.forEach(el => el.remove());
      
      // Process all elements to ensure proper attributes
      const elements = tempDiv.getElementsByTagName('*');
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i] as HTMLElement;
        
        // Remove unwanted attributes but keep styling
        Array.from(element.attributes).forEach(attr => {
          if (attr.name.startsWith('xmlns:') || 
              attr.name.includes('mso-') || 
              attr.name.startsWith('o:') ||
              attr.name.startsWith('v:')) {
            element.removeAttribute(attr.name);
          }
        });

        // Keep specific styles for tables
        if (element.tagName === 'TABLE') {
          element.setAttribute('style', 'border-collapse: collapse; width: 100%; margin: 10px 0;');
        }
        if (element.tagName === 'TD' || element.tagName === 'TH') {
          element.setAttribute('style', 'border: 1px solid #ddd; padding: 8px;');
        }
      }
      
      document.execCommand('insertHTML', false, tempDiv.innerHTML);
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

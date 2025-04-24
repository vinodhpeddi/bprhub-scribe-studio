
import { RefObject } from 'react';

interface UsePasteHandlerProps {
  editorRef: RefObject<HTMLDivElement>;
  onChange: (content: string) => void;
  setContent: (content: string) => void;
}

export const usePasteHandler = ({ editorRef, onChange, setContent }: UsePasteHandlerProps) => {
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    let pastedContent = '';
    
    if (e.clipboardData.types.includes('text/html')) {
      pastedContent = e.clipboardData.getData('text/html');
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = pastedContent;
      
      const elementsToRemove = tempDiv.querySelectorAll('script, style, meta, link');
      elementsToRemove.forEach(el => el.remove());
      
      const elements = tempDiv.getElementsByTagName('*');
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        Array.from(element.attributes).forEach(attr => {
          if (attr.name.startsWith('xmlns:') || 
              attr.name.includes('mso-') || 
              attr.name.startsWith('o:') ||
              attr.name.startsWith('v:')) {
            element.removeAttribute(attr.name);
          }
        });
        
        if ((element.tagName === 'SPAN' || element.tagName === 'DIV') && 
            !element.attributes.length && 
            !element.textContent?.trim()) {
          element.remove();
        }
      }
      
      document.execCommand('insertHTML', false, tempDiv.innerHTML);
    } else if (e.clipboardData.types.includes('text/rtf')) {
      const plainText = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, plainText);
    } else if (e.clipboardData.types.includes('text/plain')) {
      pastedContent = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, pastedContent);
    }
    
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      onChange(newContent);
    }
  };

  return { handlePaste };
};

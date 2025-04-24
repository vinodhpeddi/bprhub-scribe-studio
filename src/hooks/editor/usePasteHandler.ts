
import { RefObject } from 'react';

interface UsePasteHandlerProps {
  editorRef: RefObject<HTMLDivElement>;
  onChange: (content: string) => void;
  setContent: (content: string) => void;
}

export const usePasteHandler = ({ editorRef, onChange, setContent }: UsePasteHandlerProps) => {
  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    let pastedContent = '';
    
    // Handle image paste
    if (e.clipboardData.items) {
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        if (e.clipboardData.items[i].type.indexOf("image") !== -1) {
          const file = e.clipboardData.items[i].getAsFile();
          if (file) {
            try {
              const imgUrl = await handleImageUpload(file);
              document.execCommand('insertHTML', false, `<img src="${imgUrl}" alt="Pasted image" style="max-width: 100%;" />`);
              return;
            } catch (error) {
              console.error('Failed to handle image paste:', error);
            }
          }
        }
      }
    }
    
    // Handle HTML content
    if (e.clipboardData.types.includes('text/html')) {
      pastedContent = e.clipboardData.getData('text/html');
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = pastedContent;
      
      const elementsToRemove = tempDiv.querySelectorAll('script, style, meta, link');
      elementsToRemove.forEach(el => el.remove());
      
      const elements = tempDiv.getElementsByTagName('*');
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i] as HTMLElement;
        
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
            !element.textContent?.trim() &&
            !element.style.fontWeight && 
            !element.style.fontStyle && 
            !element.style.textDecoration &&
            !element.style.color) {
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

// Helper function to handle image upload
const handleImageUpload = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read image file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
};

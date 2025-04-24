
import { RefObject } from 'react';

interface UseImageHandlerProps {
  editorRef: RefObject<HTMLDivElement>;
  onChange: (content: string) => void;
}

export const useImageHandler = ({ editorRef, onChange }: UseImageHandlerProps) => {
  const handleImageUpload = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && editorRef.current) {
          const imgHtml = `<img src="${e.target.result}" alt="Uploaded image" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
          document.execCommand('insertHTML', false, imgHtml);
          onChange(editorRef.current.innerHTML);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleImageFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    };
    input.click();
  };

  return { handleImageUpload, handleImageFileSelect };
};


import { RefObject } from 'react';

interface UseImageHandlerProps {
  editorRef: RefObject<HTMLDivElement>;
  onChange: (content: string) => void;
}

export const useImageHandler = ({ editorRef, onChange }: UseImageHandlerProps) => {
  // Process image file and insert it into the editor
  const handleImageUpload = async (file: File) => {
    try {
      // Create a unique ID for the image
      const imageId = `img-${Date.now()}`;
      
      // Read the image file
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && editorRef.current) {
          // Create the image HTML with responsive styling
          const imgHtml = `
            <img 
              id="${imageId}" 
              src="${e.target.result}" 
              alt="Uploaded image" 
              style="max-width: 100%; height: auto; margin: 10px 0;" 
              data-filename="${file.name}"
            />
          `;
          
          // Insert the image into the editor
          document.execCommand('insertHTML', false, imgHtml);
          
          // Update content
          onChange(editorRef.current.innerHTML);
          
          // Add click handler for image selection
          setTimeout(() => {
            const imgElement = document.getElementById(imageId);
            if (imgElement) {
              imgElement.addEventListener('click', () => {
                // Here you could implement image selection/editing functionality
                console.log('Image selected:', imgElement);
              });
            }
          }, 0);
        }
      };
      
      // Start reading the file
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Open file selection dialog
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

  // Handle image drag-and-drop
  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleImageUpload(file);
      }
    }
  };

  // Setup drag-and-drop handlers
  const setupDragAndDrop = () => {
    if (editorRef.current) {
      const editor = editorRef.current;
      
      const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
      };
      
      // Add event listeners
      editor.addEventListener('dragover', handleDragOver);
      editor.addEventListener('drop', handleImageDrop as unknown as EventListener);
      
      // Return cleanup function
      return () => {
        editor.removeEventListener('dragover', handleDragOver);
        editor.removeEventListener('drop', handleImageDrop as unknown as EventListener);
      };
    }
    
    return () => {};
  };

  return { 
    handleImageUpload, 
    handleImageFileSelect, 
    handleImageDrop,
    setupDragAndDrop 
  };
};

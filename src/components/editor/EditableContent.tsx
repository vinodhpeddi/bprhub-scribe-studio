
import React, { useEffect, memo } from 'react';
import { usePasteHandler } from '@/hooks/editor/usePasteHandler';
import { useEditorSelection } from '@/hooks/editor/useEditorSelection';

interface EditableContentProps {
  editorRef: React.RefObject<HTMLDivElement>;
  onInput: () => void;
  onKeyUp: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onMouseUp: () => void;
  onClick: (e: React.MouseEvent) => void;
  initialContent: string;
  isInitialized: boolean;
  setIsInitialized: (value: boolean) => void;
  onChange: (content: string) => void;
  setContent: (content: string) => void;
}

const EditableContent: React.FC<EditableContentProps> = ({
  editorRef,
  onInput,
  onKeyUp,
  onKeyDown,
  onMouseUp,
  onClick,
  initialContent,
  isInitialized,
  setIsInitialized,
  onChange,
  setContent
}) => {
  const { handlePaste } = usePasteHandler({ editorRef, onChange, setContent });
  const { saveSelection, restoreSelection } = useEditorSelection();

  useEffect(() => {
    if (!isInitialized && editorRef.current) {
      editorRef.current.innerHTML = initialContent;
      setIsInitialized(true);
    }
  }, [initialContent, isInitialized, setIsInitialized, editorRef]);

  // Handle user input with better cursor position retention
  const handleUserInput = (e: React.FormEvent) => {
    // First save the current position
    saveSelection();
    // Then call the parent's input handler
    onInput();
  };

  useEffect(() => {
    if (!editorRef.current) return;
    
    const element = editorRef.current;
    
    const handleNativeClick = () => {
      saveSelection();
    };
    
    element.addEventListener('mousedown', handleNativeClick);
    
    // Use a more careful approach with the mutation observer
    const observer = new MutationObserver((mutations) => {
      if (document.activeElement === element) {
        // Check if content actually changed
        const hasContentChange = mutations.some(mutation => 
          mutation.type === 'characterData' || mutation.type === 'childList');
        
        if (hasContentChange) {
          // Don't restore selection after character data changes
          // as this would move the cursor back to its previous position
          if (!mutations.some(m => m.type === 'characterData')) {
            restoreSelection();
          }
        }
      }
    });
    
    observer.observe(element, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    return () => {
      element.removeEventListener('mousedown', handleNativeClick);
      observer.disconnect();
    };
  }, [saveSelection, restoreSelection, editorRef]);

  return (
    <div
      ref={editorRef}
      className="editor-content min-h-[400px] border border-gray-200 rounded-md p-4 overflow-auto"
      contentEditable={true}
      suppressContentEditableWarning={true}
      onInput={handleUserInput}
      onPaste={handlePaste}
      onKeyUp={onKeyUp}
      onKeyDown={onKeyDown}
      onMouseUp={onMouseUp}
      onClick={onClick}
      spellCheck={true}
      style={{
        fontSize: '14px',
        lineHeight: '1.6',
        fontFamily: 'Arial, sans-serif',
        minHeight: '50vh'
      }}
    />
  );
};

export default memo(EditableContent);

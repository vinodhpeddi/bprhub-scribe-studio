
import React, { useEffect, useRef } from 'react';

interface EditorContentProps {
  editorRef: React.RefObject<HTMLDivElement>;
  onInput: () => void;
  onPaste: (e: React.ClipboardEvent) => void;
  onKeyUp: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onMouseUp: () => void;
  onClick: (e: React.MouseEvent) => void;
}

const EditorContent: React.FC<EditorContentProps> = ({
  editorRef,
  onInput,
  onPaste,
  onKeyUp,
  onKeyDown,
  onMouseUp,
  onClick,
}) => {
  // Create a reference to track if we've set the content editable focus behavior
  const hasSetupFocus = useRef<boolean>(false);

  useEffect(() => {
    if (!editorRef.current || hasSetupFocus.current) return;
    
    // Fix cursor position issue by adding a click listener directly to the DOM element
    const element = editorRef.current;
    const handleNativeClick = (e: MouseEvent) => {
      // Prevent default only if needed to intercept native behavior
      if (document.getSelection()?.isCollapsed) {
        // This ensures that clicking in the editor works properly for cursor positioning
        const range = document.caretRangeFromPoint(e.clientX, e.clientY);
        if (range) {
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }
    };
    
    element.addEventListener('click', handleNativeClick);
    hasSetupFocus.current = true;
    
    // Clean up the event listener on unmount
    return () => {
      element.removeEventListener('click', handleNativeClick);
    };
  }, [editorRef]);

  return (
    <div
      ref={editorRef}
      className="editor-content min-h-[400px] border border-gray-200 rounded-md p-4 overflow-auto"
      contentEditable={true}
      suppressContentEditableWarning={true}
      onInput={onInput}
      onPaste={onPaste}
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

export default EditorContent;

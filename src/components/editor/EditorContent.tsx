
import React, { useEffect, useRef, memo } from 'react';

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
  // Store the last selection state to restore it after re-renders
  const lastSelectionRef = useRef<{
    node: Node | null;
    offset: number;
    endNode?: Node | null;
    endOffset?: number;
  } | null>(null);

  // Save selection state before any potential re-renders
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      lastSelectionRef.current = {
        node: range.startContainer,
        offset: range.startOffset,
        endNode: range.endContainer,
        endOffset: range.endOffset
      };
    }
  };

  // Restore selection after re-renders
  const restoreSelection = () => {
    if (lastSelectionRef.current && editorRef.current) {
      const { node, offset, endNode, endOffset } = lastSelectionRef.current;
      try {
        if (node && editorRef.current.contains(node)) {
          const range = document.createRange();
          const selection = window.getSelection();
          
          range.setStart(node, offset);
          
          // If we have end position (for selections, not just cursor)
          if (endNode && endOffset !== undefined && editorRef.current.contains(endNode)) {
            range.setEnd(endNode, endOffset);
          } else {
            range.collapse(true);
          }
          
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      } catch (err) {
        console.error("Error restoring selection:", err);
      }
    }
  };

  useEffect(() => {
    if (!editorRef.current || hasSetupFocus.current) return;
    
    // Fix cursor position issue by adding a click listener directly to the DOM element
    const element = editorRef.current;
    
    const handleNativeClick = (e: MouseEvent) => {
      // Save the current selection immediately after click
      requestAnimationFrame(() => {
        saveSelection();
      });
    };
    
    element.addEventListener('mousedown', handleNativeClick);
    hasSetupFocus.current = true;
    
    // Create mutation observer to detect DOM changes and restore selection
    const observer = new MutationObserver(() => {
      if (document.activeElement === element) {
        restoreSelection();
      }
    });
    
    observer.observe(element, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    // Clean up the event listener and observer on unmount
    return () => {
      element.removeEventListener('mousedown', handleNativeClick);
      observer.disconnect();
    };
  }, [editorRef]);

  // Save selection with more events
  const handleBeforeInput = () => {
    saveSelection();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    saveSelection();
    onKeyDown(e);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Use requestAnimationFrame to let the browser update the selection first
    requestAnimationFrame(() => {
      saveSelection();
    });
    onClick(e);
  };

  const handleMouseUp = () => {
    saveSelection();
    onMouseUp();
  };

  return (
    <div
      ref={editorRef}
      className="editor-content min-h-[400px] border border-gray-200 rounded-md p-4 overflow-auto"
      contentEditable={true}
      suppressContentEditableWarning={true}
      onInput={onInput}
      onPaste={onPaste}
      onKeyUp={onKeyUp}
      onKeyDown={handleKeyDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onBeforeInput={handleBeforeInput}
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

// Wrap with memo to prevent unnecessary re-renders
export default memo(EditorContent);


import React, { useEffect, useRef, memo } from 'react';

interface EditorContentProps {
  editorRef: React.RefObject<HTMLDivElement>;
  onInput: () => void;
  onPaste: (e: React.ClipboardEvent) => void;
  onKeyUp: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onMouseUp: () => void;
  onClick: (e: React.MouseEvent) => void;
  initialContent: string;
  isInitialized: boolean;
  setIsInitialized: (value: boolean) => void;
}

const EditorContent: React.FC<EditorContentProps> = ({
  editorRef,
  onInput,
  onPaste,
  onKeyUp,
  onKeyDown,
  onMouseUp,
  onClick,
  initialContent,
  isInitialized,
  setIsInitialized
}) => {
  const lastSelectionRef = useRef<{
    node: Node | null;
    offset: number;
    endNode?: Node | null;
    endOffset?: number;
  } | null>(null);

  // Initialize content only once on mount
  useEffect(() => {
    if (!isInitialized && editorRef.current) {
      editorRef.current.innerHTML = initialContent;
      setIsInitialized(true);
    }
  }, [initialContent, isInitialized, setIsInitialized]);

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

  const restoreSelection = () => {
    if (lastSelectionRef.current && editorRef.current) {
      const { node, offset, endNode, endOffset } = lastSelectionRef.current;
      try {
        if (node && editorRef.current.contains(node)) {
          const range = document.createRange();
          const selection = window.getSelection();
          
          range.setStart(node, offset);
          
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
    if (!editorRef.current) return;
    
    const element = editorRef.current;
    
    const handleNativeClick = () => {
      requestAnimationFrame(saveSelection);
    };
    
    element.addEventListener('mousedown', handleNativeClick);
    
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
    
    return () => {
      element.removeEventListener('mousedown', handleNativeClick);
      observer.disconnect();
    };
  }, []);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    saveSelection();
    onInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    saveSelection();
    onKeyDown(e);
  };

  const handleClick = (e: React.MouseEvent) => {
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
      onInput={handleInput}
      onPaste={onPaste}
      onKeyUp={onKeyUp}
      onKeyDown={handleKeyDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
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

export default memo(EditorContent);

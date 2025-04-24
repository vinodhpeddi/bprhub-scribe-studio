
import { useCallback, useRef } from 'react';

export const useEditorSelection = () => {
  const lastSelectionRef = useRef<{
    node: Node | null;
    offset: number;
    endNode?: Node | null;
    endOffset?: number;
  } | null>(null);

  const saveSelection = useCallback(() => {
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
  }, []);

  const restoreSelection = useCallback(() => {
    if (lastSelectionRef.current) {
      const { node, offset, endNode, endOffset } = lastSelectionRef.current;
      try {
        if (node) {
          const range = document.createRange();
          const selection = window.getSelection();
          
          const safeOffset = Math.min(offset, node.nodeType === Node.TEXT_NODE ? 
            (node.textContent?.length || 0) : node.childNodes.length);
          
          range.setStart(node, safeOffset);
          
          if (endNode && endOffset !== undefined) {
            const safeEndOffset = Math.min(endOffset, endNode.nodeType === Node.TEXT_NODE ? 
              (endNode.textContent?.length || 0) : endNode.childNodes.length);
            
            range.setEnd(endNode, safeEndOffset);
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
  }, []);

  return { saveSelection, restoreSelection, lastSelectionRef };
};

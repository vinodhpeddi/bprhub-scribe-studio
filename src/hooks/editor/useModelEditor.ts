
import { useState, useRef, useEffect, useCallback } from 'react';
import * as DT from '@/utils/editor/model/documentTypes';
import { DocumentSync, EditorAction } from '@/utils/editor/model/documentSync';
import { htmlToModel } from '@/utils/editor/model/htmlToModel';
import { modelToHtml } from '@/utils/editor/model/modelToHtml';
import { v4 as uuidv4 } from 'uuid';

export interface ModelEditorState {
  model: DT.Doc;
  html: string;
  editorRef: React.RefObject<HTMLDivElement>;
  activeBlockId: string | null;
  selection: DT.DocumentSelection | null;
  isReady: boolean;
}

export interface ModelEditorActions {
  executeAction: (action: EditorAction) => void;
  formatText: (markType: DT.MarkType, attrs?: Record<string, any>) => void;
  setBlockType: (blockType: DT.NodeType, attrs?: Record<string, any>) => void;
  insertBlock: (block: DT.Node, position?: 'before' | 'after' | 'child') => void;
  deleteBlock: (blockId: string) => void;
  updateText: (blockId: string, path: number[], text: string) => void;
  getBlockById: (blockId: string) => DT.Node | null;
  getSelectedBlocks: () => DT.Node[];
  generateBlockId: () => string;
  forceHtmlUpdate: (newHtml: string) => void;
}

export function useModelEditor(initialContent: string, onChange: (content: string) => void): [ModelEditorState, ModelEditorActions] {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [model, setModel] = useState<DT.Doc>(() => htmlToModel(initialContent));
  const [html, setHtml] = useState(initialContent);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [selection, setSelection] = useState<DT.DocumentSelection | null>(null);
  
  const syncRef = useRef<DocumentSync | null>(null);
  
  useEffect(() => {
    if (editorRef.current) {
      // Initialize document sync
      syncRef.current = new DocumentSync(
        editorRef,
        initialContent,
        (newModel) => {
          setModel(newModel);
          const newHtml = modelToHtml(newModel);
          onChange(newHtml);
        },
        (newHtml) => {
          setHtml(newHtml);
        }
      );
      
      syncRef.current.initialize();
      setIsReady(true);
      
      return () => {
        if (syncRef.current) {
          syncRef.current.disconnect();
        }
      };
    }
  }, [initialContent, onChange]);
  
  // Track active block and selection
  useEffect(() => {
    if (!isReady || !editorRef.current) return;
    
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      
      // Find the block element containing the selection
      const range = selection.getRangeAt(0);
      const blockElement = findBlockElement(range.startContainer);
      
      if (blockElement) {
        const blockId = blockElement.getAttribute('data-block-id');
        if (blockId) {
          setActiveBlockId(blockId);
        }
      }
      
      // Update model selection (simplified - would need more complex mapping in real implementation)
      const docSelection: DT.DocumentSelection = {
        anchorPath: [0, 0], // Placeholder path
        anchorOffset: selection.anchorOffset,
        focusPath: [0, 0], // Placeholder path
        focusOffset: selection.focusOffset
      };
      
      setSelection(docSelection);
    };
    
    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [isReady]);
  
  // Action handlers
  const executeAction = useCallback((action: EditorAction) => {
    if (syncRef.current) {
      syncRef.current.applyAction(action);
    }
  }, []);
  
  const formatText = useCallback((markType: DT.MarkType, attrs?: Record<string, any>) => {
    if (selection) {
      executeAction({
        type: 'toggle_mark',
        markType,
        selection,
        attrs
      });
    }
  }, [executeAction, selection]);
  
  const setBlockType = useCallback((blockType: DT.NodeType, attrs?: Record<string, any>) => {
    if (activeBlockId) {
      executeAction({
        type: 'set_block_type',
        blockType,
        blockId: activeBlockId,
        attrs
      });
    }
  }, [executeAction, activeBlockId]);
  
  const insertBlock = useCallback((block: DT.Node, position: 'before' | 'after' | 'child' = 'after') => {
    executeAction({
      type: 'insert_block',
      block,
      position,
      referenceBlockId: activeBlockId
    });
  }, [executeAction, activeBlockId]);
  
  const deleteBlock = useCallback((blockId: string) => {
    executeAction({
      type: 'delete_block',
      blockId
    });
  }, [executeAction]);
  
  const updateText = useCallback((blockId: string, path: number[], text: string) => {
    executeAction({
      type: 'update_text',
      blockId,
      path,
      text
    });
  }, [executeAction]);
  
  // Helper functions
  const getBlockById = useCallback((blockId: string): DT.Node | null => {
    // Simple implementation - in reality would need recursive search
    const findBlockRecursive = (nodes: (DT.Node | DT.TextNode)[] | undefined): DT.Node | null => {
      if (!nodes) return null;
      
      for (const node of nodes) {
        if ('blockId' in node && node.blockId === blockId) {
          return node as DT.Node;
        }
        
        if ('content' in node && node.content) {
          const result = findBlockRecursive(node.content);
          if (result) return result;
        }
      }
      
      return null;
    };
    
    return findBlockRecursive(model.content);
  }, [model]);
  
  const getSelectedBlocks = useCallback((): DT.Node[] => {
    // Simplified - would need to use selection to find actual blocks
    if (activeBlockId) {
      const block = getBlockById(activeBlockId);
      if (block) return [block];
    }
    return [];
  }, [activeBlockId, getBlockById]);
  
  const generateBlockId = useCallback(() => uuidv4(), []);
  
  // Force HTML update (useful for initial content or external changes)
  const forceHtmlUpdate = useCallback((newHtml: string) => {
    if (!syncRef.current) return;
    
    const newModel = htmlToModel(newHtml);
    syncRef.current.updateModel(newModel);
  }, []);
  
  const state: ModelEditorState = {
    model,
    html,
    editorRef,
    activeBlockId,
    selection,
    isReady
  };
  
  const actions: ModelEditorActions = {
    executeAction,
    formatText,
    setBlockType,
    insertBlock,
    deleteBlock,
    updateText,
    getBlockById,
    getSelectedBlocks,
    generateBlockId,
    forceHtmlUpdate
  };
  
  return [state, actions];
}

// Helper function to find the closest block element
function findBlockElement(node: Node): HTMLElement | null {
  let current: Node | null = node;
  
  while (current && current.nodeType !== Node.ELEMENT_NODE) {
    current = current.parentNode;
  }
  
  if (!current) return null;
  
  let element = current as HTMLElement;
  
  while (element && !element.getAttribute('data-block-id')) {
    if (element.parentElement) {
      element = element.parentElement;
    } else {
      return null;
    }
  }
  
  return element;
}

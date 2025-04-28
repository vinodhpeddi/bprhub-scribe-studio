
import { useCallback } from 'react';
import * as DT from '@/utils/editor/model/documentTypes';
import { EditorAction } from '@/utils/editor/model/documentSync';
import { v4 as uuidv4 } from 'uuid';

export function useModelActions(
  syncRef: React.MutableRefObject<import('@/utils/editor/model/documentSync').DocumentSync | null>,
  selection: DT.DocumentSelection | null,
  activeBlockId: string | null,
  model: DT.Doc
) {
  // Execute an editor action using the DocumentSync
  const executeAction = useCallback((action: EditorAction) => {
    if (syncRef.current) {
      syncRef.current.applyAction(action);
    }
  }, [syncRef]);
  
  // Apply formatting to selected text
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
  
  // Change the type of the active block
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
  
  // Insert a new block
  const insertBlock = useCallback((block: DT.Node, position: 'before' | 'after' | 'child' = 'after') => {
    executeAction({
      type: 'insert_block',
      block,
      position,
      referenceBlockId: activeBlockId
    });
  }, [executeAction, activeBlockId]);
  
  // Delete a block by ID
  const deleteBlock = useCallback((blockId: string) => {
    executeAction({
      type: 'delete_block',
      blockId
    });
  }, [executeAction]);
  
  // Update text in a block
  const updateText = useCallback((blockId: string, path: number[], text: string) => {
    executeAction({
      type: 'update_text',
      blockId,
      path,
      text
    });
  }, [executeAction]);
  
  // Find a block by ID
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
  
  // Get selected blocks
  const getSelectedBlocks = useCallback((): DT.Node[] => {
    // Simplified - would need to use selection to find actual blocks
    if (activeBlockId) {
      const block = getBlockById(activeBlockId);
      if (block) return [block];
    }
    return [];
  }, [activeBlockId, getBlockById]);
  
  // Generate a new unique block ID
  const generateBlockId = useCallback(() => uuidv4(), []);
  
  // Force HTML update (useful for initial content or external changes)
  const forceHtmlUpdate = useCallback((newHtml: string) => {
    if (!syncRef.current) return;
    
    const newModel = require('@/utils/editor/model/htmlToModel').htmlToModel(newHtml);
    syncRef.current.updateModel(newModel);
  }, [syncRef]);
  
  return {
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
}


import { useState, useRef, useCallback, useEffect } from 'react';
import * as DT from '@/utils/editor/model/documentTypes';
import { DocumentSync } from '@/utils/editor/model/documentSync';
import { htmlToModel } from '@/utils/editor/model/htmlToModel';
import { modelToHtml } from '@/utils/editor/model/modelToHtml';
import { useModelSelection } from './useModelSelection';
import { useModelActions } from './useModelActions';
import { useModelSync } from './useModelSync';

export interface ModelEditorState {
  model: DT.Doc;
  html: string;
  editorRef: React.RefObject<HTMLDivElement>;
  activeBlockId: string | null;
  selection: DT.DocumentSelection | null;
  isReady: boolean;
}

export interface ModelEditorActions {
  executeAction: (action: import('@/utils/editor/model/documentSync').EditorAction) => void;
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
  
  // Use specialized hooks for selection and sync
  const { activeBlockId, selection, setActiveBlockId, setSelection } = useModelSelection();
  const { syncRef, initialize, disconnect, updateModel } = useModelSync(
    editorRef, 
    initialContent, 
    setModel, 
    setHtml, 
    setIsReady, 
    onChange
  );
  
  // Initialize the document sync on mount
  useEffect(() => {
    initialize();
    return disconnect;
  }, [initialize, disconnect]);
  
  // Get model actions
  const actions = useModelActions(syncRef, selection, activeBlockId, model);
  
  const state: ModelEditorState = {
    model,
    html,
    editorRef,
    activeBlockId,
    selection,
    isReady
  };
  
  return [state, actions];
}

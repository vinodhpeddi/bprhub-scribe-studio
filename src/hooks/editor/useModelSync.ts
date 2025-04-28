
import { useRef, useEffect, useCallback } from 'react';
import * as DT from '@/utils/editor/model/documentTypes';
import { DocumentSync } from '@/utils/editor/model/documentSync';
import { modelToHtml } from '@/utils/editor/model/modelToHtml';

export function useModelSync(
  editorRef: React.RefObject<HTMLDivElement>,
  initialContent: string,
  setModel: React.Dispatch<React.SetStateAction<DT.Doc>>,
  setHtml: React.Dispatch<React.SetStateAction<string>>,
  setIsReady: React.Dispatch<React.SetStateAction<boolean>>,
  onChange: (content: string) => void
) {
  const syncRef = useRef<DocumentSync | null>(null);
  
  const initialize = useCallback(() => {
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
    }
  }, [initialContent, onChange, editorRef, setModel, setHtml, setIsReady]);
  
  const disconnect = useCallback(() => {
    if (syncRef.current) {
      syncRef.current.disconnect();
    }
  }, []);
  
  const updateModel = useCallback((newModel: DT.Doc) => {
    if (syncRef.current) {
      syncRef.current.updateModel(newModel);
    }
  }, []);
  
  return {
    syncRef,
    initialize,
    disconnect,
    updateModel
  };
}

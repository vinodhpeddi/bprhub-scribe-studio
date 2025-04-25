
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDocumentState } from './document/useDocumentState';
import { useDocumentOperations } from './document/useDocumentOperations';
import { useRevisionOperations } from './document/useRevisionOperations';
import { useAutoSave } from './document/useAutoSave';

export function useDocument() {
  const location = useLocation();
  const state = useDocumentState();
  const { initializeNewDocument, handleDocumentSelect } = useDocumentOperations(state);
  const { saveDocumentRevision, viewRevision } = useRevisionOperations(state);
  const { setAutoSaveConfig } = useAutoSave(state);

  useEffect(() => {
    const existingDoc = location.state?.document;
    if (existingDoc) {
      handleDocumentSelect(existingDoc);
    } else {
      initializeNewDocument();
    }
  }, [location.state, handleDocumentSelect, initializeNewDocument]);

  // Set up auto-save if enabled
  useEffect(() => {
    if (state.autoSaveInterval && state.currentDocument?.id && !state.isViewingRevision) {
      if (state.autoSaveIntervalRef.current) {
        clearInterval(state.autoSaveIntervalRef.current);
      }
      
      state.autoSaveIntervalRef.current = setInterval(() => {
        if (state.currentDocument) {
          saveRevisionOperation(
            state.currentDocument.id,
            state.contentRef.current,
            state.titleRef.current,
            true,
            `Auto-save at ${new Date().toLocaleTimeString()}`
          );
          toast.info("Document auto-saved");
        }
      }, state.autoSaveInterval * 60 * 1000);
    }

    return () => {
      if (state.autoSaveIntervalRef.current) {
        clearInterval(state.autoSaveIntervalRef.current);
      }
    };
  }, [state.autoSaveInterval, state.currentDocument?.id, state.isViewingRevision]);

  return {
    ...state,
    handleDocumentSelect,
    initializeNewDocument,
    saveDocumentRevision,
    viewRevision,
    setAutoSaveConfig
  };
}

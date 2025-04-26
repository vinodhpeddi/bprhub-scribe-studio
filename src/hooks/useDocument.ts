
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDocumentState } from './document/useDocumentState';
import { useDocumentOperations } from './document/useDocumentOperations';
import { useRevisionOperations } from './document/useRevisionOperations';
import { useAutoSave } from './document/useAutoSave';
import { saveRevision, getDocumentRevisions, performStorageCleanup } from '@/utils/documentStorage';
import { toast } from 'sonner';
import { finalizeDraft, saveDocument } from '@/utils/documentStorage';
import { UserDocument } from '@/utils/documentTypes';

export function useDocument() {
  const location = useLocation();
  const state = useDocumentState();
  const { initializeNewDocument, handleDocumentSelect } = useDocumentOperations(state);
  const { saveDocumentRevision, viewRevision } = useRevisionOperations(state);
  const { setAutoSaveConfig } = useAutoSave(state);

  useEffect(() => {
    const existingDoc = location.state?.document as UserDocument | undefined;
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
          try {
            console.log("Attempting auto-save with content size:", state.contentRef.current.length);
            const revision = saveRevision(
              state.currentDocument.id,
              state.contentRef.current,
              state.titleRef.current,
              true,
              `Auto-save at ${new Date().toLocaleTimeString()}`
            );
            console.log("Document auto-saved successfully, revision ID:", revision.id);
          } catch (error) {
            console.error("Auto-save failed, will attempt storage cleanup:", error);
            performStorageCleanup();
          }
        }
      }, state.autoSaveInterval * 60 * 1000);
    }

    return () => {
      if (state.autoSaveIntervalRef.current) {
        clearInterval(state.autoSaveIntervalRef.current);
      }
    };
  }, [state.autoSaveInterval, state.currentDocument?.id, state.isViewingRevision]);

  // Add missing document operations
  const handleSaveDocument = () => {
    if (!state.currentDocument) return;
    
    const updatedDocument = {
      ...state.currentDocument,
      content: state.contentRef.current,
      title: state.titleRef.current,
      lastModified: new Date().toISOString()
    };
    
    try {
      console.log("Saving document with content size:", updatedDocument.content.length);
      saveDocument(updatedDocument);
      state.setCurrentDocument(updatedDocument);
      toast.success("Document saved successfully");
      
      // After successful document save, also save a revision
      try {
        saveDocumentRevision(`Save at ${new Date().toLocaleTimeString()}`);
      } catch (error) {
        console.error('Failed to save revision after document save:', error);
        // Don't show error to user since the document itself was saved
      }
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error("Failed to save document. Storage quota may be exceeded.");
      
      // Try to free up storage
      performStorageCleanup();
    }
  };
  
  const handleFinalizeDocument = () => {
    if (!state.currentDocument?.isDraft) return;
    
    try {
      const finalizedDoc = finalizeDraft(state.currentDocument);
      if (finalizedDoc) {
        state.setCurrentDocument(finalizedDoc);
        toast.success("Document has been finalized");
      }
    } catch (error) {
      console.error('Error finalizing document:', error);
      toast.error("Failed to finalize document");
    }
  };
  
  const exitRevisionView = () => {
    if (!state.currentDocument) return;
    
    state.setIsViewingRevision(false);
    state.setCurrentRevision(null);
    state.setDocumentContent(state.contentRef.current);
    state.setDocumentTitle(state.titleRef.current);
    toast.info("Exited revision view");
  };
  
  const restoreRevision = (revisionId: string) => {
    if (!state.currentDocument) return;
    
    const revision = state.revisions.find(rev => rev.id === revisionId);
    if (!revision) return;
    
    state.contentRef.current = revision.content;
    state.titleRef.current = revision.title;
    state.setDocumentContent(revision.content);
    state.setDocumentTitle(revision.title);
    state.setIsViewingRevision(false);
    state.setCurrentRevision(null);
    
    // Save the document with the restored content
    handleSaveDocument();
    
    toast.success("Revision restored successfully");
  };
  
  const updateRevision = (revisionId: string, label: string, description?: string) => {
    if (!state.currentDocument) return;
    
    const updatedRevisions = state.revisions.map(rev => 
      rev.id === revisionId ? { ...rev, label, description } : rev
    );
    
    state.setRevisions(updatedRevisions);
    toast.success("Revision updated successfully");
  };

  return {
    ...state,
    handleDocumentSelect,
    initializeNewDocument,
    saveDocumentRevision,
    viewRevision,
    setAutoSaveConfig,
    handleSaveDocument,
    handleFinalizeDocument,
    exitRevisionView,
    restoreRevision,
    updateRevision
  };
}

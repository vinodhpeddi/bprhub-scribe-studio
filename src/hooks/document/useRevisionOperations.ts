
import { useCallback } from 'react';
import { saveRevision, getDocumentRevisions, updateRevisionLabel } from '@/utils/documentStorage';
import { toast } from 'sonner';

export function useRevisionOperations(state: ReturnType<typeof import('./useDocumentState').useDocumentState>) {
  const saveDocumentRevision = useCallback((label?: string, description?: string) => {
    if (!state.currentDocument) {
      toast.error('No document to create revision for');
      return;
    }
    
    try {
      console.log("Saving revision with content size:", state.contentRef.current.length);
      const revision = saveRevision(
        state.currentDocument.id,
        state.contentRef.current,
        state.titleRef.current,
        false,
        label || `Manual revision at ${new Date().toLocaleTimeString()}`,
        description
      );
      
      const docRevisions = getDocumentRevisions(state.currentDocument.id);
      state.setRevisions(docRevisions);
      
      toast.success('Revision saved successfully');
      return revision;
    } catch (error) {
      console.error('Error saving revision:', error);
      toast.error('Failed to save revision');
      return null;
    }
  }, [state]);

  const viewRevision = useCallback((revisionId: string) => {
    if (!state.currentDocument) {
      toast.error('No active document');
      return;
    }
    
    const revision = getDocumentRevisions(state.currentDocument.id)
      .find(rev => rev.id === revisionId);
    
    if (!revision) {
      toast.error('Revision not found');
      return;
    }
    
    state.setCurrentRevision(revision);
    state.setIsViewingRevision(true);
    state.setDocumentTitle(revision.title);
    state.setDocumentContent(revision.content);
    
    toast.info(`Viewing revision from ${new Date(revision.timestamp).toLocaleString()}`);
  }, [state]);

  const updateRevision = useCallback((revisionId: string, label: string, description?: string) => {
    if (!state.currentDocument) {
      toast.error('No active document');
      return;
    }
    
    try {
      updateRevisionLabel(state.currentDocument.id, revisionId, label, description);
      
      // Update the local state
      const updatedRevisions = state.revisions.map(rev => 
        rev.id === revisionId ? { ...rev, label, description: description || rev.description } : rev
      );
      state.setRevisions(updatedRevisions);
      
      toast.success('Revision updated successfully');
    } catch (error) {
      console.error('Error updating revision:', error);
      toast.error('Failed to update revision');
    }
  }, [state]);

  return {
    saveDocumentRevision,
    viewRevision,
    updateRevision
  };
}
